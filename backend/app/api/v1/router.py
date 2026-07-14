"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1 import auth, chat, complaints, documents, missions, profile, recommendations, services, stats

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(services.router)
api_router.include_router(recommendations.router)
api_router.include_router(chat.router)
api_router.include_router(missions.router)
api_router.include_router(documents.router)
api_router.include_router(complaints.router)
api_router.include_router(stats.router)
