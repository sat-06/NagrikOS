"""Documents API routes."""

import json
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.document import DocumentOut, ReadinessRequest, ReadinessResponse
from app.services.document import DocumentService
from app.utils.json_helpers import from_json

router = APIRouter(prefix="/documents", tags=["DocReady"])


def _doc_out(doc) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        document_type=doc.document_type,
        original_filename=doc.original_filename,
        mime_type=doc.mime_type,
        file_size=doc.file_size,
        extracted_metadata=from_json(doc.extracted_metadata, {}),
        created_at=doc.created_at,
    )


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = DocumentService(db)
    try:
        doc = await svc.upload(current_user.id, document_type, file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return _doc_out(doc)


@router.get("", response_model=List[DocumentOut])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    svc = DocumentService(db)
    return [_doc_out(d) for d in svc.list_documents(current_user.id)]


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = DocumentService(db)
    doc = svc.get_document(doc_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    svc.delete_document(doc)


@router.post("/readiness", response_model=ReadinessResponse)
def check_readiness(
    data: ReadinessRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = DocumentService(db)
    result = svc.readiness_check(current_user.id, data.service_id)
    if not result:
        raise HTTPException(status_code=404, detail="Service not found")
    return result
