import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services.rvc_calculator import calculate_rvc_tv
from services.usmca_checker import USMCAResult, check_usmca

BOM_PASS = [
    {"material_name": "Canadian oak", "origin_country": "CA", "unit_cost": 600.0, "currency": "CAD"},
    {"material_name": "Chinese bolts", "origin_country": "CN", "unit_cost": 100.0, "currency": "CAD"},
    {"material_name": "Canadian labour", "origin_country": "CA", "unit_cost": 300.0, "currency": "CAD"},
]

BOM_FAIL = [
    {"material_name": "Chinese parts", "origin_country": "CN", "unit_cost": 700.0, "currency": "CAD"},
    {"material_name": "Canadian assembly", "origin_country": "CA", "unit_cost": 100.0, "currency": "CAD"},
]


def test_usmca_result_schema():
    result = USMCAResult(
        rule_applied="RVC",
        method="transaction_value",
        rvc_percentage=70.0,
        threshold=60.0,
        qualifies=True,
        reasoning="RVC 70% exceeds 60% threshold",
        annex_4b_reference="Chapter 94",
        special_warnings=[],
    )
    assert result.qualifies is True


def test_rvc_pass_case():
    async def run():
        with patch("services.usmca_checker.usmca_agent") as mock_agent:
            mock_result = MagicMock()
            mock_result.output = USMCAResult(
                rule_applied="RVC",
                method="transaction_value",
                rvc_percentage=70.0,
                threshold=60.0,
                qualifies=True,
                reasoning="Passes",
                annex_4b_reference="Ch94",
                special_warnings=[],
            )
            mock_agent.run = AsyncMock(return_value=mock_result)
            return await check_usmca("9403.60.00", 1000.0, BOM_PASS)

    result = asyncio.run(run())
    assert result.qualifies is True


def test_rvc_fail_case():
    async def run():
        with patch("services.usmca_checker.usmca_agent") as mock_agent:
            mock_result = MagicMock()
            mock_result.output = USMCAResult(
                rule_applied="RVC",
                method="transaction_value",
                rvc_percentage=25.0,
                threshold=60.0,
                qualifies=False,
                reasoning="Fails",
                annex_4b_reference="Ch94",
                special_warnings=[],
            )
            mock_agent.run = AsyncMock(return_value=mock_result)
            return await check_usmca("9403.60.00", 800.0, BOM_FAIL)

    result = asyncio.run(run())
    assert result.qualifies is False


def test_rvc_math_is_correct_in_pass_case():
    tv = sum(b["unit_cost"] for b in BOM_PASS)
    vnm = sum(b["unit_cost"] for b in BOM_PASS if b["origin_country"] != "CA")
    rvc = calculate_rvc_tv(tv, vnm)
    assert rvc == pytest.approx(90.0)
    assert rvc >= 60.0


def test_what_if_breakeven_in_result():
    async def run():
        with patch("services.usmca_checker.usmca_agent") as mock_agent:
            mock_result = MagicMock()
            mock_result.output = USMCAResult(
                rule_applied="RVC",
                method="transaction_value",
                rvc_percentage=90.0,
                threshold=60.0,
                qualifies=True,
                reasoning="Passes",
                annex_4b_reference="Ch94",
                special_warnings=[],
                what_if_breakeven=400.0,
            )
            mock_agent.run = AsyncMock(return_value=mock_result)
            return await check_usmca("9403.60.00", 1000.0, BOM_PASS)

    result = asyncio.run(run())
    assert hasattr(result, "what_if_breakeven")


def test_empty_bom_handled():
    async def run():
        with patch("services.usmca_checker.usmca_agent") as mock_agent:
            mock_agent.run = AsyncMock(
                return_value=MagicMock(
                    output=USMCAResult(
                        qualifies=False,
                        rvc_percentage=0.0,
                        threshold=60.0,
                        method="transaction_value",
                        rule_applied="RVC",
                        reasoning="No BOM",
                        annex_4b_reference="",
                        special_warnings=[],
                    )
                )
            )
            return await check_usmca("9403.60.00", 0.0, [])

    result = asyncio.run(run())
    assert result.qualifies is False
