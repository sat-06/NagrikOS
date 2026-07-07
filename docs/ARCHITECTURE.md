# NagrikOS Architecture

## Overview

NagrikOS backend is a modular FastAPI application following a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (v1)                        │
│  auth │ profile │ services │ recommendations │ saathi   │
│  missions │ documents │ complaints                       │
├─────────────────────────────────────────────────────────┤
│                  Service Layer                           │
│  catalog │ recommendation │ mission │ document │       │
│  complaint                                               │
├─────────────────────────────────────────────────────────┤
│                    AI Layer                              │
│  provider │ fallback │ RAG │ saathi │ complaints       │
├─────────────────────────────────────────────────────────┤
│              Data Layer (SQLAlchemy)                     │
│  SQLite (default) │ PostgreSQL (production-ready)        │
└─────────────────────────────────────────────────────────┘
```

## Core Design Principles

1. **Deterministic first** — eligibility matching, mission templates, complaint classification use rules; AI enhances when configured
2. **Graceful degradation** — no AI API key required; all core flows work with fallbacks
3. **Grounded knowledge** — AI responses retrieve from internal scheme KB; no invented schemes
4. **Explicit uncertainty** — every recommendation/AI response includes disclaimers
5. **Frontend-ready** — stable `/api/v1` contracts, OpenAPI docs, configurable CORS

## Module Map

| Product Module | Backend Components |
|----------------|-------------------|
| Auth | `api/v1/auth.py`, `core/security.py` |
| AI Saathi | `ai/saathi.py`, `ai/rag.py`, `api/v1/chat.py` |
| Life Situation | `ai/fallback.py`, `POST /saathi/life-situation` |
| Services KB | `models/service.py`, `services/service_catalog.py` |
| Opportunity Radar | `services/recommendation.py` |
| Civic Missions | `services/mission.py`, `ai/mission_templates.py` |
| DocReady | `services/document.py` |
| Drishti Reports | `services/complaint.py`, `ai/complaints.py` |
| Duplicate Intelligence | `services/complaint.py` + `utils/text_similarity.py` |
| Timeline & Resolution | `models/complaint.py`, complaint service |

## Database

- **Default:** SQLite (`nagrikos.db`) when `DATABASE_URL` is empty
- **Production:** Set `DATABASE_URL=postgresql://user:pass@host/db`
- Tables created on startup via `init_db()`; seed via `python -m app.db.seed`

## AI Provider Abstraction

`app/ai/provider.py` implements OpenAI-compatible chat completions:
- Configured via `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`
- Structured JSON output with validation
- Timeout and error handling; returns `None` on failure

## RAG Architecture

Simple lexical retrieval (TF-IDF cosine + keyword overlap):
- Source: `service_schemes` table
- No external vector DB required
- Retrieval scores attached to results
- AI context delimited with `<retrieved>` tags for injection safety

## Request Flow Example: AI Saathi Chat

1. User sends message → stored as `chat_messages`
2. History loaded from session
3. RAG retrieves top-5 relevant schemes
4. If AI enabled: structured prompt with delimited context
5. If AI fails/disabled: `fallback_saathi_response()`
6. Assistant message stored with metadata JSON
7. Response includes structured `SaathiMetadata`

## Deployment Notes

- Run behind reverse proxy (nginx) in production
- Set strong `JWT_SECRET_KEY`
- Use PostgreSQL for multi-instance deployments
- Configure `CORS_ORIGINS` for frontend domain
- `UPLOAD_DIR` should be persistent volume
