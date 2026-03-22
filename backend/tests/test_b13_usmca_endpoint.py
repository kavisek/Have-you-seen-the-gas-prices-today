from unittest.mock import AsyncMock, MagicMock, patch

from services.usmca_checker import USMCAResult

MOCK_USMCA_RESULT = USMCAResult(
    rule_applied="RVC",
    method="transaction_value",
    rvc_percentage=70.0,
    threshold=60.0,
    qualifies=True,
    reasoning="Passes",
    annex_4b_reference="Ch94",
    special_warnings=[],
    what_if_breakeven=400.0,
)

BOM_PAYLOAD = {
    "hts_code": "9403.60.00",
    "transaction_value": 1000.0,
    "bom_items": [
        {"material_name": "Oak", "origin_country": "CA", "unit_cost": 600.0, "currency": "CAD"},
        {"material_name": "Bolts", "origin_country": "CN", "unit_cost": 100.0, "currency": "CAD"},
    ],
}


def test_usmca_check_returns_200(client):
    with patch("controllers.usmca_controller.check_usmca", new=AsyncMock(return_value=MOCK_USMCA_RESULT)):
        resp = client.post("/usmca/check", json=BOM_PAYLOAD)
        assert resp.status_code == 200


def test_usmca_check_response_has_qualifies(client):
    with patch("controllers.usmca_controller.check_usmca", new=AsyncMock(return_value=MOCK_USMCA_RESULT)):
        resp = client.post("/usmca/check", json=BOM_PAYLOAD)
        assert "qualifies" in resp.json()


def test_usmca_check_response_has_rvc(client):
    with patch("controllers.usmca_controller.check_usmca", new=AsyncMock(return_value=MOCK_USMCA_RESULT)):
        resp = client.post("/usmca/check", json=BOM_PAYLOAD)
        data = resp.json()
        assert "rvc_percentage" in data
        assert data["rvc_percentage"] == 70.0


def test_usmca_check_missing_hts_returns_422(client):
    payload = {k: v for k, v in BOM_PAYLOAD.items() if k != "hts_code"}
    resp = client.post("/usmca/check", json=payload)
    assert resp.status_code == 422


def test_usmca_rule_lookup_returns_200(client):
    with patch("controllers.usmca_controller.get_usmca_rule", return_value={"rule": "RVC 60", "code": "9403"}):
        resp = client.get("/usmca/rule/9403")
        assert resp.status_code == 200


def test_usmca_rule_unknown_returns_404(client):
    with patch("controllers.usmca_controller.get_usmca_rule", return_value=None):
        resp = client.get("/usmca/rule/9999")
        assert resp.status_code == 404


def test_usmca_response_includes_savings_estimate(client):
    with patch("controllers.usmca_controller.check_usmca", new=AsyncMock(return_value=MOCK_USMCA_RESULT)):
        resp = client.post("/usmca/check", json=BOM_PAYLOAD)
        data = resp.json()
        assert "savings_estimate" in data
        assert data["savings_estimate"]["attorney_cost_cad"] > 0
