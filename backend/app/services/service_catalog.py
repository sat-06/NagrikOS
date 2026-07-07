"""Service layer for government schemes."""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.ai.rag import CivicKnowledgeRetriever
from app.models.service import ServiceScheme
from app.schemas.service import ServiceSchemeOut
from app.utils.json_helpers import from_json, parse_list


def scheme_to_out(s: ServiceScheme) -> ServiceSchemeOut:
    return ServiceSchemeOut(
        id=s.id,
        name=s.name,
        slug=s.slug,
        short_description=s.short_description,
        simplified_description=s.simplified_description,
        category=s.category,
        target_groups=parse_list(s.target_groups),
        state_applicability=parse_list(s.state_applicability),
        age_min=s.age_min,
        age_max=s.age_max,
        income_constraints=s.income_constraints,
        occupation_constraints=s.occupation_constraints,
        student_required=s.student_required,
        farmer_required=s.farmer_required,
        senior_citizen_required=s.senior_citizen_required,
        woman_required=s.woman_required,
        required_documents=parse_list(s.required_documents),
        benefits=parse_list(s.benefits),
        application_steps=parse_list(s.application_steps),
        official_source_url=s.official_source_url,
        source_title=s.source_title,
        source_metadata=from_json(s.source_metadata, {}),
        last_reviewed_at=s.last_reviewed_at,
        is_active=s.is_active,
        is_demo_data=s.is_demo_data,
    )


class ServiceCatalogService:
    def __init__(self, db: Session):
        self.db = db
        self.retriever = CivicKnowledgeRetriever(db)

    def list_services(
        self,
        category: Optional[str] = None,
        state: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[ServiceSchemeOut], int]:
        schemes = self.retriever.keyword_search("", category=category, state=state, limit=1000)
        total = len(schemes)
        items = [scheme_to_out(s) for s in schemes[skip : skip + limit]]
        return items, total

    def search(self, q: str, category: Optional[str] = None, state: Optional[str] = None) -> List[ServiceSchemeOut]:
        schemes = self.retriever.keyword_search(q, category=category, state=state)
        return [scheme_to_out(s) for s in schemes]

    def get_by_slug(self, slug: str) -> Optional[ServiceSchemeOut]:
        s = self.db.query(ServiceScheme).filter(ServiceScheme.slug == slug, ServiceScheme.is_active.is_(True)).first()
        return scheme_to_out(s) if s else None

    def get_by_id(self, service_id: int) -> Optional[ServiceSchemeOut]:
        s = self.db.query(ServiceScheme).filter(ServiceScheme.id == service_id, ServiceScheme.is_active.is_(True)).first()
        return scheme_to_out(s) if s else None
