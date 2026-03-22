import pytest

from services.savings_calculator import ATTORNEY_RATE_CAD, calculate_savings, get_rates


def test_single_classify_mid_estimate():
    result = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="mid")
    breakdown = result["task_breakdown"]
    assert len(breakdown) == 1
    task = breakdown[0]
    assert task["task"] == "classify"
    assert task["attorney_hours"] == 3.0
    assert task["attorney_cost"] == pytest.approx(1350.0)
    assert task["tariffiq_cost"] == pytest.approx(0.003)
    assert task["savings_cad"] == pytest.approx(1349.997)


def test_multiple_tasks_total():
    result = calculate_savings(
        {"classify": 2, "usmca": 1, "coo": 1},
        attorney_rate=450.0,
        estimate="mid",
    )
    assert result["total_attorney_cost"] == pytest.approx(5400.0)


def test_min_estimate_lower_than_max():
    min_r = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="min")
    max_r = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="max")
    assert min_r["total_attorney_cost"] < max_r["total_attorney_cost"]


def test_zero_tasks_returns_zero():
    result = calculate_savings({}, attorney_rate=450.0, estimate="mid")
    assert result["total_savings_cad"] == 0.0
    assert result["task_breakdown"] == []


def test_custom_attorney_rate():
    result = calculate_savings({"classify": 1}, attorney_rate=600.0, estimate="mid")
    assert result["total_attorney_cost"] == pytest.approx(1800.0)


def test_speedup_factor_positive():
    result = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="mid")
    task = result["task_breakdown"][0]
    assert task["speedup_factor"] > 100


def test_roi_percentage_high():
    result = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="mid")
    assert result["roi_percentage"] > 10000


def test_annual_projection_is_12x_monthly():
    result = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="mid")
    assert result["annual_projection"] == pytest.approx(result["total_savings_cad"] * 12)


def test_get_rates_structure():
    rates = get_rates()
    assert "attorney_rate" in rates
    assert "task_hours" in rates
    assert "tariffiq_cost" in rates
    assert "tariffiq_seconds" in rates
    assert "classify" in rates["task_hours"]


def test_attorney_rate_constant():
    assert ATTORNEY_RATE_CAD == 450.0
