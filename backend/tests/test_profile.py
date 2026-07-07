"""Profile tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _auth_headers(email="profileuser@example.com", password="ProfilePass123"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    token = client.post("/api/v1/auth/login", data={"username": email, "password": password}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_get_and_update_profile():
    headers = _auth_headers()
    r = client.get("/api/v1/profile", headers=headers)
    assert r.status_code == 200

    r2 = client.put(
        "/api/v1/profile",
        headers=headers,
        json={"full_name": "Amit Patel", "state": "Maharashtra", "income_band": "below_1l"},
    )
    assert r2.status_code == 200
    assert r2.json()["full_name"] == "Amit Patel"
    assert r2.json()["state"] == "Maharashtra"
