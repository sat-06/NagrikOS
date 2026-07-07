"""Complaints API routes."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.complaints import ComplaintAIService
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.complaint import (
    ComplaintAnalysisResponse,
    ComplaintAnalyzeRequest,
    ComplaintCreateRequest,
    ComplaintOut,
    DuplicateSearchRequest,
    DuplicateSearchResponse,
    JoinIssueResponse,
    ResolutionVerificationRequest,
    TimelineEventOut,
)
from app.services.complaint import ComplaintService

router = APIRouter(prefix="/complaints", tags=["Drishti Reports"])


def _complaint_out(complaint, svc: ComplaintService) -> ComplaintOut:
    return ComplaintOut(
        id=complaint.id,
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        severity=complaint.severity,
        suggested_department=complaint.suggested_department,
        status=complaint.status,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        address=complaint.address,
        supporter_count=svc.supporter_count(complaint),
        is_confirmed=complaint.is_confirmed,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        timeline=[TimelineEventOut.model_validate(e) for e in complaint.timeline_events],
    )


@router.post("/analyze", response_model=ComplaintAnalysisResponse)
async def analyze_complaint(
    data: ComplaintAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    ai = ComplaintAIService()
    result = await ai.analyze(data.description, data.address)
    return ComplaintAnalysisResponse(**result)


@router.post("/duplicates", response_model=DuplicateSearchResponse)
def search_duplicates(
    data: DuplicateSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ComplaintService(db)
    candidates = svc.find_duplicates(data.description, data.category, data.latitude, data.longitude)
    return DuplicateSearchResponse(candidates=candidates)


@router.post("", response_model=ComplaintOut, status_code=201)
def create_complaint(
    data: ComplaintCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.user_confirmed:
        raise HTTPException(status_code=400, detail="user_confirmed must be true to submit")
    svc = ComplaintService(db)
    try:
        complaint = svc.create_complaint(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _complaint_out(complaint, svc)


@router.get("", response_model=List[ComplaintOut])
def list_complaints(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = ComplaintService(db)
    complaints = svc.list_user_complaints(current_user.id)
    return [_complaint_out(c, svc) for c in complaints]


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ComplaintService(db)
    complaint = svc.get_complaint(complaint_id, current_user.id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return _complaint_out(complaint, svc)


@router.post("/{complaint_id}/join", response_model=JoinIssueResponse)
def join_issue(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ComplaintService(db)
    try:
        complaint = svc.join_existing(current_user.id, complaint_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return JoinIssueResponse(
        complaint_id=complaint.id,
        supporter_count=svc.supporter_count(complaint),
        message="Successfully joined existing issue",
    )


@router.get("/{complaint_id}/timeline", response_model=List[TimelineEventOut])
def get_timeline(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ComplaintService(db)
    complaint = svc.get_complaint(complaint_id, current_user.id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return [TimelineEventOut.model_validate(e) for e in complaint.timeline_events]


@router.post("/{complaint_id}/resolution", response_model=ComplaintOut)
def verify_resolution(
    complaint_id: int,
    data: ResolutionVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = ComplaintService(db)
    complaint = svc.get_complaint(complaint_id, current_user.id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    svc.add_resolution_verification(complaint, current_user.id, data.action, data.note)
    db.refresh(complaint)
    return _complaint_out(complaint, svc)
