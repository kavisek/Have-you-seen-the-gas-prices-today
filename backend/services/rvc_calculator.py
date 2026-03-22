from typing import Any

NA_ORIGIN = frozenset({"US", "CA", "MX", "USA", "CAN", "MEX"})


def calculate_rvc_tv(transaction_value: float, non_originating_value: float) -> float:
    if transaction_value <= 0:
        raise ValueError("transaction_value must be positive")
    return round((transaction_value - non_originating_value) / transaction_value * 100.0, 4)


def calculate_rvc_nc(net_cost: float, non_originating_value: float) -> float:
    if net_cost <= 0:
        raise ValueError("net_cost must be positive")
    return round((net_cost - non_originating_value) / net_cost * 100.0, 4)


def determine_qualification(
    hts_code: str,
    tv: float,
    vnm: float,
    nc: float | None = None,
) -> dict[str, Any]:
    _ = hts_code
    if nc is not None and nc > 0:
        rvc = calculate_rvc_nc(nc, vnm)
        threshold = 50.0
        method = "net_cost"
    else:
        rvc = calculate_rvc_tv(tv, vnm)
        threshold = 60.0
        method = "transaction_value"
    qualifies = rvc >= threshold
    return {
        "hts_code": hts_code,
        "rvc_percentage": rvc,
        "threshold": threshold,
        "qualifies": qualifies,
        "method": method,
        "vnm": vnm,
        "transaction_value": tv,
    }


def calculate_breakeven(transaction_value: float, threshold: float = 60.0) -> float:
    return round(transaction_value * (1.0 - threshold / 100.0), 4)


def what_if(
    transaction_value: float,
    current_vnm: float,
    delta_vnm: float,
    threshold: float = 60.0,
) -> dict[str, Any]:
    current_rvc = (
        calculate_rvc_tv(transaction_value, current_vnm) if transaction_value > 0 else 0.0
    )
    new_vnm = current_vnm + delta_vnm
    new_rvc = (
        calculate_rvc_tv(transaction_value, new_vnm) if transaction_value > 0 else 0.0
    )
    still_qualifies = new_rvc >= threshold
    return {
        "current_rvc": current_rvc,
        "new_rvc": new_rvc,
        "still_qualifies": still_qualifies,
        "new_vnm": new_vnm,
    }


def bom_vnm(bom_items: list[dict[str, Any]]) -> float:
    total = 0.0
    for b in bom_items:
        cc = str(b.get("origin_country", "")).upper()
        if cc not in NA_ORIGIN:
            total += float(b.get("unit_cost", 0.0))
    return total


def bom_transaction_value(bom_items: list[dict[str, Any]], transaction_value: float) -> float:
    if transaction_value > 0:
        return transaction_value
    return sum(float(b.get("unit_cost", 0.0)) for b in bom_items)
