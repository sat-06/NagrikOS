"""Drishti complaint service."""

from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.complaint import (
    Complaint,
    ComplaintStatus,
    ComplaintSupporter,
    ComplaintTimelineEvent,
    ResolutionVerification,
    TimelineEventType,
)
from app.schemas.complaint import ComplaintCreateRequest, DuplicateCandidate
from app.utils.geo import haversine_km
from app.utils.text_similarity import cosine_similarity_tfidf, jaccard_similarity


class ComplaintService:
    def __init__(self, db: Session):
        self.db = db

    def find_duplicates(
        self,
        description: str,
        category: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        days_window: int = 30,
        limit: int = 10,
    ) -> List[DuplicateCandidate]:
        since = datetime.utcnow() - timedelta(days=days_window)
        complaints = (
            self.db.query(Complaint)
            .filter(
                Complaint.is_confirmed.is_(True),
                Complaint.created_at >= since,
                Complaint.category == category,
            )
            .all()
        )

        candidates: List[DuplicateCandidate] = []
        for c in complaints:
            text_sim = max(
                jaccard_similarity(description, c.description),
                cosine_similarity_tfidf(description, c.description),
            )
            dist_km = None
            geo_score = 0.0
            if latitude is not None and longitude is not None and c.latitude and c.longitude:
                dist_km = haversine_km(latitude, longitude, c.latitude, c.longitude)
                if dist_km <= 0.5:
                    geo_score = 1.0
                elif dist_km <= 2.0:
                    geo_score = 0.6
                elif dist_km <= 5.0:
                    geo_score = 0.3

            combined = 0.7 * text_sim + 0.3 * geo_score
            if combined < 0.25:
                continue

            supporter_count = len(c.supporters) + 1
            explanation_parts = [f"Text similarity: {text_sim:.0%}"]
            if dist_km is not None:
                explanation_parts.append(f"Distance: {dist_km:.2f} km")
            candidates.append(
                DuplicateCandidate(
                    complaint_id=c.id,
                    title=c.title,
                    description=c.description[:300],
                    category=c.category,
                    similarity_score=round(combined * 100, 1),
                    distance_km=round(dist_km, 3) if dist_km is not None else None,
                    supporter_count=supporter_count,
                    created_at=c.created_at,
                    explanation="; ".join(explanation_parts),
                )
            )

        candidates.sort(key=lambda x: x.similarity_score, reverse=True)
        return candidates[:limit]

    def create_complaint(self, user_id: int, data: ComplaintCreateRequest) -> Complaint:
        if not data.user_confirmed:
            raise ValueError("User must confirm complaint submission")

        if data.join_existing_id:
            return self.join_existing(user_id, data.join_existing_id)

        complaint = Complaint(
            user_id=user_id,
            title=data.title,
            description=data.description,
            category=data.category,
            severity=data.severity,
            suggested_department=data.suggested_department,
            latitude=data.latitude,
            longitude=data.longitude,
            address=data.address,
            ai_draft=data.ai_draft,
            status=ComplaintStatus.REPORTED.value,
            is_confirmed=True,
        )
        self.db.add(complaint)
        self.db.flush()

        self._add_timeline(complaint, TimelineEventType.REPORTED.value, ComplaintStatus.REPORTED.value, "Complaint submitted by citizen")
        self._add_timeline(complaint, TimelineEventType.AI_CLASSIFIED.value, ComplaintStatus.AI_CLASSIFIED.value, "AI/rule classification applied")
        self._add_timeline(complaint, TimelineEventType.ROUTED.value, ComplaintStatus.ROUTED.value, f"Routed to {data.suggested_department or 'General Grievance Cell'}")

        supporter = ComplaintSupporter(complaint_id=complaint.id, user_id=user_id)
        self.db.add(supporter)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def join_existing(self, user_id: int, complaint_id: int) -> Complaint:
        complaint = self.db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise ValueError("Complaint not found")

        existing = (
            self.db.query(ComplaintSupporter)
            .filter(ComplaintSupporter.complaint_id == complaint_id, ComplaintSupporter.user_id == user_id)
            .first()
        )
        if existing:
            raise ValueError("You have already joined this issue")

        self.db.add(ComplaintSupporter(complaint_id=complaint_id, user_id=user_id))
        self._add_timeline(complaint, TimelineEventType.NOTE.value, complaint.status, f"Citizen {user_id} joined this issue")
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def list_user_complaints(self, user_id: int) -> List[Complaint]:
        joined_ids = [
            s.complaint_id
            for s in self.db.query(ComplaintSupporter).filter(ComplaintSupporter.user_id == user_id).all()
        ]
        own = self.db.query(Complaint).filter(Complaint.user_id == user_id).all()
        joined = self.db.query(Complaint).filter(Complaint.id.in_(joined_ids)).all() if joined_ids else []
        seen = set()
        result = []
        for c in own + joined:
            if c.id not in seen:
                seen.add(c.id)
                result.append(c)
        return sorted(result, key=lambda x: x.created_at, reverse=True)

    def get_complaint(self, complaint_id: int, user_id: int) -> Optional[Complaint]:
        c = self.db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not c:
            return None
        if c.user_id != user_id:
            supporter = (
                self.db.query(ComplaintSupporter)
                .filter(ComplaintSupporter.complaint_id == complaint_id, ComplaintSupporter.user_id == user_id)
                .first()
            )
            if not supporter:
                return None
        return c

    def add_resolution_verification(
        self, complaint: Complaint, user_id: int, action: str, note: Optional[str] = None
    ) -> ResolutionVerification:
        rv = ResolutionVerification(
            complaint_id=complaint.id,
            user_id=user_id,
            action=action,
            note=note,
        )
        self.db.add(rv)
        if action == "confirmed":
            complaint.status = ComplaintStatus.RESOLVED.value
            self._add_timeline(complaint, TimelineEventType.RESOLVED.value, ComplaintStatus.RESOLVED.value, note or "Citizen confirmed resolution")
        else:
            complaint.status = ComplaintStatus.IN_PROGRESS.value
            self._add_timeline(complaint, TimelineEventType.CITIZEN_VERIFICATION.value, ComplaintStatus.IN_PROGRESS.value, note or "Citizen disputed resolution")
        self.db.commit()
        self.db.refresh(rv)
        return rv

    def supporter_count(self, complaint: Complaint) -> int:
        return len(complaint.supporters)

    def _add_timeline(
        self, complaint: Complaint, event_type: str, status: str, note: Optional[str] = None
    ) -> None:
        event = ComplaintTimelineEvent(
            complaint_id=complaint.id,
            event_type=event_type,
            status=status,
            note=note,
        )
        self.db.add(event)
        complaint.status = status
