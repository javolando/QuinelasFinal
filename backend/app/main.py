from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.settings import settings
from .core.db import col
from .core.security import hash_password

from .routers import auth, jornadas, bets, friends, admin, stats

app = FastAPI(title="Quiniela Pro API", version="1.0.0")

# Configure CORS. If CORS_ORIGINS is "*" we disable credentials (browsers
# forbid Access-Control-Allow-Origin: * together with Access-Control-Allow-Credentials: true).
allow_origins = settings.cors_origins_list
allow_credentials = True
if "*" in allow_origins:
    allow_origins = ["*"]
    allow_credentials = False

print("CORS allowed origins:", allow_origins, "allow_credentials=", allow_credentials)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jornadas.router)
app.include_router(bets.router)
app.include_router(friends.router)
app.include_router(stats.router)
app.include_router(admin.router)

@app.on_event("startup")
async def seed_admin():
    # Create default admin if missing
    username = settings.ADMIN_USERNAME
    pwd = settings.ADMIN_PASSWORD
    email = (settings.ADMIN_EMAIL or f"{username}@local.com").strip()

    # Si ya hay un admin, actualiza el email si hiciera falta.
    existing_admin = await col("users").find_one({"role": "admin"})
    if existing_admin and existing_admin.get("email") != email:
        await col("users").update_one({"_id": existing_admin["_id"]}, {"$set": {"email": email}})
        return

    existing = await col("users").find_one({"email": email})
    if not existing:
        doc = {
            "email": email,
            "name": "Administrator",
            "passwordHash": hash_password(pwd),
            "role": "admin",
            "createdAt": __import__("datetime").datetime.utcnow().isoformat(),
        }
        await col("users").insert_one(doc)
