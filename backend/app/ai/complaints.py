"""Complaint AI classification."""

from typing import Any, Dict

from app.ai.fallback import fallback_complaint_classification
from app.ai.provider import get_ai_provider

COMPLAINT_SYSTEM = """Classify civic complaints for Indian municipalities.
Categories: pothole_road, garbage, streetlight, water_leakage, drainage, public_safety, other
Severity: low, medium, high
Return JSON: predicted_category, severity_suggestion, suggested_department, generated_draft, confidence (0-1), uncertainty_notes (array).
The draft must be professional complaint text for the citizen to review — do not submit automatically."""


class ComplaintAIService:
    def __init__(self) -> None:
        self.ai = get_ai_provider()

    async def analyze(self, description: str, address: str | None = None) -> Dict[str, Any]:
        if not self.ai.enabled:
            return fallback_complaint_classification(description)

        prompt = description
        if address:
            prompt += f"\nAddress: {address}"

        result = await self.ai.structured_json(COMPLAINT_SYSTEM, prompt)
        if result and result.get("predicted_category"):
            return {
                "predicted_category": result["predicted_category"],
                "severity_suggestion": result.get("severity_suggestion", "medium"),
                "suggested_department": result.get("suggested_department", "General Grievance Cell"),
                "generated_draft": result.get("generated_draft", description),
                "confidence": float(result.get("confidence", 0.7)),
                "uncertainty_notes": result.get("uncertainty_notes", []),
            }
        return fallback_complaint_classification(description)
