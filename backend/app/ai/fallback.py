"""Deterministic AI fallbacks when provider unavailable."""

import re
from typing import Any, Dict, List, Optional, Tuple

HINDI_MARKERS = {"है", "में", "के", "की", "को", "से", "और", "मुझे", "मेरी", "मेरा"}
MARATHI_MARKERS = {"आहे", "मला", "साठी", "काय", "तुम्ही", "माझी", "माझा", "नाही"}


def detect_language(text: str) -> str:
    lower = text.lower()
    hi_score = sum(1 for m in HINDI_MARKERS if m in text)
    mr_score = sum(1 for m in MARATHI_MARKERS if m in text)
    if hi_score > mr_score and hi_score >= 1:
        return "hi"
    if mr_score > hi_score and mr_score >= 1:
        return "mr"
    if re.search(r"[\u0900-\u097F]", text):
        return "hi" if hi_score >= mr_score else "mr"
    return "en"


INTENT_KEYWORDS: Dict[str, List[str]] = {
    "healthcare_support": ["health", "hospital", "medical", "doctor", "treatment", "आरोग्य", "उपचार"],
    "education_support": ["education", "scholarship", "study", "college", "school", "engineering", "शिक्षा", "शिष्यवृत्ती"],
    "employment_support": ["job", "unemployed", "employment", "work", "नौकरी", "रोजगार"],
    "senior_citizen_support": ["elderly", "senior", "widow", "mother", "father", "वृद्ध", "माता", "वडील"],
    "agriculture_support": ["farmer", "crop", "agriculture", "शेत", "शेतकरी"],
    "housing_support": ["house", "housing", "home", "घर"],
    "women_support": ["woman", "women", "widow", "महिला"],
    "entrepreneurship": ["business", "startup", "enterprise", "व्यवसाय"],
    "document_guidance": ["document", "certificate", "कागद", "दस्तऐवज"],
}


def extract_intent(text: str) -> Optional[str]:
    lower = text.lower()
    scores: Dict[str, int] = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        scores[intent] = sum(1 for kw in keywords if kw in lower)
    if not scores:
        return "general_civic_guidance"
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general_civic_guidance"


def extract_age_mentions(text: str) -> List[int]:
    ages = []
    for m in re.finditer(r"\b(\d{1,3})\s*(?:years?\s*old|yrs?|वर्ष|वर्षांच)", text, re.I):
        ages.append(int(m.group(1)))
    for m in re.finditer(r"\b(?:age|aged)\s*(?:is\s*)?(\d{1,3})\b", text, re.I):
        ages.append(int(m.group(1)))
    for m in re.finditer(r"\b(\d{2})\b", text):
        val = int(m.group(1))
        if 1 <= val <= 120:
            ages.append(val)
    return list(dict.fromkeys(ages))


INDIAN_STATES = [
    "maharashtra", "delhi", "karnataka", "tamil nadu", "gujarat", "rajasthan",
    "uttar pradesh", "west bengal", "kerala", "punjab", "bihar", "madhya pradesh",
]


def extract_location(text: str) -> Optional[str]:
    lower = text.lower()
    for state in INDIAN_STATES:
        if state in lower:
            return state.title()
    return None


def extract_life_situation(text: str) -> Dict[str, Any]:
    lang = detect_language(text)
    intent = extract_intent(text)
    ages = extract_age_mentions(text)
    location = extract_location(text)

    person_context = None
    lower = text.lower()
    if any(w in lower for w in ["mother", "माता", "आई"]):
        person_context = "mother"
    elif any(w in lower for w in ["father", "वडील", "पिता"]):
        person_context = "father"
    elif any(w in lower for w in ["daughter", "बेटी", "मुलगी"]):
        person_context = "daughter"
    elif any(w in lower for w in ["son", "बेटा", "मुलगा"]):
        person_context = "son"
    elif any(w in lower for w in ["widow", "विधवा"]):
        person_context = "widowed_person"

    income_context = "unknown"
    if any(w in lower for w in ["low income", "poor", "कमी उत्पन्न", "गरीब"]):
        income_context = "low_income_stated"

    categories_map = {
        "healthcare_support": ["healthcare", "senior citizen support"],
        "education_support": ["education"],
        "employment_support": ["employment"],
        "senior_citizen_support": ["healthcare", "senior citizens"],
        "agriculture_support": ["agriculture"],
        "housing_support": ["housing"],
        "women_support": ["women support"],
        "entrepreneurship": ["entrepreneurship"],
        "document_guidance": ["identity/certificates"],
    }
    relevant = categories_map.get(intent, ["general"])

    missing = []
    if not location:
        missing.append("state")
    if income_context == "unknown":
        missing.append("income_band")

    return {
        "intent": intent,
        "detected_language": lang,
        "person_context": person_context,
        "explicitly_known_ages": ages,
        "income_context": income_context,
        "location_mentioned": location,
        "relevant_categories": relevant,
        "missing_information": missing,
        "raw_summary": text[:500],
    }


def fallback_saathi_response(
    text: str,
    related_services: List[Dict[str, Any]],
) -> Dict[str, Any]:
    situation = extract_life_situation(text)
    lang = situation["detected_language"]
    intent = situation["intent"]

    answers = {
        "en": (
            "Based on what you shared, I can suggest relevant civic services and next steps. "
            "I have not verified official eligibility — please complete your profile and review matching schemes."
        ),
        "hi": (
            "आपने जो बताया, उसके आधार पर मैं प्रासंगिक सेवाएं और अगले कदम सुझा सकता हूँ। "
            "यह आधिकारिक पात्रता की पुष्टि नहीं है।"
        ),
        "mr": (
            "तुम्ही सांगितलेल्या माहितीवर आधारित, मी संबंधित सेवा आणि पुढील पावले सुचवू शकतो. "
            "हे अधिकृत पात्रतेची पुष्टी नाही."
        ),
    }
    answer = answers.get(lang, answers["en"])

    actions = [
        "Complete your citizen profile (state, income band)",
        "Review matched services in Opportunity Radar",
        "Start a Civic Mission to track your journey",
    ]
    if lang == "hi":
        actions = [
            "अपनी प्रोफ़ाइल पूरी करें (राज्य, आय स्तर)",
            "मिलती-जुलती सेवाएं देखें",
            "ट्रैकिंग के लिए Civic Mission शुरू करें",
        ]
    elif lang == "mr":
        actions = [
            "नागरिक प्रोफाइल पूर्ण करा",
            "जुळणाऱ्या सेवा पहा",
            "Civic Mission सुरू करा",
        ]

    return {
        "answer": answer,
        "detected_language": lang,
        "intent": intent,
        "life_situation": situation,
        "suggested_actions": actions,
        "related_services": related_services[:5],
        "sources": [{"type": "internal_knowledge_base", "note": "Demo scheme records"}],
        "confidence": 0.55,
        "uncertainty_notes": [
            "AI provider not configured or unavailable — using rule-based analysis",
            "Eligibility not verified",
        ],
        "disclaimer": (
            "AI Saathi provides guidance only. This is not official government advice or approval."
        ),
    }


COMPLAINT_KEYWORDS: Dict[str, List[str]] = {
    "pothole_road": ["pothole", "road", "street", "खड्डा", "रस्ता"],
    "garbage": ["garbage", "trash", "waste", "dump", "कचरा"],
    "streetlight": ["streetlight", "street light", "lamp", "दिवा"],
    "water_leakage": ["water", "leak", "pipe", "पाणी", "गळती"],
    "drainage": ["drain", "drainage", "sewage", "गटार"],
    "public_safety": ["safety", "crime", "accident", "danger", "सुरक्षा"],
}


def fallback_complaint_classification(description: str) -> Dict[str, Any]:
    lower = description.lower()
    scores = {cat: sum(1 for kw in kws if kw in lower) for cat, kws in COMPLAINT_KEYWORDS.items()}
    best = max(scores, key=scores.get) if any(scores.values()) else "other"
    if scores.get(best, 0) == 0:
        best = "other"

    severity = "medium"
    if any(w in lower for w in ["urgent", "danger", "severe", "emergency", "खतरनाक"]):
        severity = "high"
    elif any(w in lower for w in ["minor", "small", "थोडा"]):
        severity = "low"

    dept_map = {
        "pothole_road": "Municipal Roads Department",
        "garbage": "Sanitation Department",
        "streetlight": "Electrical Maintenance",
        "water_leakage": "Water Supply Department",
        "drainage": "Drainage & Sewerage",
        "public_safety": "Public Safety Cell",
        "other": "General Grievance Cell",
    }
    dept = dept_map.get(best, "General Grievance Cell")
    draft = (
        f"Subject: Civic issue report — {best.replace('_', ' ').title()}\n\n"
        f"Description: {description.strip()}\n\n"
        f"Requested action: Please inspect and resolve this issue at the earliest.\n"
        f"Suggested department: {dept}"
    )
    return {
        "predicted_category": best,
        "severity_suggestion": severity,
        "suggested_department": dept,
        "generated_draft": draft,
        "confidence": 0.6,
        "uncertainty_notes": ["Rule-based classification — please review before submitting"],
    }
