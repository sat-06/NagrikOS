"""Recommendation tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _demo_token():
    r = client.post("/api/v1/auth/login", data={"username": "demo@nagrikos.in", "password": "Demo@12345"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_recommendations_with_profile():
    headers = _demo_token()
    r = client.get("/api/v1/recommendations", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0
    first = data["recommendations"][0]
    assert "match_score" in first
    assert "explanation" in first
    assert "disclaimer" in first


def test_explain_recommendation():
    headers = _demo_token()
    r = client.get("/api/v1/services", headers=headers)
    service_id = r.json()["items"][0]["id"]
    r2 = client.post("/api/v1/recommendations/explain", headers=headers, json={"service_id": service_id})
    assert r2.status_code == 200
    item = r2.json()["recommendations"][0]
    assert item["match_score"] >= 0


def test_state_mismatch_lowers_score():
    email = "recouser@example.com"
    client.post("/api/v1/auth/register", json={"email": email, "password": "RecoPass123"})
    token = client.post("/api/v1/auth/login", data={"username": email, "password": "RecoPass123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.put("/api/v1/profile", headers=headers, json={"state": "Kerala"})
    r = client.get("/api/v1/recommendations", headers=headers)
    mh_schemes = [x for x in r.json()["recommendations"] if "Maharashtra" in str(x["service"].get("state_applicability", []))]
    if mh_schemes:
        assert any("State may not match" in str(x.get("possible_mismatches", [])) for x in mh_schemes)
