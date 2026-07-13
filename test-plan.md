# NagrikOS Frontend↔Backend Integration — Test Plan

Proves the frontend now uses **real backend APIs** (not the deleted `src/data/demo-*` mocks).
Backend: FastAPI on `:8000` (seeded SQLite). Frontend: Vite dev on `:8080`.
Login (setup, not a test step): `demo@nagrikos.in` / `Demo@12345`.

The key adversarial idea: mock data was static and would NOT persist writes across reloads,
and would NOT reflect newly created records. Every assertion below is chosen so a broken /
mock-backed implementation would look visibly different.

## Test 1 — Login + Dashboard loads real data
- Action: submit login form; land on `/dashboard`.
- PASS:
  - Greeting shows the seeded user's first name **"Priya"** (from `GET /profile` full_name "Priya Sharma"), not "Friend".
  - "Profile completeness" shows a non-zero % derived from the real profile.
  - Recommendations card renders ≥1 real scheme card with a `NN% match` badge (from `GET /recommendations`).
- FAIL: greeting "Friend", 0% everywhere, or empty recommendations with backend up.

## Test 2 — AI Saathi real round-trip (POST /saathi)
- Action: open `/ai-saathi`, type `My mother needs healthcare support`, send.
- PASS:
  - A user bubble appears, then an assistant reply arrives.
  - Assistant message includes a **disclaimer** line (backend metadata.disclaimer) — mocks had none of this dynamic metadata.
- FAIL: no assistant reply, or a network error toast, or hardcoded static text identical to old demo-chat.

## Test 3 — Mission step completion PERSISTS across reload (POST /missions/.../complete)
- Precondition: open a mission from `/missions` (create one via Opportunities "Start mission" if none exist).
- Action: click an incomplete step's circle to mark it complete; observe progress %/badge increase; then **hard-reload** the page.
- PASS: after reload the step is still complete and the progress % is the increased value (persisted in DB via the complete endpoint).
- FAIL: step reverts to incomplete after reload (would indicate optimistic-only/mock state).

## Test 4 — Report issue end-to-end creates a real complaint (POST /complaints)
- Action: `/report-issue` → describe `Large pothole near the college gate flooding after rain` → set a location → Continue through AI analysis (shows predicted category/department from `POST /complaints/analyze`) → duplicate step → confirm & submit.
- PASS:
  - Analysis step shows a concrete predicted category (e.g. "pothole_road") and a suggested department (from backend, not blank).
  - After submit, redirected to `/complaints/$id` with a numeric id and a **timeline** containing "Reported" → "Ai Classified" → "Routed" events (created by backend `create_complaint`).
  - The new complaint appears in `/complaints` list.
- FAIL: submit throws, no timeline, or complaint not present in list after reload.

## Test 5 — DocReady readiness check (POST /documents/readiness)
- Action: `/docready`, select a scheme, run the readiness check.
- PASS: a readiness % renders with missing/available document breakdown returned by backend (not a static mock list).
- FAIL: network error, or identical output regardless of scheme selected.

## Evidence
Screen recording covering Tests 1–5 with annotations; screenshots of dashboard, AI reply, mission before/after reload, complaint timeline, docready result. Network confirmation via visible UI state changes (persistence across reload is the strongest signal).
