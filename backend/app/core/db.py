from motor.motor_asyncio import AsyncIOMotorClient
from .settings import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.MONGO_DB]

def col(name: str):
    return db[name]
