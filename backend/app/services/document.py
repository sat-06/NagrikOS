"""DocReady document service."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.document import UserDocument
from app.models.service import ServiceScheme
from app.schemas.document import DocumentReadinessItem, ReadinessResponse
from app.services.service_catalog import scheme_to_out
from app.utils.files import (
    generate_stored_filename,
    is_allowed_extension,
    safe_join,
    sanitize_filename,
)
from app.utils.json_helpers import from_json, parse_list, to_json

logger = logging.getLogger(__name__)

DOCUMENT_TYPE_ALIASES = {
    "aadhaar": "identity_proof",
    "pan": "identity_proof",
    "identity": "identity_proof",
    "income": "income_certificate",
    "domicile": "domicile_certificate",
    "residence": "domicile_certificate",
    "age": "age_proof",
    "education": "education_documents",
    "marksheet": "education_documents",
}


def normalize_doc_type(doc_type: str) -> str:
    dt = doc_type.lower().strip().replace(" ", "_")
    return DOCUMENT_TYPE_ALIASES.get(dt, dt)


def extract_text_fallback(file_path: Path, mime_type: Optional[str]) -> Dict[str, Any]:
    meta: Dict[str, Any] = {"extraction_method": "fallback"}
    try:
        if mime_type == "application/pdf" or str(file_path).endswith(".pdf"):
            from pypdf import PdfReader

            reader = PdfReader(str(file_path))
            text = " ".join(page.extract_text() or "" for page in reader.pages[:3])
            meta["text_length"] = len(text)
            meta["has_text"] = bool(text.strip())
        elif mime_type and mime_type.startswith("text/"):
            text = file_path.read_text(encoding="utf-8", errors="ignore")[:2000]
            meta["text_length"] = len(text)
            meta["has_text"] = bool(text.strip())
        else:
            meta["note"] = "Binary file stored; no text extraction"
    except Exception as e:
        logger.warning("Text extraction failed: %s", e)
        meta["extraction_error"] = "Could not extract text"
    return meta


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()
        self.upload_dir = Path(self.settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def upload(self, user_id: int, document_type: str, file: UploadFile) -> UserDocument:
        if not file.filename or not is_allowed_extension(file.filename):
            raise ValueError("Invalid file type. Allowed: pdf, jpg, jpeg, png, webp, txt")

        content = await file.read()
        if len(content) > self.settings.MAX_UPLOAD_SIZE:
            raise ValueError(f"File exceeds max size of {self.settings.MAX_UPLOAD_SIZE} bytes")

        original = sanitize_filename(file.filename)
        stored = generate_stored_filename(original)
        path = safe_join(self.upload_dir, stored)
        path.write_bytes(content)

        doc_type = normalize_doc_type(document_type)
        extracted = extract_text_fallback(path, file.content_type)

        doc = UserDocument(
            user_id=user_id,
            document_type=doc_type,
            original_filename=original,
            stored_filename=stored,
            file_path=str(path),
            mime_type=file.content_type,
            file_size=len(content),
            extracted_metadata=to_json(extracted),
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def list_documents(self, user_id: int) -> List[UserDocument]:
        return self.db.query(UserDocument).filter(UserDocument.user_id == user_id).order_by(
            UserDocument.created_at.desc()
        ).all()

    def get_document(self, doc_id: int, user_id: int) -> Optional[UserDocument]:
        return (
            self.db.query(UserDocument)
            .filter(UserDocument.id == doc_id, UserDocument.user_id == user_id)
            .first()
        )

    def delete_document(self, doc: UserDocument) -> None:
        try:
            Path(doc.file_path).unlink(missing_ok=True)
        except OSError:
            pass
        self.db.delete(doc)
        self.db.commit()

    def readiness_check(self, user_id: int, service_id: int) -> Optional[ReadinessResponse]:
        service = self.db.query(ServiceScheme).filter(ServiceScheme.id == service_id).first()
        if not service:
            return None

        required = [normalize_doc_type(d) for d in parse_list(service.required_documents)]
        user_docs = self.list_documents(user_id)
        available_types = {d.document_type for d in user_docs}

        available_items: List[DocumentReadinessItem] = []
        missing: List[str] = []
        uncertain: List[str] = []

        for req in required:
            if req in available_types:
                available_items.append(
                    DocumentReadinessItem(
                        document_type=req,
                        status="available",
                        notes="Document uploaded — readiness guidance only, not official verification",
                    )
                )
            else:
                partial = any(req in d.document_type or d.document_type in req for d in user_docs)
                if partial:
                    uncertain.append(req)
                    available_items.append(
                        DocumentReadinessItem(
                            document_type=req,
                            status="uncertain",
                            notes="Similar document type found; verify it meets scheme requirements",
                        )
                    )
                else:
                    missing.append(req)

        total = len(required) if required else 1
        ready_count = len([a for a in available_items if a.status == "available"])
        pct = round((ready_count / total) * 100, 1) if required else 100.0

        next_actions = []
        if missing:
            next_actions.append(f"Obtain or upload: {', '.join(missing)}")
        if uncertain:
            next_actions.append(f"Verify uncertain documents: {', '.join(uncertain)}")
        if pct == 100:
            next_actions.append("Run official verification before applying")
        else:
            next_actions.append("Add missing documents as mission steps for tracking")

        svc_out = scheme_to_out(service)
        return ReadinessResponse(
            service_id=service.id,
            service_name=svc_out.name,
            available_documents=available_items,
            missing_documents=missing,
            uncertain_documents=uncertain,
            readiness_percentage=pct,
            next_actions=next_actions,
        )
