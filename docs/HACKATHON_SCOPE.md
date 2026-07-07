# Hackathon Scope

## In Scope (Implemented)

- [x] User registration/login with JWT
- [x] Citizen profile with recommendation-relevant fields
- [x] 18 demo scheme records across 9 categories
- [x] AI Saathi multilingual chat with fallbacks
- [x] Life situation structured extraction
- [x] Explainable Opportunity Radar recommendations
- [x] Civic Mission engine with templates and progress tracking
- [x] DocReady document upload and readiness check
- [x] Drishti complaint analysis with user confirmation
- [x] Duplicate issue detection (text + geo)
- [x] Join existing issue
- [x] Complaint timeline
- [x] Citizen resolution verification
- [x] OpenAPI documentation
- [x] Demo seed data
- [x] 22 pytest tests
- [x] Frontend handoff documentation

## Out of Scope (By Design)

- Frontend UI (separate agent)
- Real government API integrations
- Official scheme data scraping/verification
- Official document verification (OCR/AI validation)
- Real department routing/webhooks
- SMS/email notifications
- Admin dashboard
- Embeddings/vector database (lexical RAG used)
- Alembic migrations (create_all for hackathon simplicity)
- Multi-tenant organization support
- Payment processing

## Demo vs Production

| Aspect | Hackathon | Production Path |
|--------|-----------|-----------------|
| Scheme data | Demo records with disclaimers | Verified official dataset API |
| Eligibility | Rule-based scoring | Integration with govt eligibility APIs |
| Complaints | Simulated timeline | Real grievance redressal system |
| Documents | Readiness guidance | Certified verification partners |
| AI | Optional OpenAI-compatible | Managed AI with guardrails |
| Database | SQLite default | PostgreSQL + migrations |

## Known Limitations

1. Language detection is heuristic, not ML-based
2. Duplicate detection uses simple TF-IDF + Haversine
3. Mission progress doesn't auto-sync with document uploads
4. No real-time notifications
5. Complaint status transitions are API-triggered, not event-driven
6. PDF text extraction is basic (no OCR for images)
7. Income band matching is simplified

## Success Criteria Met

- Backend runs standalone
- All core user journeys functional without AI key
- Tests pass
- API documented for frontend handoff
- Code pushed to GitHub
