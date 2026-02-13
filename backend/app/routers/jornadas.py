from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from ..core.db import col
from ..core.utils import clean_mongo, oid
from ..schemas.jornadas import JornadaCreate, JornadaOut
from ..deps.auth import get_current_user

router = APIRouter(prefix="/jornadas", tags=["jornadas"])

@router.get("", response_model=list[JornadaOut])
async def list_jornadas(
    type: Optional[str] = None,
    official: Optional[bool] = None,
    user=Depends(get_current_user)
):
    q = {}
    if type:
        q["type"] = type
    if official is not None:
        q["isOfficial"] = official

    docs = await (
        col("jornadas")
        .find(q)
        .sort("_id", -1)
        .to_list(5)
    )

    return [clean_mongo(d) for d in docs]

@router.post("", response_model=JornadaOut)
async def create_jornada(payload: JornadaCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    # enforce rules: admin can set isOfficial true, users forced false
    if user["role"] == "admin":
        doc["isOfficial"] = bool(payload.isOfficial)
    else:
        doc["isOfficial"] = False

    doc["createdBy"] = user["id"]
    doc["resultsQuiniela"] = None
    doc["resultsQuinigol"] = None
    doc["prizeTableQuiniela"] = None
    doc["prizeTableQuinigol"] = None
    doc["createdAt"] = __import__("datetime").datetime.utcnow().isoformat()

    res = await col("jornadas").insert_one(doc)
    doc["_id"] = res.inserted_id
    return clean_mongo(doc)

@router.get("/{jornada_id}", response_model=JornadaOut)
async def get_jornada(jornada_id: str, user=Depends(get_current_user)):
    j = await col("jornadas").find_one({"_id": oid(jornada_id)})
    if not j:
        raise HTTPException(status_code=404, detail="Not found")

    j = clean_mongo(j)
    if user["role"] != "admin" and (not j.get("isOfficial") and j.get("createdBy") != user["id"]):
        raise HTTPException(status_code=403, detail="Forbidden")
    return j
