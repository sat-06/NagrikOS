"""AI Saathi tests."""

import pytest
from fastapi.testclient import TestClient

from app.ai.fallback import extract_life_situation, fallback_saathi_response
from app.ai.rag import CivicKnowledgeRetriever
from app.db.session import SessionLocal
from app.main import app

client = TestClient(app)


def test_life_situation_extraction():
    text = "My widowed mother is 62 and needs healthcare support."
    result = extract_life_situation(text)
    assert result["intent"] in ("healthcare_support", "senior_citizen_support")
    assert 62 in result.get("explicitly_known_ages", [])
    assert "state" in result.get("missing_information", [])


def test_fallback_saathi_no_key():
    result = fallback_saathi_response("I lost my job", [])
    assert result["answer"]
    assert result["confidence"] < 1.0
    assert "disclaimer" in result


def test_grounded_retrieval():
    db = SessionLocal()
    retriever = CivicKnowledgeRetriever(db)
    results = retriever.search("scholarship education student", limit=3)
    assert len(results) > 0
    assert "name" in results[0]
    db.close()


@pytest.mark.asyncio
async def test_life_situation_endpoint():
    r = client.post("/api/v1/auth/login", data={"username": "demo@nagrikos.in", "password": "Demo@12345"})
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    r2 = client.post(
        "/api/v1/saathi/life-situation",
        headers=headers,
        json={"text": "Mala scholarship sathi konti documents lagtil?"},
    )
    assert r2.status_code == 200
    assert r2.json()["detected_language"] in ("mr", "hi", "en")
