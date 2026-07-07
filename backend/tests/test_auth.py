"""Authentication tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login():
    email = "testuser@example.com"
    r = client.post("/api/v1/auth/register", json={"email": email, "password": "TestPass123", "full_name": "Test User"})
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == email

    r2 = client.post("/api/v1/auth/login", data={"username": email, "password": "TestPass123"})
    assert r2.status_code == 200
    assert "access_token" in r2.json()


def test_protected_route_requires_auth():
    r = client.get("/api/v1/profile")
    assert r.status_code == 401


def test_me_endpoint():
    email = "meuser@example.com"
    reg = client.post("/api/v1/auth/register", json={"email": email, "password": "SecurePass99"})
    token = reg.json()["access_token"]
    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == email
