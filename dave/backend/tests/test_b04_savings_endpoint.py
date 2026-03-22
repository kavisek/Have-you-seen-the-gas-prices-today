import pytest


def test_savings_calculate_returns_200(client):
    payload = {
        "tasks_completed": {"classify": 1, "usmca": 1},
        "attorney_rate": 450.0,
        "estimate": "mid",
    }
    resp = client.post("/savings/calculate", json=payload)
    assert resp.status_code == 200


def test_savings_calculate_response_schema(client):
    payload = {"tasks_completed": {"classify": 1}}
    resp = client.post("/savings/calculate", json=payload)
    data = resp.json()
    assert "task_breakdown" in data
    assert "total_savings_cad" in data
    assert "total_attorney_cost" in data
    assert "total_tariffiq_cost" in data
    assert "total_hours_saved" in data
    assert "roi_percentage" in data
    assert "annual_projection" in data


def test_savings_calculate_math_via_api(client):
    payload = {"tasks_completed": {"classify": 1}, "attorney_rate": 450.0, "estimate": "mid"}
    resp = client.post("/savings/calculate", json=payload)
    data = resp.json()
    assert data["total_attorney_cost"] == pytest.approx(1350.0, rel=0.01)


def test_savings_calculate_empty_tasks(client):
    payload = {"tasks_completed": {}}
    resp = client.post("/savings/calculate", json=payload)
    assert resp.status_code == 200
    assert resp.json()["total_savings_cad"] == 0.0


def test_savings_calculate_invalid_task_key_ignored(client):
    payload = {"tasks_completed": {"invalid_task": 5}}
    resp = client.post("/savings/calculate", json=payload)
    assert resp.status_code == 200


def test_savings_rates_returns_200(client):
    resp = client.get("/savings/rates")
    assert resp.status_code == 200


def test_savings_rates_schema(client):
    resp = client.get("/savings/rates")
    data = resp.json()
    assert "attorney_rate" in data
    assert "task_hours" in data


def test_existing_endpoints_unaffected(client):
    assert client.get("/health/").status_code == 200
    assert client.get("/hs-codes/?q=wood&page_size=5").status_code == 200
