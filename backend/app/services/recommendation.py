"""Opportunity Radar — explainable service recommendations."""

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.service import ServiceScheme
from app.models.user import CitizenProfile
from app.schemas.recommendation import RecommendationItem
from app.schemas.service import ServiceSchemeOut
from app.services.service_catalog import scheme_to_out
from app.utils.age import calculate_age
from app.utils.json_helpers import parse_list

INCOME_ORDER = ["below_1l", "1l_to_3l", "3l_to_5l", "5l_to_10l", "above_10l", "unknown"]


def _income_compatible(profile_band: Optional[str], constraint: Optional[str]) -> Tuple[bool, bool]:
    if not constraint:
        return True, False
    if not profile_band:
        return True, True
    constraint_lower = constraint.lower()
    if "below" in constraint_lower and profile_band == "below_1l":
        return True, False
    if profile_band == "unknown":
        return True, True
    return True, False


def _state_matches(profile_state: Optional[str], applicability: List[str]) -> Tuple[bool, bool]:
    if not applicability or "all india" in [a.lower() for a in applicability]:
        return True, False
    if not profile_state:
        return True, True
    ps = profile_state.lower()
    match = any(ps in a.lower() or a.lower() in ps for a in applicability)
    if match:
        return True, False
    return False, False


def _profile_completeness(profile: Optional[CitizenProfile]) -> float:
    if not profile:
        return 0.0
    fields = [
        profile.full_name,
        profile.state,
        profile.district,
        profile.date_of_birth,
        profile.income_band,
        profile.occupation,
    ]
    filled = sum(1 for f in fields if f)
    return round((filled / len(fields)) * 100, 1)


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db

    def recommend(self, profile: Optional[CitizenProfile], limit: int = 10) -> Tuple[List[RecommendationItem], float]:
        schemes = self.db.query(ServiceScheme).filter(ServiceScheme.is_active.is_(True)).all()
        age = calculate_age(profile.date_of_birth) if profile and profile.date_of_birth else None
        items: List[RecommendationItem] = []

        for s in schemes:
            item = self._score_scheme(scheme_to_out(s), profile, age)
            items.append(item)

        items.sort(key=lambda x: x.match_score, reverse=True)
        completeness = _profile_completeness(profile)
        return items[:limit], completeness

    def explain(self, profile: Optional[CitizenProfile], service_id: int) -> Optional[RecommendationItem]:
        s = self.db.query(ServiceScheme).filter(ServiceScheme.id == service_id).first()
        if not s:
            return None
        age = calculate_age(profile.date_of_birth) if profile and profile.date_of_birth else None
        return self._score_scheme(scheme_to_out(s), profile, age)

    def _score_scheme(
        self,
        service: ServiceSchemeOut,
        profile: Optional[CitizenProfile],
        age: Optional[int],
    ) -> RecommendationItem:
        score = 50.0
        matched: List[str] = []
        uncertain: List[str] = []
        missing: List[str] = []
        mismatches: List[str] = []

        if not profile:
            missing.extend(["full profile", "state", "income_band", "age"])
            uncertain.append("No profile data — scores are indicative only")
            return RecommendationItem(
                service=service,
                match_score=min(score, 100),
                matched_criteria=matched,
                uncertain_criteria=uncertain,
                missing_information=missing,
                possible_mismatches=mismatches,
                explanation="Complete your profile for better matches.",
            )

        state_ok, state_uncertain = _state_matches(profile.state, service.state_applicability)
        if state_ok and not state_uncertain:
            score += 15
            matched.append("State/residency appears compatible")
        elif state_uncertain:
            uncertain.append("State not in profile — cannot confirm residency requirement")
            missing.append("state")
        else:
            score -= 20
            mismatches.append("State may not match scheme applicability")

        if age is not None:
            if service.age_min and age < service.age_min:
                score -= 25
                mismatches.append(f"Age {age} may be below minimum {service.age_min}")
            elif service.age_max and age > service.age_max:
                score -= 25
                mismatches.append(f"Age {age} may exceed maximum {service.age_max}")
            else:
                score += 10
                matched.append("Age requirement appears compatible")
        elif service.age_min or service.age_max:
            uncertain.append("Age not in profile")
            missing.append("date_of_birth")

        if service.student_required:
            if profile.is_student:
                score += 10
                matched.append("Student status matches")
            else:
                score -= 15
                mismatches.append("Scheme may require student status")

        if service.farmer_required:
            if profile.is_farmer:
                score += 10
                matched.append("Farmer status matches")
            else:
                score -= 15
                mismatches.append("Scheme may require farmer status")

        if service.senior_citizen_required:
            if profile.is_senior_citizen or (age and age >= 60):
                score += 10
                matched.append("Senior citizen context matches")
            else:
                score -= 10
                mismatches.append("Scheme targets senior citizens")

        if service.woman_required:
            if profile.is_woman:
                score += 10
                matched.append("Women-focused scheme matches profile")
            else:
                score -= 10
                mismatches.append("Scheme may be women-specific")

        if service.income_constraints:
            ok, inc_uncertain = _income_compatible(profile.income_band, service.income_constraints)
            if inc_uncertain:
                uncertain.append("Income band not confirmed")
                missing.append("income_band")
            elif ok:
                score += 8
                matched.append("Income band appears compatible")

        if not profile.income_band:
            missing.append("income_band")

        score = max(0, min(100, round(score, 1)))
        explanation_parts = []
        if matched:
            explanation_parts.append("Matches: " + "; ".join(matched))
        if uncertain:
            explanation_parts.append("Uncertain: " + "; ".join(uncertain))
        if mismatches:
            explanation_parts.append("Possible issues: " + "; ".join(mismatches))
        if missing:
            explanation_parts.append("Missing info: " + ", ".join(sorted(set(missing))))

        return RecommendationItem(
            service=service,
            match_score=score,
            matched_criteria=matched,
            uncertain_criteria=uncertain,
            missing_information=list(sorted(set(missing))),
            possible_mismatches=mismatches,
            explanation=" | ".join(explanation_parts) or "Review scheme details and verify officially.",
        )
