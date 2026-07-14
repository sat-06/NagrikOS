"""Simple lexical RAG for civic knowledge grounding."""

from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models.service import ServiceScheme
from app.utils.json_helpers import parse_list
from app.utils.text_similarity import cosine_similarity_tfidf, normalize_text


class CivicKnowledgeRetriever:
    def __init__(self, db: Session):
        self.db = db

    def _service_to_dict(self, s: ServiceScheme) -> Dict[str, Any]:
        return {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "category": s.category,
            "short_description": s.short_description,
            "simplified_description": s.simplified_description,
            "target_groups": parse_list(s.target_groups),
            "state_applicability": parse_list(s.state_applicability),
            "required_documents": parse_list(s.required_documents),
            "benefits": parse_list(s.benefits),
            "official_source_url": s.official_source_url,
            "source_title": s.source_title,
            "is_demo_data": s.is_demo_data,
        }

    def _corpus_text(self, s: ServiceScheme) -> str:
        parts = [
            s.name,
            s.short_description,
            s.simplified_description,
            s.category,
            " ".join(parse_list(s.target_groups)),
            " ".join(parse_list(s.benefits)),
        ]
        return normalize_text(" ".join(parts))

    def search(self, query: str, limit: int = 5, category: str | None = None) -> List[Dict[str, Any]]:
        q = self.db.query(ServiceScheme).filter(ServiceScheme.is_active.is_(True))
        if category:
            q = q.filter(ServiceScheme.category == category)
        schemes = q.all()
        if not schemes:
            return []

        scored = []
        for s in schemes:
            score = cosine_similarity_tfidf(query, self._corpus_text(s))
            if score > 0.01 or normalize_text(query) in self._corpus_text(s):
                item = self._service_to_dict(s)
                item["retrieval_score"] = round(score, 4)
                scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item for _, item in scored[:limit]]

    def get_by_ids(self, ids: List[int]) -> List[Dict[str, Any]]:
        if not ids:
            return []
        schemes = self.db.query(ServiceScheme).filter(ServiceScheme.id.in_(ids)).all()
        return [self._service_to_dict(s) for s in schemes]

    def keyword_search(
        self,
        query: str,
        category: str | None = None,
        state: str | None = None,
        limit: int = 20,
    ) -> List[ServiceScheme]:
        q = self.db.query(ServiceScheme).filter(ServiceScheme.is_active.is_(True))
        if category:
            q = q.filter(ServiceScheme.category == category)
        schemes = q.all()
        if state:
            state_lower = state.lower()
            schemes = [
                s for s in schemes
                if not parse_list(s.state_applicability)
                or "all india" in [x.lower() for x in parse_list(s.state_applicability)]
                or any(state_lower in x.lower() for x in parse_list(s.state_applicability))
            ]
        if not query:
            return schemes[:limit]
        tokens = set(normalize_text(query).split())
        scored = []
        for s in schemes:
            corpus = set(self._corpus_text(s).split())
            overlap = len(tokens & corpus)
            if overlap > 0 or normalize_text(query) in self._corpus_text(s):
                scored.append((overlap, s))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s for _, s in scored[:limit]] if scored else schemes[:limit]
