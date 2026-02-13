from pydantic import BaseModel, EmailStr
from typing import Literal, Optional

FriendStatus = Literal["pending", "accepted"]

class FriendRequestCreate(BaseModel):
    email: EmailStr

class FriendRequestOut(BaseModel):
    id: str
    userId: str
    friendUserId: str
    status: FriendStatus

class FriendAction(BaseModel):
    requestId: str
    action: Literal["accept", "reject"]

class LeaderboardEntry(BaseModel):
    userId: str
    name: str
    email: EmailStr
    totalSpent: float
    totalWon: float
    netBalance: float
    bets: int
