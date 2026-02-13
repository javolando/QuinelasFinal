from fastapi import APIRouter, Depends, HTTPException
from ..deps.auth import get_current_user
from ..core.db import col
from ..core.utils import oid, clean_mongo
from ..schemas.friends import FriendRequestCreate, FriendAction

router = APIRouter(prefix="/friends", tags=["friends"])

@router.post("/request")
async def send_request(payload: FriendRequestCreate, user=Depends(get_current_user)):
    friend = await col("users").find_one({"email": payload.email.lower()})
    if not friend:
        raise HTTPException(status_code=404, detail="User not found")
    friend_id = str(friend["_id"])
    if friend_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    existing = await col("friendships").find_one({
        "$or": [
            {"userId": user["id"], "friendUserId": friend_id},
            {"userId": friend_id, "friendUserId": user["id"]},
        ]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Friend request already exists")

    doc = {"userId": user["id"], "friendUserId": friend_id, "status": "pending", "createdAt": __import__("datetime").datetime.utcnow().isoformat()}
    res = await col("friendships").insert_one(doc)
    doc["_id"] = res.inserted_id
    return clean_mongo(doc)

@router.get("/requests")
async def list_requests(user=Depends(get_current_user)):
    cur = col("friendships").find({"friendUserId": user["id"], "status": "pending"}).sort("createdAt", -1)
    reqs = []
    async for r in cur:
        u = await col("users").find_one({"_id": oid(r["userId"])})
        reqs.append({**clean_mongo(r), "from": {"id": str(u["_id"]), "name": u["name"], "email": u["email"]}})
    return reqs

@router.post("/action")
async def action(payload: FriendAction, user=Depends(get_current_user)):
    r = await col("friendships").find_one({"_id": oid(payload.requestId)})
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    if r["friendUserId"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    if payload.action == "accept":
        await col("friendships").update_one({"_id": oid(payload.requestId)}, {"$set": {"status": "accepted", "acceptedAt": __import__("datetime").datetime.utcnow().isoformat()}})
    else:
        await col("friendships").delete_one({"_id": oid(payload.requestId)})
    return {"message": "ok"}

@router.get("")
async def list_friends(user=Depends(get_current_user)):
    # accepted where user is either side
    cur = col("friendships").find({
        "status": "accepted",
        "$or": [{"userId": user["id"]}, {"friendUserId": user["id"]}]
    })
    friends = []
    async for f in cur:
        other_id = f["friendUserId"] if f["userId"] == user["id"] else f["userId"]
        u = await col("users").find_one({"_id": oid(other_id)})
        friends.append({"id": str(u["_id"]), "name": u["name"], "email": u["email"]})
    return friends

@router.get("/leaderboard")
async def leaderboard(user=Depends(get_current_user)):
    # Build set of ids: me + accepted friends
    ids = {user["id"]}
    cur = col("friendships").find({"status": "accepted", "$or": [{"userId": user["id"]}, {"friendUserId": user["id"]}]})
    async for f in cur:
        ids.add(f["userId"])
        ids.add(f["friendUserId"])

    entries = []
    for uid in ids:
        u = await col("users").find_one({"_id": oid(uid)})
        if not u:
            continue
        bets = [b async for b in col("bets").find({"userId": uid})]
        spent = sum(float(b.get("costEuro", 0.0)) for b in bets)
        won = sum(float(b.get("prizeEuro", 0.0)) for b in bets)
        net = sum(float(b.get("netBalanceEuro", 0.0)) for b in bets)
        entries.append({
            "userId": uid,
            "name": u["name"],
            "email": u["email"],
            "totalSpent": round(spent, 2),
            "totalWon": round(won, 2),
            "netBalance": round(net, 2),
            "bets": len(bets),
        })

    entries.sort(key=lambda x: x["netBalance"], reverse=True)
    return entries
