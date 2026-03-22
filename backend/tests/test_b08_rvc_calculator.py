import pytest

from services.rvc_calculator import (
    bom_transaction_value,
    bom_vnm,
    calculate_breakeven,
    calculate_rvc_nc,
    calculate_rvc_tv,
    determine_qualification,
    what_if,
)


def test_rvc_tv_basic():
    assert calculate_rvc_tv(1000, 300) == pytest.approx(70.0)


def test_rvc_tv_all_originating():
    assert calculate_rvc_tv(1000, 0) == pytest.approx(100.0)


def test_rvc_tv_all_non_originating():
    assert calculate_rvc_tv(1000, 1000) == pytest.approx(0.0)


def test_rvc_tv_exact_threshold():
    assert calculate_rvc_tv(1000, 400) == pytest.approx(60.0)


def test_rvc_tv_zero_tv_raises():
    with pytest.raises((ZeroDivisionError, ValueError)):
        calculate_rvc_tv(0, 0)


def test_rvc_nc_basic():
    assert calculate_rvc_nc(800, 300) == pytest.approx(62.5)


def test_rvc_nc_threshold_is_50():
    assert calculate_rvc_nc(1000, 500) == pytest.approx(50.0)


def test_qualifies_at_60pct():
    result = determine_qualification("9403.60.00", tv=1000, vnm=350)
    assert result["rvc_percentage"] == pytest.approx(65.0)
    assert result["qualifies"] is True
    assert result["threshold"] == 60.0


def test_fails_below_60pct():
    result = determine_qualification("9403.60.00", tv=1000, vnm=450)
    assert result["rvc_percentage"] == pytest.approx(55.0)
    assert result["qualifies"] is False


def test_result_includes_method():
    result = determine_qualification("9403.60.00", tv=1000, vnm=300)
    assert "method" in result
    assert result["method"] in {"transaction_value", "net_cost"}


def test_breakeven_at_60pct():
    assert calculate_breakeven(1000, 60.0) == pytest.approx(400.0)


def test_breakeven_at_50pct():
    assert calculate_breakeven(1000, 50.0) == pytest.approx(500.0)


def test_what_if_adding_materials_reduces_rvc():
    result = what_if(transaction_value=1000, current_vnm=300, delta_vnm=100)
    assert result["new_rvc"] < result["current_rvc"]


def test_what_if_still_qualifies():
    result = what_if(transaction_value=1000, current_vnm=300, delta_vnm=50)
    assert "still_qualifies" in result
    assert result["still_qualifies"] is True


def test_what_if_fails_after_delta():
    result = what_if(transaction_value=1000, current_vnm=300, delta_vnm=200)
    assert result["still_qualifies"] is False


def test_bom_helpers():
    bom = [
        {"origin_country": "CA", "unit_cost": 600.0},
        {"origin_country": "CN", "unit_cost": 100.0},
    ]
    assert bom_vnm(bom) == pytest.approx(100.0)
    assert bom_transaction_value(bom, 0) == pytest.approx(700.0)
