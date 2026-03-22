import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services.tariff_engineer import EngineeringOpportunity, EngineeringResult, scan_engineering_opportunities


def test_engineering_opportunity_schema():
    opp = EngineeringOpportunity(
        alternative_hts="3926.90.4500",
        alternative_rate="Free",
        duty_delta_pct=-5.3,
        required_change="Design for medical use",
        change_complexity="major",
        binding_ruling_recommended=True,
        confidence="medium",
        cbp_precedent=None,
    )
    assert opp.duty_delta_pct < 0


def test_engineering_result_schema():
    result = EngineeringResult(
        opportunities=[],
        disclaimer="Consult a trade attorney before implementing changes.",
    )
    assert "attorney" in result.disclaimer.lower()


def test_scan_returns_result():
    async def run():
        with patch("services.tariff_engineer.engineer_agent") as mock_agent, patch(
            "services.tariff_engineer.load_chapter", return_value={}
        ):
            mock_result = MagicMock()
            mock_result.output = EngineeringResult(
                opportunities=[], disclaimer="Consult attorney."
            )
            mock_agent.run = AsyncMock(return_value=mock_result)
            return await scan_engineering_opportunities("9403.60.00", "wooden desk", 50000)

    result = asyncio.run(run())
    assert hasattr(result, "opportunities")


def test_savings_calculated_per_opportunity():
    opp = EngineeringOpportunity(
        alternative_hts="3926.90.4500",
        alternative_rate="Free",
        duty_delta_pct=-5.3,
        required_change="test",
        change_complexity="minor",
        binding_ruling_recommended=False,
        confidence="high",
        cbp_precedent=None,
    )
    annual_volume = 100000
    savings = abs(opp.duty_delta_pct / 100) * annual_volume
    assert savings == pytest.approx(5300.0)


def test_negative_delta_means_savings():
    opp = EngineeringOpportunity(
        alternative_hts="x",
        alternative_rate="Free",
        duty_delta_pct=-5.3,
        required_change="x",
        change_complexity="minor",
        binding_ruling_recommended=False,
        confidence="high",
        cbp_precedent=None,
    )
    assert opp.duty_delta_pct < 0


def test_disclaimer_always_present():
    async def run():
        with patch("services.tariff_engineer.engineer_agent") as mock_agent, patch(
            "services.tariff_engineer.load_chapter", return_value={}
        ):
            mock_result = MagicMock()
            mock_result.output = EngineeringResult(
                opportunities=[], disclaimer="Always consult attorney."
            )
            mock_agent.run = AsyncMock(return_value=mock_result)
            return await scan_engineering_opportunities("9403.60.00", "desk", 0)

    result = asyncio.run(run())
    assert len(result.disclaimer) > 0
