from fastapi import APIRouter, Depends, HTTPException
from ..deps.auth import get_current_user
from ..core.db import col
from ..core.utils import oid, clean_mongo
from ..schemas.bets import BetCreate, BetOut, BetOverrideResults
from ..services.calc import quiniela_cost, calc_quiniela_hits, calc_quinigol_hits, prize_from_table

router = APIRouter(prefix="/bets", tags=["bets"])

@router.post("", response_model=BetOut)
async def create_bet(payload: BetCreate, user=Depends(get_current_user)):
    j = await col("jornadas").find_one({"_id": oid(payload.jornadaId)})
    if not j:
        raise HTTPException(status_code=404, detail="Jornada not found")

    doc = payload.model_dump()
    doc["userId"] = user["id"]
    doc["createdAt"] = __import__("datetime").datetime.utcnow().isoformat()
    doc["overrideResults"] = None

    # cost
    if payload.type == "Quiniela":
        if not payload.selectionsQuiniela:
            raise HTTPException(status_code=400, detail="selectionsQuiniela required")

        # Validación: 1..14 => picks; 15 => homeCat/awayCat
        sel_dump = [s.model_dump() for s in payload.selectionsQuiniela]
        for s in sel_dump:
            if s["n"] == 15:
                if not s.get("homeCat") or not s.get("awayCat"):
                    raise HTTPException(status_code=422, detail="Pleno al 15 requiere homeCat y awayCat (0/1/2/M)")
            else:
                if not s.get("picks"):
                    raise HTTPException(status_code=422, detail=f"Partido {s['n']} requiere picks (1/X/2)")

        combos, cost = quiniela_cost(sel_dump, float(payload.basePriceEuro or 0.75))
        doc["costEuro"] = cost
        doc["columns"] = combos
        doc["hits"] = 0
        doc["prizeEuro"] = 0.0
        doc["netBalanceEuro"] = -cost
        doc["status"] = "pending"
    else:
        if not payload.selectionsQuinigol:
            raise HTTPException(status_code=400, detail="selectionsQuinigol required")
        cost = float(payload.fixedPriceQuinigolEuro or 1.0)
        doc["costEuro"] = round(cost, 2)
        doc["hits"] = 0
        doc["prizeEuro"] = 0.0
        doc["netBalanceEuro"] = -doc["costEuro"]
        doc["status"] = "pending"

    # if official results exist, calculate immediately
    if payload.type == "Quiniela" and j.get("resultsQuiniela"):
        hits = calc_quiniela_hits([s.model_dump() for s in payload.selectionsQuiniela], j["resultsQuiniela"])
        prize = prize_from_table(hits, j.get("prizeTableQuiniela"))
        doc["hits"] = int(hits)
        doc["prizeEuro"] = float(prize)
        doc["netBalanceEuro"] = float(round(prize - doc["costEuro"], 2))
        doc["status"] = "calculated"

    if payload.type == "Quinigol" and j.get("resultsQuinigol"):
        hits = calc_quinigol_hits([s.model_dump() for s in payload.selectionsQuinigol], j["resultsQuinigol"])
        prize = prize_from_table(hits, j.get("prizeTableQuinigol"))
        doc["hits"] = int(hits)
        doc["prizeEuro"] = float(prize)
        doc["netBalanceEuro"] = float(round(prize - doc["costEuro"], 2))
        doc["status"] = "calculated"

    res = await col("bets").insert_one(doc)
    doc["_id"] = res.inserted_id
    return clean_mongo(doc)

@router.get("", response_model=list[BetOut])
async def my_bets(user=Depends(get_current_user), type: str | None = None, status: str | None = None):
    q = {"userId": user["id"]}
    if type:
        q["type"] = type
    if status:
        q["status"] = status
    cur = col("bets").find(q).sort("createdAt", -1)
    return [clean_mongo(x) async for x in cur]

@router.get("/{bet_id}", response_model=BetOut)
async def get_bet(bet_id: str, user=Depends(get_current_user)):
    b = await col("bets").find_one({"_id": oid(bet_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Not found")
    b = clean_mongo(b)
    if user["role"] != "admin" and b["userId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return b

@router.put("/{bet_id}/override-results", response_model=BetOut)
async def override_results(bet_id: str, payload: BetOverrideResults, user=Depends(get_current_user)):
    b = await col("bets").find_one({"_id": oid(bet_id)})
    if not b:
        raise HTTPException(status_code=404, detail="Bet not found")
    if b["userId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    j = await col("jornadas").find_one({"_id": oid(b["jornadaId"])})
    if not j:
        raise HTTPException(status_code=404, detail="Jornada not found")

    # Only allow override if official results are missing for that bet type
    if b["type"] == "Quiniela" and j.get("resultsQuiniela"):
        raise HTTPException(status_code=400, detail="Official results already exist")
    if b["type"] == "Quinigol" and j.get("resultsQuinigol"):
        raise HTTPException(status_code=400, detail="Official results already exist")

    override = payload.model_dump()
    hits = 0
    prize = 0.0

    if b["type"] == "Quiniela":
        if not override.get("resultsQuiniela"):
            raise HTTPException(status_code=400, detail="resultsQuiniela required")
        hits = calc_quiniela_hits(b.get("selectionsQuiniela", []), override["resultsQuiniela"])
        # if jornada has prize table set (admin may have set prizes without results), use it
        prize = prize_from_table(hits, j.get("prizeTableQuiniela"))
    else:
        if not override.get("resultsQuinigol"):
            raise HTTPException(status_code=400, detail="resultsQuinigol required")
        hits = calc_quinigol_hits(b.get("selectionsQuinigol", []), override["resultsQuinigol"])
        prize = prize_from_table(hits, j.get("prizeTableQuinigol"))

    update = {
        "overrideResults": override,
        "hits": int(hits),
        "prizeEuro": float(prize),
        "netBalanceEuro": float(round(prize - float(b.get("costEuro", 0.0)), 2)),
        "status": "calculated",
        "calculatedAt": __import__("datetime").datetime.utcnow().isoformat()
    }
    await col("bets").update_one({"_id": oid(bet_id)}, {"$set": update})
    b2 = await col("bets").find_one({"_id": oid(bet_id)})
    return clean_mongo(b2)

