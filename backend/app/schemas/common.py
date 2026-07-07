"""Common API response schemas."""

from typing import Any, Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
    extra: Optional[dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str = "1.0.0"
    ai_enabled: bool
    database: str
