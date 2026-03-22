from typing import Any

from fastapi import APIRouter

from models.schemas import EngineerRequest, EngineerResponse, EngineeringOpportunityOut
from services.savings_calculator import calculate_savings
from services.tariff_engineer import scan_engineering_opportunities

router = APIRouter()


def _savings_engineer() -> dict[str, Any]:
    raw = calculate_savings({"engineer": 1}, attorney_rate=450.0, estimate="mid")
    tb = raw["task_breakdown"][0] if raw["task_breakdown"] else None
    return {
        "attorney_cost_cad": tb["attorney_cost"] if tb else 0.0,
        "tariffiq_cost": tb["tariffiq_cost"] if tb else 0.0,
    }


@router.post("/engineer")
async def post_engineer(req: EngineerRequest) -> EngineerResponse:
    vol = req.annual_volume_cad or 0.0
    result = await scan_engineering_opportunities(req.hts_code, req.description, vol)
    opps = [
        EngineeringOpportunityOut(
            alternative_hts=o.alternative_hts,
            alternative_rate=o.alternative_rate,
            duty_delta_pct=o.duty_delta_pct,
            required_change=o.required_change,
            change_complexity=o.change_complexity,
            binding_ruling_recommended=o.binding_ruling_recommended,
            confidence=o.confidence,
            cbp_precedent=o.cbp_precedent,
            estimated_annual_savings_cad=o.estimated_annual_savings_cad,
        )
        for o in result.opportunities
    ]
    total_sav = sum(
        (o.estimated_annual_savings_cad or 0.0) for o in result.opportunities
    )
    return EngineerResponse(
        opportunities=opps,
        disclaimer=result.disclaimer,
        estimated_annual_savings=total_sav or None,
        savings_estimate=_savings_engineer(),
    )


@router.get("/rulings")
async def list_rulings_proxy(term: str = "", hts: str = ""):
    from services.cbp_rulings import search_rulings

    return await search_rulings(term or "classification", hts=hts, limit=20)
