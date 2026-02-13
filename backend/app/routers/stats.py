from fastapi import APIRouter, Depends
from ..deps.auth import get_current_user
from ..core.db import col

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/me")
async def my_stats(user=Depends(get_current_user)):
    bets = [b async for b in col("bets").find({"userId": user["id"]})]
    spent = sum(float(b.get("costEuro", 0.0)) for b in bets)
    won = sum(float(b.get("prizeEuro", 0.0)) for b in bets)
    net = sum(float(b.get("netBalanceEuro", 0.0)) for b in bets)

    quinielas = [b for b in bets if b.get("type") == "Quiniela"]
    quinigols = [b for b in bets if b.get("type") == "Quinigol"]

    avg_hits_q = round(sum(int(b.get("hits", 0)) for b in quinielas) / len(quinielas), 2) if quinielas else 0.0
    best_q = max((int(b.get("hits", 0)) for b in quinielas), default=0)
    pleno15 = sum(1 for b in quinielas if int(b.get("hits", 0)) >= 15)

    best_g = max((int(b.get("hits", 0)) for b in quinigols), default=0)

    return {
        "totalSpent": round(spent, 2),
        "totalWon": round(won, 2),
        "netBalance": round(net, 2),
        "totalBets": len(bets),
        "avgHitsQuiniela": avg_hits_q,
        "bestQuiniela": best_q,
        "pleno15": pleno15,
        "bestQuinigol": best_g,
        "byMonth": _by_month(bets)
    }


@router.get("/all")
async def all_stats(user=Depends(get_current_user)):
    """Stats agregadas (solo admin)."""
    if user.get("role") != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin only")
    bets = [b async for b in col("bets").find({})]
    spent = sum(float(b.get("costEuro", 0.0)) for b in bets)
    won = sum(float(b.get("prizeEuro", 0.0)) for b in bets)
    net = sum(float(b.get("netBalanceEuro", 0.0)) for b in bets)

    quinielas = [b for b in bets if b.get("type") == "Quiniela"]
    quinigols = [b for b in bets if b.get("type") == "Quinigol"]

    avg_hits_q = round(sum(int(b.get("hits", 0)) for b in quinielas) / len(quinielas), 2) if quinielas else 0.0
    best_q = max((int(b.get("hits", 0)) for b in quinielas), default=0)
    pleno15 = sum(1 for b in quinielas if int(b.get("hits", 0)) >= 15)
    best_g = max((int(b.get("hits", 0)) for b in quinigols), default=0)

    return {
        "totalSpent": round(spent, 2),
        "totalWon": round(won, 2),
        "netBalance": round(net, 2),
        "totalBets": len(bets),
        "avgHitsQuiniela": avg_hits_q,
        "bestQuiniela": best_q,
        "pleno15": pleno15,
        "bestQuinigol": best_g,
        "byMonth": _by_month(bets)
    }

def _by_month(bets):
    # group by YYYY-MM
    out = {}
    for b in bets:
        dt = b.get("createdAt", "")[:7] or "unknown"
        out.setdefault(dt, 0.0)
        out[dt] += float(b.get("netBalanceEuro", 0.0))
    keys = sorted(out.keys())
    return [{"month": k, "net": round(out[k], 2)} for k in keys]
