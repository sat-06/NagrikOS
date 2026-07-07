"""NagrikOS FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.db.session import init_db
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI Civic Action Agent — Backend API",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)

    @app.get("/health", response_model=HealthResponse, tags=["Health"])
    def health_check():
        db_type = "sqlite" if settings.is_sqlite else "postgresql"
        return HealthResponse(
            status="ok",
            app=settings.APP_NAME,
            ai_enabled=settings.ai_enabled,
            database=db_type,
        )

    return app


app = create_app()
