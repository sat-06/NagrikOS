# NagrikOS

**AI that turns civic confusion into action.**

NagrikOS is a GenAI-powered civic companion platform built for **Smart Bharat – AI-Powered Civic Companion**. It helps citizens access government services, understand complex civic information, receive personalized assistance, report public issues, and track their civic journey end-to-end.

## Unique Value Proposition

Unlike generic chatbots with complaint forms, NagrikOS is an **AI Civic Action Agent**:

- **Life Situation Mode** — converts free-form problems into structured civic understanding
- **Opportunity Radar** — explainable, profile-based scheme recommendations
- **Civic Mission Engine** — trackable journeys from problem to action
- **DocReady AI** — document readiness guidance (not verification)
- **Drishti Reports** — AI-assisted issue reporting with duplicate detection
- **Citizen-Verified Resolution** — citizens confirm or dispute resolutions

## Features

| Module | Description |
|--------|-------------|
| Authentication | JWT auth, registration, profile management |
| AI Saathi | Multilingual civic AI companion (EN/HI/MR) |
| Services KB | 18 demo scheme records across 9 categories |
| Opportunity Radar | Transparent match scoring with explanations |
| Civic Missions | Step-based trackable civic journeys |
| DocReady | Secure upload + readiness comparison |
| Drishti Reports | AI complaint drafting + duplicate intelligence |
| Timeline | Full complaint lifecycle tracking |

## Tech Stack

- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL-ready; SQLite fallback for local demo
- **Auth:** JWT + bcrypt
- **AI:** OpenAI-compatible provider with deterministic fallbacks
- **Testing:** pytest (22 tests)

## Repository Structure

```
NagrikOS/
├── backend/          # FastAPI application
│   ├── app/          # Application code
│   └── tests/        # pytest suite
├── frontend/         # Reserved for frontend agent
├── docs/             # Architecture & handoff documentation
├── scripts/          # Utility scripts (seed)
├── .env.example      # Environment template
└── README.md
```

## Local Setup

### Prerequisites

- Python 3.11+
- (Optional) PostgreSQL

### 1. Clone and configure

```bash
git clone https://github.com/sat-06/NagrikOS.git
cd NagrikOS
cp .env.example .env
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Seed demo data

```bash
python -m app.db.seed
# or from repo root:
python scripts/seed.py
```

### 4. Start backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

## Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@nagrikos.in` |
| Password | `Demo@12345` |

## Environment Variables

See `.env.example` for full list. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL URL (empty = SQLite) |
| `JWT_SECRET_KEY` | Secret for JWT signing |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `AI_API_KEY` | OpenAI-compatible API key (optional) |
| `UPLOAD_DIR` | Document upload directory |

## Testing

```bash
cd backend
pytest tests/ -v
```

## Limitations & Disclaimer

This is a **hackathon prototype**:

- Scheme records are **demo data** — not officially verified
- DocReady provides **readiness guidance**, not official document verification
- AI recommendations are **indicative** — not eligibility confirmation
- Complaint routing is **simulated** — no real government integration
- AI features work without API key via **deterministic fallbacks**

Always verify eligibility and requirements with official government sources.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Contract](docs/API_CONTRACT.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [AI Workflows](docs/AI_WORKFLOWS.md)
- [Security & Privacy](docs/SECURITY_PRIVACY.md)
- [Hackathon Scope](docs/HACKATHON_SCOPE.md)
- [Backend Handoff (Frontend Integration)](docs/BACKEND_HANDOFF.md)

## License

Hackathon project — see repository for details.
