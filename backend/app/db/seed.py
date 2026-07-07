"""Seed demo data for NagrikOS."""

import argparse
from datetime import date, datetime, timedelta

from app.core.security import get_password_hash
from app.db.session import SessionLocal, init_db
from app.models.complaint import Complaint, ComplaintStatus, ComplaintSupporter, ComplaintTimelineEvent
from app.models.mission import CivicMission, MissionSourceType, MissionStatus, MissionStep, StepStatus
from app.models.service import ServiceScheme
from app.models.user import CitizenProfile, User
from app.utils.json_helpers import to_json

DEMO_SCHEMES = [
    {
        "name": "Ayushman Bharat – PM-JAY (Demo)",
        "slug": "ayushman-bharat-pmjay-demo",
        "short_description": "Health coverage scheme for eligible families (demo record).",
        "simplified_description": "Provides health insurance coverage up to a defined limit for hospitalization at empaneled hospitals.",
        "category": "healthcare",
        "target_groups": ["low income families", "senior citizens"],
        "state_applicability": ["All India"],
        "age_min": None,
        "age_max": None,
        "income_constraints": "Below poverty line / SECC listed families",
        "senior_citizen_required": False,
        "required_documents": ["identity_proof", "income_certificate", "ration_card"],
        "benefits": ["Cashless hospitalization", "Pre and post hospitalization cover"],
        "application_steps": ["Check eligibility on official portal", "Use Aadhaar at hospital", "Visit empaneled facility"],
        "official_source_url": "https://pmjay.gov.in/",
        "source_title": "PM-JAY Official Portal (reference)",
    },
    {
        "name": "National Scholarship Portal – Post Matric (Demo)",
        "slug": "nsp-post-matric-demo",
        "short_description": "Scholarship support for higher education (demo).",
        "simplified_description": "Financial assistance for students from disadvantaged backgrounds pursuing post-matric education.",
        "category": "education",
        "target_groups": ["students", "SC/ST/OBC"],
        "state_applicability": ["All India"],
        "student_required": True,
        "required_documents": ["identity_proof", "education_documents", "income_certificate", "domicile_certificate"],
        "benefits": ["Tuition fee reimbursement", "Maintenance allowance"],
        "application_steps": ["Register on NSP", "Fill application", "Submit documents", "Track status"],
        "official_source_url": "https://scholarships.gov.in/",
        "source_title": "National Scholarship Portal (reference)",
    },
    {
        "name": "PM Kisan Samman Nidhi (Demo)",
        "slug": "pm-kisan-demo",
        "short_description": "Income support for farmer families (demo).",
        "simplified_description": "Direct income support instalments to eligible landholding farmer families.",
        "category": "agriculture",
        "target_groups": ["farmers"],
        "state_applicability": ["All India"],
        "farmer_required": True,
        "required_documents": ["identity_proof", "land_records", "bank_account_proof"],
        "benefits": ["Periodic direct benefit transfer"],
        "application_steps": ["Apply via PM-Kisan portal or CSC", "Verify land records", "Link bank account"],
        "official_source_url": "https://pmkisan.gov.in/",
        "source_title": "PM-Kisan Portal (reference)",
    },
    {
        "name": "MGNREGA Job Card (Demo)",
        "slug": "mgnrega-job-card-demo",
        "short_description": "Guaranteed wage employment scheme (demo).",
        "simplified_description": "Provides at least 100 days of wage employment per rural household per year.",
        "category": "employment",
        "target_groups": ["rural households", "unemployed"],
        "state_applicability": ["All India"],
        "required_documents": ["identity_proof", "domicile_certificate", "photograph"],
        "benefits": ["Guaranteed wage employment", "Unemployment allowance if work not provided"],
        "application_steps": ["Apply at Gram Panchayat", "Job card issuance", "Demand work when needed"],
        "official_source_url": "https://nrega.nic.in/",
        "source_title": "MGNREGA Portal (reference)",
    },
    {
        "name": "Senior Citizens Savings Scheme (Demo)",
        "slug": "scss-senior-demo",
        "short_description": "Savings scheme for senior citizens (demo).",
        "simplified_description": "Government-backed savings option for citizens aged 60+ with periodic interest payouts.",
        "category": "senior citizens",
        "target_groups": ["senior citizens"],
        "state_applicability": ["All India"],
        "age_min": 60,
        "senior_citizen_required": True,
        "required_documents": ["identity_proof", "age_proof", "bank_account_proof"],
        "benefits": ["Regular interest income", "Government-backed savings"],
        "application_steps": ["Visit post office or authorized bank", "Submit KYC documents", "Open account"],
        "official_source_url": "https://www.india.gov.in/",
        "source_title": "India.gov.in (reference)",
    },
    {
        "name": "Widow Pension – State Scheme Template (Demo)",
        "slug": "widow-pension-state-demo",
        "short_description": "Monthly pension for eligible widows (state-level demo template).",
        "simplified_description": "Financial assistance for widows meeting age and income criteria. Rules vary by state.",
        "category": "women support",
        "target_groups": ["widows", "women"],
        "state_applicability": ["Maharashtra", "Delhi", "Karnataka"],
        "woman_required": True,
        "age_min": 18,
        "income_constraints": "Below state-defined income threshold",
        "required_documents": ["identity_proof", "death_certificate_spouse", "income_certificate", "domicile_certificate"],
        "benefits": ["Monthly pension amount (state-specific)"],
        "application_steps": ["Check state social welfare portal", "Submit application with documents", "Verification visit"],
        "official_source_url": "https://wcd.nic.in/",
        "source_title": "Ministry of WCD (reference)",
    },
    {
        "name": "Stand-Up India Loan (Demo)",
        "slug": "stand-up-india-demo",
        "short_description": "Bank loan for SC/ST and women entrepreneurs (demo).",
        "simplified_description": "Facilitates bank loans between specified limits for greenfield enterprises.",
        "category": "entrepreneurship",
        "target_groups": ["women entrepreneurs", "SC/ST entrepreneurs"],
        "state_applicability": ["All India"],
        "woman_required": False,
        "required_documents": ["identity_proof", "business_plan", "project_report", "domicile_certificate"],
        "benefits": ["Bank loan facilitation", "Handholding support via SIDBI"],
        "application_steps": ["Approach lead bank branch", "Submit business proposal", "Loan processing"],
        "official_source_url": "https://www.standupmitra.in/",
        "source_title": "Stand-Up India (reference)",
    },
    {
        "name": "PMAY – Urban Housing (Demo)",
        "slug": "pmay-urban-demo",
        "short_description": "Affordable urban housing assistance (demo).",
        "simplified_description": "Credit-linked subsidy and affordable housing support for eligible urban families.",
        "category": "housing",
        "target_groups": ["economically weaker section", "low income group"],
        "state_applicability": ["All India"],
        "income_constraints": "EWS/LIG income limits as per scheme",
        "required_documents": ["identity_proof", "income_certificate", "domicile_certificate", "aadhaar_consent"],
        "benefits": ["Interest subsidy on home loan", "Affordable housing access"],
        "application_steps": ["Apply via PMAY portal", "Income verification", "Select beneficiary category"],
        "official_source_url": "https://pmay-urban.gov.in/",
        "source_title": "PMAY-U Portal (reference)",
    },
    {
        "name": "DigiLocker Integration Guide (Demo)",
        "slug": "digilocker-identity-demo",
        "short_description": "Digital document wallet for citizens (demo guide).",
        "simplified_description": "Store and share verified digital copies of documents like marksheets and certificates.",
        "category": "identity/certificates",
        "target_groups": ["all citizens"],
        "state_applicability": ["All India"],
        "required_documents": ["identity_proof", "mobile_number"],
        "benefits": ["Paperless document access", "Easy sharing with departments"],
        "application_steps": ["Sign up with Aadhaar/mobile", "Fetch issued documents", "Share with service providers"],
        "official_source_url": "https://www.digilocker.gov.in/",
        "source_title": "DigiLocker (reference)",
    },
    {
        "name": "PMKVY Skill Training (Demo)",
        "slug": "pmkvy-skill-demo",
        "short_description": "Short-term skill training and certification (demo).",
        "simplified_description": "Skill development training with assessment and certification for employability.",
        "category": "employment",
        "target_groups": ["youth", "unemployed", "school dropouts"],
        "state_applicability": ["All India"],
        "age_min": 18,
        "age_max": 45,
        "required_documents": ["identity_proof", "education_documents"],
        "benefits": ["Free or subsidized training", "Industry-recognized certification"],
        "application_steps": ["Find training center on portal", "Enroll in course", "Complete assessment"],
        "official_source_url": "https://www.pmkvyofficial.org/",
        "source_title": "PMKVY (reference)",
    },
    {
        "name": "Maharashtra Farmer Loan Waiver Info (Demo)",
        "slug": "mh-farmer-support-demo",
        "short_description": "Maharashtra farmer assistance programs overview (demo).",
        "simplified_description": "State-level farmer support including credit and relief programs. Verify current schemes officially.",
        "category": "agriculture",
        "target_groups": ["farmers"],
        "state_applicability": ["Maharashtra"],
        "farmer_required": True,
        "required_documents": ["identity_proof", "land_records", "loan_documents"],
        "benefits": ["Varies by active state program"],
        "application_steps": ["Check Maharashtra agriculture department portal", "Verify active schemes", "Apply with land records"],
        "official_source_url": "https://maharashtra.gov.in/",
        "source_title": "Maharashtra Government (reference)",
    },
    {
        "name": "Girl Child Education Incentive (Demo)",
        "slug": "girl-child-education-demo",
        "short_description": "Incentives for girl child education (demo template).",
        "simplified_description": "State and central incentives to support education continuity for girl students.",
        "category": "education",
        "target_groups": ["girl students", "families with daughters"],
        "state_applicability": ["All India"],
        "student_required": True,
        "woman_required": False,
        "age_min": 5,
        "age_max": 18,
        "required_documents": ["identity_proof", "education_documents", "bank_account_proof"],
        "benefits": ["Scholarship or cash incentive", "Bicycle/uniform support in some states"],
        "application_steps": ["Check state education portal", "School nomination or direct application"],
        "official_source_url": "https://www.education.gov.in/",
        "source_title": "Ministry of Education (reference)",
    },
    {
        "name": "Jan Aushadhi Medicines (Demo)",
        "slug": "jan-aushadhi-demo",
        "short_description": "Affordable generic medicines (demo).",
        "simplified_description": "Access quality generic medicines at affordable prices through Jan Aushadhi Kendras.",
        "category": "healthcare",
        "target_groups": ["all citizens", "low income families"],
        "state_applicability": ["All India"],
        "required_documents": ["identity_proof"],
        "benefits": ["Low-cost medicines", "Wide generic availability"],
        "application_steps": ["Locate nearest Kendra", "Present prescription if required", "Purchase at subsidized rates"],
        "official_source_url": "https://janaushadhi.gov.in/",
        "source_title": "PMBJP (reference)",
    },
    {
        "name": "E-Shram Unorganized Worker Card (Demo)",
        "slug": "e-shram-demo",
        "short_description": "Registration for unorganized workers (demo).",
        "simplified_description": "National database and ID for unorganized workers to access social security benefits.",
        "category": "employment",
        "target_groups": ["unorganized workers", "gig workers"],
        "state_applicability": ["All India"],
        "age_min": 16,
        "age_max": 59,
        "required_documents": ["identity_proof", "bank_account_proof", "mobile_number"],
        "benefits": ["Accident insurance cover", "Access to future welfare schemes"],
        "application_steps": ["Register on e-Shram portal", "Aadhaar authentication", "Download e-Shram card"],
        "official_source_url": "https://eshram.gov.in/",
        "source_title": "e-Shram Portal (reference)",
    },
    {
        "name": "Startup India Seed Fund (Demo)",
        "slug": "startup-india-seed-demo",
        "short_description": "Seed funding support for startups (demo).",
        "simplified_description": "Financial assistance to startups for proof of concept, prototype development, and market entry.",
        "category": "entrepreneurship",
        "target_groups": ["startups", "innovators"],
        "state_applicability": ["All India"],
        "required_documents": ["incorporation_certificate", "business_plan", "pitch_deck"],
        "benefits": ["Seed funding grant", "Mentorship ecosystem access"],
        "application_steps": ["Register on Startup India", "Apply through incubators", "Due diligence"],
        "official_source_url": "https://www.startupindia.gov.in/",
        "source_title": "Startup India (reference)",
    },
    {
        "name": "National Health Mission – Free Diagnostics (Demo)",
        "slug": "nhm-diagnostics-demo",
        "short_description": "Free diagnostics at public health facilities (demo).",
        "simplified_description": "Free essential diagnostic services at government health centers and hospitals.",
        "category": "healthcare",
        "target_groups": ["all citizens", "low income"],
        "state_applicability": ["All India"],
        "required_documents": ["identity_proof"],
        "benefits": ["Free essential tests", "Access at public facilities"],
        "application_steps": ["Visit nearest PHC/CHC", "Consult doctor", "Avail listed free tests"],
        "official_source_url": "https://nhm.gov.in/",
        "source_title": "NHM (reference)",
    },
    {
        "name": "Income Certificate – State Issuance Guide (Demo)",
        "slug": "income-certificate-guide-demo",
        "short_description": "How to obtain income certificate (demo guide).",
        "simplified_description": "Income certificates are issued by state authorities and required for many welfare schemes.",
        "category": "identity/certificates",
        "target_groups": ["all citizens"],
        "state_applicability": ["All India"],
        "required_documents": ["identity_proof", "domicile_certificate", "affidavit", "salary_slip_or_declaration"],
        "benefits": ["Enables scheme applications", "Proof of income band"],
        "application_steps": ["Apply via state e-District portal", "Submit supporting documents", "Collect certificate"],
        "official_source_url": "https://www.india.gov.in/",
        "source_title": "India.gov.in (reference)",
    },
    {
        "name": "Senior Citizen Rail Concession Info (Demo)",
        "slug": "senior-rail-concession-demo",
        "short_description": "Rail travel concessions for senior citizens (demo info).",
        "simplified_description": "Indian Railways offers fare concessions for senior citizens. Verify current rules on IRCTC.",
        "category": "senior citizens",
        "target_groups": ["senior citizens"],
        "state_applicability": ["All India"],
        "age_min": 60,
        "senior_citizen_required": True,
        "required_documents": ["identity_proof", "age_proof"],
        "benefits": ["Fare concession on select classes"],
        "application_steps": ["Book via IRCTC with senior citizen option", "Carry age proof during travel"],
        "official_source_url": "https://www.irctc.co.in/",
        "source_title": "IRCTC (reference)",
    },
]


def seed(db=None, force: bool = False):
    close = False
    if db is None:
        init_db()
        db = SessionLocal()
        close = True

    if force:
        db.query(ComplaintTimelineEvent).delete()
        db.query(ComplaintSupporter).delete()
        db.query(Complaint).delete()
        db.query(MissionStep).delete()
        db.query(CivicMission).delete()
        db.query(ServiceScheme).delete()
        db.query(CitizenProfile).delete()
        db.query(User).delete()
        db.commit()

    if db.query(User).filter(User.email == "demo@nagrikos.in").first() and not force:
        print("Demo data already exists. Use --force to reseed.")
        if close:
            db.close()
        return

    demo_user = User(
        email="demo@nagrikos.in",
        hashed_password=get_password_hash("Demo@12345"),
    )
    db.add(demo_user)
    db.flush()

    profile = CitizenProfile(
        user_id=demo_user.id,
        full_name="Priya Sharma",
        preferred_language="en",
        state="Maharashtra",
        district="Pune",
        date_of_birth=date(1990, 5, 15),
        occupation="Teacher",
        income_band="3l_to_5l",
        is_woman=True,
    )
    db.add(profile)

    for s in DEMO_SCHEMES:
        scheme = ServiceScheme(
            name=s["name"],
            slug=s["slug"],
            short_description=s["short_description"],
            simplified_description=s["simplified_description"],
            category=s["category"],
            target_groups=to_json(s.get("target_groups", [])),
            state_applicability=to_json(s.get("state_applicability", [])),
            age_min=s.get("age_min"),
            age_max=s.get("age_max"),
            income_constraints=s.get("income_constraints"),
            occupation_constraints=s.get("occupation_constraints"),
            student_required=s.get("student_required"),
            farmer_required=s.get("farmer_required"),
            senior_citizen_required=s.get("senior_citizen_required"),
            woman_required=s.get("woman_required"),
            required_documents=to_json(s.get("required_documents", [])),
            benefits=to_json(s.get("benefits", [])),
            application_steps=to_json(s.get("application_steps", [])),
            official_source_url=s.get("official_source_url"),
            source_title=s.get("source_title"),
            source_metadata=to_json({"prototype": True, "verified": False}),
            last_reviewed_at=datetime.utcnow(),
            is_active=True,
            is_demo_data=True,
        )
        db.add(scheme)

    db.flush()

    mission = CivicMission(
        user_id=demo_user.id,
        title="Get healthcare support for elderly parent",
        description="Explore health schemes for widowed mother aged 62",
        category="healthcare",
        status=MissionStatus.ACTIVE.value,
        progress_percentage=20,
        source_type=MissionSourceType.AI_SAATHI.value,
        related_service_ids=to_json([1]),
    )
    db.add(mission)
    db.flush()

    steps = [
        ("Identify eligible health schemes", "research", StepStatus.COMPLETED.value),
        ("Gather identity and income proof", "document", StepStatus.IN_PROGRESS.value),
        ("Check hospital empanelment list", "verify", StepStatus.PENDING.value),
        ("Submit application or enroll", "apply", StepStatus.PENDING.value),
    ]
    for i, (title, action, status) in enumerate(steps, 1):
        db.add(
            MissionStep(
                mission_id=mission.id,
                order=i,
                title=title,
                action_type=action,
                status=status,
                related_document="identity_proof" if "document" in action else None,
            )
        )

    c1 = Complaint(
        user_id=demo_user.id,
        title="Large pothole on FC Road",
        description="Deep pothole near Fergusson College Road causing accidents for two-wheelers",
        category="pothole_road",
        severity="high",
        suggested_department="Municipal Roads Department",
        status=ComplaintStatus.ACKNOWLEDGED.value,
        latitude=18.5204,
        longitude=73.8567,
        address="FC Road, Pune, Maharashtra",
        is_confirmed=True,
    )
    db.add(c1)
    db.flush()
    db.add(ComplaintSupporter(complaint_id=c1.id, user_id=demo_user.id))
    db.add(ComplaintTimelineEvent(complaint_id=c1.id, event_type="reported", status="reported", note="Complaint filed"))
    db.add(ComplaintTimelineEvent(complaint_id=c1.id, event_type="acknowledged", status="acknowledged", note="Municipality acknowledged"))

    c2 = Complaint(
        user_id=demo_user.id,
        title="Pothole near FC Road junction",
        description="Big pothole on FC Road junction damaging vehicles, needs urgent repair",
        category="pothole_road",
        severity="medium",
        suggested_department="Municipal Roads Department",
        status=ComplaintStatus.REPORTED.value,
        latitude=18.5206,
        longitude=73.8569,
        address="FC Road Junction, Pune",
        is_confirmed=True,
    )
    db.add(c2)
    db.flush()
    db.add(ComplaintSupporter(complaint_id=c2.id, user_id=demo_user.id))

    c3 = Complaint(
        user_id=demo_user.id,
        title="Garbage pile in Model Colony",
        description="Uncollected garbage for 5 days near residential area",
        category="garbage",
        severity="medium",
        suggested_department="Sanitation Department",
        status=ComplaintStatus.IN_PROGRESS.value,
        latitude=19.0,
        longitude=72.8,
        address="Model Colony, Mumbai",
        is_confirmed=True,
    )
    db.add(c3)
    db.flush()
    db.add(ComplaintSupporter(complaint_id=c3.id, user_id=demo_user.id))

    db.commit()
    print("Seed complete. Demo user: demo@nagrikos.in / Demo@12345")

    if close:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    seed(force=args.force)
