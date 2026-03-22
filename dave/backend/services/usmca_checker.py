from pydantic import BaseModel

from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from config import ANTHROPIC_API_KEY, CLAUDE_MODEL
from services.rvc_calculator import (
    bom_transaction_value,
    bom_vnm,
    calculate_breakeven,
    calculate_rvc_tv,
    what_if,
)
from services.usmca_rules import get_rule


class USMCAResult(BaseModel):
    rule_applied: str
    method: str
    rvc_percentage: float | None
    threshold: float
    qualifies: bool
    reasoning: str
    annex_4b_reference: str
    special_warnings: list[str] = []
    what_if_breakeven: float | None = None


_anthropic_provider = AnthropicProvider(api_key=ANTHROPIC_API_KEY or "sk-ant-dummy-key-for-tests")

usmca_agent = Agent(
    AnthropicModel(CLAUDE_MODEL, provider=_anthropic_provider),
    system_prompt=(
        "You are a USMCA rules of origin specialist. "
        "Apply rules in order: Wholly Obtained, TCC, RVC, Specific Process. "
        "For RVC: Transaction Value method (>=60%) first, Net Cost (>=50%) second. "
        "Show reasoning. Cite the specific Annex 4-B rule. Flag automotive/textile/steel goods."
    ),
    output_type=USMCAResult,
)


def _run_output(run_result: object) -> USMCAResult:
    out = getattr(run_result, "output", None) or getattr(run_result, "data", None)
    if isinstance(out, USMCAResult):
        return out
    if out is None:
        return USMCAResult(
            rule_applied="RVC",
            method="transaction_value",
            rvc_percentage=0.0,
            threshold=60.0,
            qualifies=False,
            reasoning="No result",
            annex_4b_reference="",
            special_warnings=[],
        )
    return out


async def check_usmca(
    hts_code: str,
    transaction_value: float,
    bom_items: list[dict],
) -> USMCAResult:
    tv = bom_transaction_value(bom_items, transaction_value)
    vnm = bom_vnm(bom_items)
    rule_text = get_rule(hts_code) or ""
    breakeven = calculate_breakeven(tv, 60.0) if tv > 0 else 0.0
    if tv <= 0:
        prompt = (
            f"HTS {hts_code}. No transaction value or BOM. Annex rule: {rule_text[:500]}. "
            "Respond with qualifies=false, rvc 0."
        )
        run_result = await usmca_agent.run(prompt)
        r = _run_output(run_result)
        r.what_if_breakeven = breakeven
        return r
    rvc = calculate_rvc_tv(tv, vnm)
    threshold = 60.0
    qualifies = rvc >= threshold
    wf = what_if(tv, vnm, 0.0, threshold)
    prompt = (
        f"HTS {hts_code}. Transaction value {tv}, VNM {vnm}, RVC {rvc:.2f}%. "
        f"Threshold {threshold}%. Qualifies: {qualifies}. Annex 4-B: {rule_text[:800]}. "
        f"What-if same VNM: breakeven max non-originating value ~ {breakeven}. "
        "Return structured USMCAResult consistent with these numbers."
    )
    run_result = await usmca_agent.run(prompt)
    r = _run_output(run_result)
    r.rvc_percentage = rvc
    r.qualifies = qualifies
    r.threshold = threshold
    r.method = "transaction_value"
    r.rule_applied = "RVC" if "RVC" in rule_text.upper() else "Annex"
    r.what_if_breakeven = breakeven
    r.annex_4b_reference = rule_text[:200] if rule_text else hts_code[:4]
    r.reasoning = (
        f"RVC (transaction value) = ({tv}-{vnm})/{tv}*100 = {rvc:.2f}%. "
        f"Still qualifies after delta test: {wf.get('still_qualifies')}."
    )
    return r


def get_usmca_rule(hts_code: str) -> dict | None:
    text = get_rule(hts_code)
    if not text:
        return None
    return {"hts_prefix": hts_code[:4], "rule": text, "code": hts_code[:4]}
