from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

class APIMessage(BaseModel):
    message: str

class Paging(BaseModel):
    total: int
    items: list

class ObjectIdStr(BaseModel):
    id: str

class TokenResponse(BaseModel):
    user: Dict[str, Any]
