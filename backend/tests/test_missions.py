"""Mission tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _headers():
    r = client.post("/api/v1/auth/login", data={"username": "demo@nagrikos.in", "password": "Demo@12345"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_create_mission_and_complete_step():
    headers = _headers()
    r = client.post(
        "/api/v1/missions",
        headers=headers,
        json={"title": "Test Mission", "template_key": "education_support"},
    )
    assert r.status_code == 201
    mission = r.json()
    assert len(mission["steps"]) > 0
    step_id = mission["steps"][0]["id"]
    mission_id = mission["id"]

    r2 = client.post(f"/api/v1/missions/{mission_id}/steps/{step_id}/complete", headers=headers)
    assert r2.status_code == 200
    assert r2.json()["status"] == "completed"

    r3 = client.get(f"/api/v1/missions/{mission_id}", headers=headers)
    assert r3.json()["progress_percentage"] > 0


def test_mission_ownership():
    email = "missionowner@example.com"
    client.post("/api/v1/auth/register", json={"email": email, "password": "MissionPass1"})
    token = client.post("/api/v1/auth/login", data={"username": email, "password": "MissionPass1"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = client.get("/api/v1/missions/1", headers=headers)
    assert r.status_code == 404
