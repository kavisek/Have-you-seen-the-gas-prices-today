from fastapi import APIRouter

from models.schemas import SavingsRequest, SavingsResult, TaskSaving
from services.savings_calculator import calculate_savings, get_rates

router = APIRouter()


@router.post("/calculate", description="Calculate savings vs hiring a trade attorney.")
async def calculate_savings_endpoint(req: SavingsRequest) -> SavingsResult:
    raw = calculate_savings(
        req.tasks_completed,
        attorney_rate=req.attorney_rate,
        estimate=req.estimate,
    )
    breakdown = [
        TaskSaving(
            task=t["task"],
            count=t["count"],
            attorney_hours=t["attorney_hours"],
            attorney_cost=t["attorney_cost"],
            tariffiq_cost=t["tariffiq_cost"],
            tariffiq_seconds=t["tariffiq_seconds"],
            savings_cad=t["savings_cad"],
            savings_hours=t["savings_hours"],
            speedup_factor=t["speedup_factor"],
        )
        for t in raw["task_breakdown"]
    ]
    return SavingsResult(
        task_breakdown=breakdown,
        total_attorney_cost=raw["total_attorney_cost"],
        total_tariffiq_cost=raw["total_tariffiq_cost"],
        total_savings_cad=raw["total_savings_cad"],
        total_hours_saved=raw["total_hours_saved"],
        avg_speedup_factor=raw["avg_speedup_factor"],
        annual_projection=raw["annual_projection"],
        roi_percentage=raw["roi_percentage"],
    )


@router.get("/rates", description="Reference rates for the savings calculator UI.")
async def savings_rates():
    return get_rates()
