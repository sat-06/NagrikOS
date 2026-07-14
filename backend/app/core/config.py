"""Application configuration."""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "NagrikOS"
    DEBUG: bool = False

    DATABASE_URL: str = ""
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:3000,"
        "https://nagrik-os.vercel.app"
    )

    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.openai.com/v1"
    AI_MODEL: str = "gpt-4o-mini"
    AI_TIMEOUT_SECONDS: int = 30

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return "sqlite:///./nagrikos.db"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        # Always add vercel.app wildcard for preview deployments
        origins.append("https://*.vercel.app")
        # Add common localhost ports
        origins.append("http://localhost:5173")
        origins.append("http://localhost:3000")
        origins.append("http://127.0.0.1:5173")
        origins.append("http://127.0.0.1:3000")
        # Deduplicate while preserving order
        seen = set()
        unique = []
        for o in origins:
            if o not in seen:
                seen.add(o)
                unique.append(o)
        return unique

    @property
    def ai_enabled(self) -> bool:
        return bool(self.AI_API_KEY and self.AI_API_KEY.strip())


@lru_cache
def get_settings() -> Settings:
    return Settings()
