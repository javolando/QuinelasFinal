from fastapi import Depends, Cookie, Header, HTTPException, status, Request
from typing import Optional, Dict, Any
from ..core.settings import settings
from ..core.security import decode_token
from ..core.db import col
from ..core.utils import oid, clean_mongo

async def get_current_user(
    request: Request,
    access_token: Optional[str] = Cookie(default=None, alias="access_token"),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
):
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("No subject")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await col("users").find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return clean_mongo(user)

def require_admin(user: Dict[str, Any] = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
