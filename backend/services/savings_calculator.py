from typing import Any

ATTORNEY_RATE_CAD = 450.0

TASK_HOURS = {
    "classify": {"min": 2.0, "mid": 3.0, "max": 4.0},
    "usmca": {"min": 3.0, "mid": 4.5, "max": 6.0},
    "engineer": {"min": 4.0, "mid": 6.0, "max": 8.0},
    "coo": {"min": 1.0, "mid": 1.5, "max": 2.0},
    "binding": {"min": 8.0, "mid": 11.5, "max": 15.0},
}

TARIFFIQ_COST = {
    "classify": 0.003,
    "usmca": 0.006,
    "engineer": 0.008,
    "coo": 0.001,
    "binding": 0.012,
}

TARIFFIQ_SECONDS = {
    "classify": 12,
    "usmca": 20,
    "engineer": 25,
    "coo": 3,
    "binding": 35,
}


def calculate_savings(
    tasks: dict[str, int],
    attorney_rate: float,
    estimate: str,
) -> dict[str, Any]:
    breakdown: list[dict[str, Any]] = []
    total_attorney = 0.0
    total_tariffiq = 0.0
    total_hours = 0.0

    est_key = estimate if estimate in ("min", "mid", "max") else "mid"

    for task, count in tasks.items():
        if task not in TASK_HOURS or count == 0:
            continue
        hours = TASK_HOURS[task][est_key] * count
        attorney_cost = hours * attorney_rate
        tariffiq_cost = TARIFFIQ_COST[task] * count
        tariffiq_secs = TARIFFIQ_SECONDS[task] * count
        attorney_secs = hours * 3600.0
        savings_cad = attorney_cost - tariffiq_cost

        breakdown.append(
            {
                "task": task,
                "count": count,
                "attorney_hours": hours,
                "attorney_cost": attorney_cost,
                "tariffiq_cost": tariffiq_cost,
                "tariffiq_seconds": tariffiq_secs,
                "savings_cad": savings_cad,
                "savings_hours": hours,
                "speedup_factor": attorney_secs / max(tariffiq_secs, 1),
            }
        )
        total_attorney += attorney_cost
        total_tariffiq += tariffiq_cost
        total_hours += hours

    total_savings = total_attorney - total_tariffiq
    avg_speedup = (
        sum(t["speedup_factor"] for t in breakdown) / max(len(breakdown), 1)
        if breakdown
        else 0.0
    )

    return {
        "task_breakdown": breakdown,
        "total_attorney_cost": total_attorney,
        "total_tariffiq_cost": total_tariffiq,
        "total_savings_cad": total_savings,
        "total_hours_saved": total_hours,
        "avg_speedup_factor": avg_speedup,
        "annual_projection": total_savings * 12,
        "roi_percentage": (total_savings / max(total_tariffiq, 0.001)) * 100,
    }


def get_rates() -> dict[str, Any]:
    return {
        "attorney_rate": ATTORNEY_RATE_CAD,
        "task_hours": TASK_HOURS,
        "tariffiq_cost": TARIFFIQ_COST,
        "tariffiq_seconds": TARIFFIQ_SECONDS,
    }
