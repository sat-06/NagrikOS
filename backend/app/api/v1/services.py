"""Services/schemes API routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.service import ServiceListResponse, ServiceSchemeOut
from app.services.service_catalog import ServiceCatalogService

router = APIRouter(prefix="/services", tags=["Services & Schemes"])


@router.get("", response_model=ServiceListResponse)
def list_services(
    category: Optional[str] = None,
    state: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    svc = ServiceCatalogService(db)
    items, total = svc.list_services(category=category, state=state, skip=skip, limit=limit)
    return ServiceListResponse(items=items, total=total)


@router.get("/search", response_model=ServiceListResponse)
def search_services(
    q: str = "",
    category: Optional[str] = None,
    state: Optional[str] = None,
    db: Session = Depends(get_db),
):
    svc = ServiceCatalogService(db)
    items = svc.search(q, category=category, state=state)
    return ServiceListResponse(items=items, total=len(items))


@router.get("/{slug}", response_model=ServiceSchemeOut)
def get_service(slug: str, db: Session = Depends(get_db)):
    svc = ServiceCatalogService(db)
    item = svc.get_by_slug(slug)
    if not item:
        raise HTTPException(status_code=404, detail="Service not found")
    return item
