"""Secure file upload utilities."""

import re
import uuid
from pathlib import Path

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".txt"}
ALLOWED_MIME_PREFIXES = ("image/", "application/pdf", "text/plain")


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    name = re.sub(r"[^\w.\-]", "_", name)
    return name[:200] if name else "upload"


def generate_stored_filename(original: str) -> str:
    ext = Path(original).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".bin"
    return f"{uuid.uuid4().hex}{ext}"


def is_allowed_extension(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def safe_join(base: Path, stored_filename: str) -> Path:
    base = base.resolve()
    candidate = (base / stored_filename).resolve()
    if not str(candidate).startswith(str(base)):
        raise ValueError("Path traversal detected")
    return candidate
