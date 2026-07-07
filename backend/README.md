# NagrikOS Backend

FastAPI backend for the NagrikOS civic AI platform.

## Quick Start

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
python -m app.db.seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000/api/v1  
Docs: http://localhost:8000/docs

## Project Layout

```
app/
├── api/v1/       # Route handlers
├── ai/           # AI provider, RAG, fallbacks
├── core/         # Config, security
├── db/           # Session, seed
├── models/       # SQLAlchemy models
├── schemas/      # Pydantic schemas
├── services/     # Business logic
└── main.py       # App entry
```

## Commands

| Command | Purpose |
|---------|---------|
| `uvicorn app.main:app --reload` | Start dev server |
| `python -m app.db.seed` | Seed demo data |
| `python -m app.db.seed --force` | Reseed (wipes data) |
| `pytest tests/ -v` | Run tests |

See [../docs/BACKEND_HANDOFF.md](../docs/BACKEND_HANDOFF.md) for frontend integration.
