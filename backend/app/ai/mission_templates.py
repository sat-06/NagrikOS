"""Deterministic mission templates."""

from typing import Any, Dict, List, Optional

MISSION_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "healthcare_support": {
        "title": "Get healthcare support",
        "category": "healthcare",
        "steps": [
            {"title": "Identify eligible health schemes", "action_type": "research", "order": 1},
            {"title": "Gather identity and income proof", "action_type": "document", "related_document": "identity_proof", "order": 2},
            {"title": "Check hospital empanelment list", "action_type": "verify", "order": 3},
            {"title": "Submit application or enroll", "action_type": "apply", "order": 4},
            {"title": "Track application status", "action_type": "track", "order": 5},
        ],
    },
    "education_support": {
        "title": "Find education assistance",
        "category": "education",
        "steps": [
            {"title": "List matching scholarships", "action_type": "research", "order": 1},
            {"title": "Collect academic records", "action_type": "document", "related_document": "education_documents", "order": 2},
            {"title": "Prepare income certificate if required", "action_type": "document", "related_document": "income_certificate", "order": 3},
            {"title": "Apply before deadline", "action_type": "apply", "order": 4},
        ],
    },
    "document_preparation": {
        "title": "Prepare documents for a service",
        "category": "identity/certificates",
        "steps": [
            {"title": "Review required documents list", "action_type": "research", "order": 1},
            {"title": "Upload available documents to DocReady", "action_type": "document", "order": 2},
            {"title": "Apply for missing certificates", "action_type": "apply", "order": 3},
            {"title": "Run readiness check", "action_type": "verify", "order": 4},
        ],
    },
    "employment_support": {
        "title": "Explore employment support",
        "category": "employment",
        "steps": [
            {"title": "Identify relevant employment schemes", "action_type": "research", "order": 1},
            {"title": "Update resume and skill profile", "action_type": "prepare", "order": 2},
            {"title": "Register on employment portal if needed", "action_type": "apply", "order": 3},
            {"title": "Track applications", "action_type": "track", "order": 4},
        ],
    },
    "general_civic": {
        "title": "Civic action mission",
        "category": "general",
        "steps": [
            {"title": "Clarify your goal", "action_type": "research", "order": 1},
            {"title": "Find relevant services", "action_type": "research", "order": 2},
            {"title": "Complete required documents", "action_type": "document", "order": 3},
            {"title": "Take next official action", "action_type": "apply", "order": 4},
        ],
    },
}


def get_mission_template(template_key: Optional[str] = None, intent: Optional[str] = None) -> Dict[str, Any]:
    key = template_key or intent or "general_civic"
    if key not in MISSION_TEMPLATES:
        key = "general_civic"
    return MISSION_TEMPLATES[key]


def build_steps_from_template(template: Dict[str, Any]) -> List[Dict[str, Any]]:
    return template.get("steps", [])
