from unittest.mock import AsyncMock, MagicMock, patch

from services.tariff_engineer import EngineeringOpportunity, EngineeringResult

MOCK_ENG_RESULT = EngineeringResult(
    opportunities=[
        EngineeringOpportunity(
            alternative_hts="3926.90.4500",
            alternative_rate="Free",
            duty_delta_pct=-5.3,
            required_change="Design for medical use",
            change_complexity="major",
            binding_ruling_recommended=True,
            confidence="medium",
            cbp_precedent=None,
        )
    ],
    disclaimer="Consult a trade attorney.",
)


def test_engineer_post_returns_200(client):
    with patch(
        "controllers.engineer_controller.scan_engineering_opportunities",
        new=AsyncMock(return_value=MOCK_ENG_RESULT),
    ):
        resp = client.post("/engineer", json={"hts_code": "9403.60.00", "description": "desk"})
        assert resp.status_code == 200


def test_engineer_response_has_opportunities(client):
    with patch(
        "controllers.engineer_controller.scan_engineering_opportunities",
        new=AsyncMock(return_value=MOCK_ENG_RESULT),
    ):
        resp = client.post("/engineer", json={"hts_code": "9403.60.00", "description": "desk"})
        data = resp.json()
        assert "opportunities" in data


def test_engineer_response_has_disclaimer(client):
    with patch(
        "controllers.engineer_controller.scan_engineering_opportunities",
        new=AsyncMock(return_value=MOCK_ENG_RESULT),
    ):
        resp = client.post("/engineer", json={"hts_code": "9403.60.00", "description": "desk"})
        assert resp.json()["disclaimer"]


def test_engineer_missing_hts_returns_422(client):
    resp = client.post("/engineer", json={"description": "desk"})
    assert resp.status_code == 422


def test_engineer_savings_estimate_in_response(client):
    with patch(
        "controllers.engineer_controller.scan_engineering_opportunities",
        new=AsyncMock(return_value=MOCK_ENG_RESULT),
    ):
        resp = client.post(
            "/engineer",
            json={
                "hts_code": "9403.60.00",
                "description": "desk",
                "annual_volume_cad": 100000,
            },
        )
        data = resp.json()
        assert "savings_estimate" in data
