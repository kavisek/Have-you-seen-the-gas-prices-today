from unittest.mock import AsyncMock, MagicMock, patch

from services.classifier import ClassificationResult, HTSCandidate

MOCK_RESULT = ClassificationResult(
    candidates=[
        HTSCandidate(
            hts_code="9403.60.8081",
            description="Wooden furniture",
            duty_rate="Free",
            confidence=0.92,
            reasoning="Fits Chapter 94",
            gri_applied="GRI 1",
            warnings=[],
        )
    ],
    needs_more_info=False,
    additional_info_needed=None,
)


def test_classify_post_returns_200(client):
    with patch("controllers.classify_controller.classify_product", new=AsyncMock(return_value=MOCK_RESULT)):
        resp = client.post("/classify", json={"name": "Desk", "description": "Wooden office desk"})
        assert resp.status_code == 200


def test_classify_post_response_has_candidates(client):
    with patch("controllers.classify_controller.classify_product", new=AsyncMock(return_value=MOCK_RESULT)):
        resp = client.post("/classify", json={"name": "Desk", "description": "Wooden desk"})
        data = resp.json()
        assert "candidates" in data
        assert len(data["candidates"]) >= 1


def test_classify_post_missing_description_returns_422(client):
    resp = client.post("/classify", json={"name": "Desk"})
    assert resp.status_code == 422


def test_classify_get_nonexistent_returns_404(client):
    resp = client.get("/classify/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


def test_classify_response_includes_savings_estimate(client):
    with patch("controllers.classify_controller.classify_product", new=AsyncMock(return_value=MOCK_RESULT)):
        resp = client.post("/classify", json={"name": "Desk", "description": "Wooden desk"})
        data = resp.json()
        assert "savings_estimate" in data
        assert data["savings_estimate"]["attorney_cost_cad"] > 0
