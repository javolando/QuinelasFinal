from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "quiniela_pro"

    JWT_SECRET: str = "estaesunapaginawebcreadaporunprogrmadornovatoquebasicamentelaqueriahacerparavercuantogastabaenquinielas"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30

    COOKIE_NAME: str = "access_token"
    COOKIE_SECURE: bool = False

    CORS_ORIGINS: str = "http://localhost:5173"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "Chocodonut22"
    ADMIN_EMAIL: str = "admin@local.com"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
