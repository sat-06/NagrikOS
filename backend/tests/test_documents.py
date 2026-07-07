"""Document tests."""

import io

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _headers():
    r = client.post("/api/v1/auth/login", data={"username": "demo@nagrikos.in", "password": "Demo@12345"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_invalid_extension_rejected():
    headers = _headers()
    files = {"file": ("malware.exe", io.BytesIO(b"fake"), "application/octet-stream")}
    r = client.post("/api/v1/documents/upload", headers=headers, data={"document_type": "identity_proof"}, files=files)
    assert r.status_code == 400


def test_upload_and_readiness():
    headers = _headers()
    content = b"%PDF-1.4 fake pdf content for test"
    files = {"file": ("aadhaar.pdf", io.BytesIO(content), "application/pdf")}
    r = client.post("/api/v1/documents/upload", headers=headers, data={"document_type": "identity_proof"}, files=files)
    assert r.status_code == 201
    doc_id = r.json()["id"]

    services = client.get("/api/v1/services", headers=headers).json()["items"]
    service_id = services[0]["id"]
    r2 = client.post("/api/v1/documents/readiness", headers=headers, json={"service_id": service_id})
    assert r2.status_code == 200
    assert "readiness_percentage" in r2.json()
    assert "disclaimer" in r2.json()

    r3 = client.delete(f"/api/v1/documents/{doc_id}", headers=headers)
    assert r3.status_code == 204


def test_malicious_filename_sanitized():
    headers = _headers()
    files = {"file": ("../../etc/passwd.txt", io.BytesIO(b"hello"), "text/plain")}
    r = client.post("/api/v1/documents/upload", headers=headers, data={"document_type": "identity_proof"}, files=files)
    assert r.status_code == 201
    assert ".." not in r.json()["original_filename"]
