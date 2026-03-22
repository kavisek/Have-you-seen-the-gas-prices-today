from typing import Any

from fastapi import APIRouter, HTTPException

from models.schemas import USMCACheckRequest, USMCACheckResponse
from services.savings_calculator import calculate_savings
from services.usmca_checker import check_usmca, get_usmca_rule

router = APIRouter()


def _savings_usmca() -> dict[str, Any]:
    raw = calculate_savings({"usmca": 1}, attorney_rate=450.0, estimate="mid")
    tb = raw["task_breakdown"][0] if raw["task_breakdown"] else None
    return {
        "attorney_cost_cad": tb["attorney_cost"] if tb else 0.0,
        "tariffiq_cost": tb["tariffiq_cost"] if tb else 0.0,
    }


@router.post("/usmca/check")
async def post_usmca_check(req: USMCACheckRequest) -> USMCACheckResponse:
    bom = [b.model_dump() for b in req.bom_items]
    r = await check_usmca(req.hts_code, req.transaction_value, bom)
    sav = _savings_usmca()
    return USMCACheckResponse(
        qualifies=r.qualifies,
        rvc_percentage=float(r.rvc_percentage or 0.0),
        threshold=float(r.threshold),
        method=r.method,
        rule_applied=r.rule_applied,
        reasoning=r.reasoning,
        annex_4b_reference=r.annex_4b_reference,
        special_warnings=list(r.special_warnings),
        what_if_breakeven=r.what_if_breakeven,
        breakdown=None,
        savings_estimate=sav,
    )


@router.get("/usmca/rule/{hts_code}")
async def get_rule_endpoint(hts_code: str):
    data = get_usmca_rule(hts_code)
    if not data:
        raise HTTPException(status_code=404, detail="No rule found")
    return data
