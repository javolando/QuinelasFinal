from fastapi import APIRouter, Depends, HTTPException
from ..deps.auth import require_admin
from ..core.db import col
from ..core.utils import oid, clean_mongo
from ..schemas.jornadas import JornadaResultsUpdate
from ..services.calc import calc_quiniela_hits, calc_quinigol_hits, prize_from_table

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/jornadas")
async def admin_list_jornadas(admin=Depends(require_admin)):
    cur = col("jornadas").find({}).sort([("season", -1), ("number", -1)])
    return [clean_mongo(x) async for x in cur]

@router.delete("/jornadas/{jornada_id}")
async def delete_jornada(jornada_id: str, admin=Depends(require_admin)):
    result = await col("jornadas").delete_one({"_id": oid(jornada_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Jornada no encontrada")

    # Opcional: borrar apuestas relacionadas
    await col("bets").delete_many({"jornadaId": jornada_id})

    return {"message": "Jornada eliminada correctamente"}

@router.put("/jornadas/{jornada_id}/results")
async def set_results_and_recalculate(jornada_id: str, payload: JornadaResultsUpdate, admin=Depends(require_admin)):
    j = await col("jornadas").find_one({"_id": oid(jornada_id)})
    if not j:
        raise HTTPException(status_code=404, detail="Jornada not found")

    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    await col("jornadas").update_one({"_id": oid(jornada_id)}, {"$set": update})
    j = await col("jornadas").find_one({"_id": oid(jornada_id)})

    # Recalculate all bets for this jornada (only those with official jornadaId)
    bets_cur = col("bets").find({"jornadaId": jornada_id})
    async for b in bets_cur:
        bet_update = {}
        prize = 0.0
        hits = 0

        if b.get("type") == "Quiniela" and j.get("resultsQuiniela"):
            hits = calc_quiniela_hits(b.get("selectionsQuiniela", []), j["resultsQuiniela"])
            prize = prize_from_table(hits, j.get("prizeTableQuiniela"))
        elif b.get("type") == "Quinigol" and j.get("resultsQuinigol"):
            hits = calc_quinigol_hits(b.get("selectionsQuinigol", []), j["resultsQuinigol"])
            prize = prize_from_table(hits, j.get("prizeTableQuinigol"))

        if (b.get("type") == "Quiniela" and j.get("resultsQuiniela")) or (b.get("type") == "Quinigol" and j.get("resultsQuinigol")):
            bet_update = {
                "hits": int(hits),
                "prizeEuro": float(prize),
                "netBalanceEuro": float(round(prize - float(b.get("costEuro", 0.0)), 2)),
                "status": "calculated",
                "calculatedAt": __import__("datetime").datetime.utcnow().isoformat()
            }
            await col("bets").update_one({"_id": b["_id"]}, {"$set": bet_update})

    return {"message": "results_saved_and_bets_recalculated"}
