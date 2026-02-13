from fastapi import APIRouter, HTTPException, Response, status, Depends
from pydantic import EmailStr
from ..core.db import col
from ..core.security import hash_password, verify_password, create_access_token
from ..core.settings import settings
from ..core.utils import clean_mongo, oid
from ..schemas.users import UserCreate, UserLogin
from ..schemas.common import APIMessage, TokenResponse
from ..deps.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(payload: UserCreate, response: Response):
    exists = await col("users").find_one({"email": payload.email.lower()})
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "email": payload.email.lower(),
        "name": payload.name.strip(),
        "passwordHash": hash_password(payload.password),
        "role": "user",
        "createdAt": __import__("datetime").datetime.utcnow().isoformat(),
    }
    res = await col("users").insert_one(doc)
    user_id = str(res.inserted_id)

    token = create_access_token(user_id, extra={"role": "user"})
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    user = clean_mongo({**doc, "_id": res.inserted_id})
    user.pop("passwordHash", None)
    return {"user": user}

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, response: Response):
    user = await col("users").find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]), extra={"role": user.get("role", "user")})
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )
    u = clean_mongo(user)
    u.pop("passwordHash", None)
    return {"user": u}

@router.post("/logout", response_model=APIMessage)
async def logout(response: Response):
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    return {"message": "ok"}

@router.get("/me", response_model=TokenResponse)
async def me(user=Depends(get_current_user)):
    u = dict(user)
    u.pop("passwordHash", None)
    return {"user": u}
