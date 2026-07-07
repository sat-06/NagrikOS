"""Complaint tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _headers():
    r = client.post("/api/v1/auth/login", data={"username": "demo@nagrikos.in", "password": "Demo@12345"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_analyze_complaint_fallback():
    headers = _headers()
    r = client.post(
        "/api/v1/complaints/analyze",
        headers=headers,
        json={"description": "Large pothole on main road causing accidents"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["predicted_category"] == "pothole_road"
    assert data["generated_draft"]


def test_duplicate_nearby_complaint():
    headers = _headers()
    r = client.post(
        "/api/v1/complaints/duplicates",
        headers=headers,
        json={
            "description": "Pothole on FC Road near college damaging vehicles",
            "category": "pothole_road",
            "latitude": 18.5205,
            "longitude": 73.8568,
        },
    )
    assert r.status_code == 200
    candidates = r.json()["candidates"]
    assert len(candidates) >= 1
    assert candidates[0]["similarity_score"] > 25


def test_distant_complaint_not_duplicate():
    headers = _headers()
    r = client.post(
        "/api/v1/complaints/duplicates",
        headers=headers,
        json={
            "description": "Pothole on some road",
            "category": "pothole_road",
            "latitude": 28.6,
            "longitude": 77.2,
        },
    )
    fc_candidates = [c for c in r.json()["candidates"] if "FC Road" in c["title"]]
    for c in fc_candidates:
        assert c.get("distance_km") is None or c["distance_km"] > 100


def test_create_complaint_requires_confirmation():
    headers = _headers()
    r = client.post(
        "/api/v1/complaints",
        headers=headers,
        json={
            "title": "Test",
            "description": "Garbage dump on street for many days",
            "category": "garbage",
            "user_confirmed": False,
        },
    )
    assert r.status_code == 400


def test_join_issue_and_prevent_duplicate_join():
    headers = _headers()
    complaints = client.get("/api/v1/complaints", headers=headers).json()
    cid = complaints[0]["id"]
    r = client.post(f"/api/v1/complaints/{cid}/join", headers=headers)
    assert r.status_code in (200, 400)


def test_timeline_and_resolution():
    headers = _headers()
    r = client.post(
        "/api/v1/complaints",
        headers=headers,
        json={
            "title": "Broken streetlight",
            "description": "Streetlight not working for a week in our lane",
            "category": "streetlight",
            "user_confirmed": True,
        },
    )
    assert r.status_code == 201
    cid = r.json()["id"]
    r2 = client.get(f"/api/v1/complaints/{cid}/timeline", headers=headers)
    assert r2.status_code == 200
    assert len(r2.json()) >= 1

    r3 = client.post(
        f"/api/v1/complaints/{cid}/resolution",
        headers=headers,
        json={"action": "confirmed", "note": "Issue fixed"},
    )
    assert r3.status_code == 200
    assert r3.json()["status"] == "resolved"
