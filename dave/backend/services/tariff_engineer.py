from pydantic import BaseModel

from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from config import ANTHROPIC_API_KEY, CLAUDE_MODEL
from services.hts_cache import load_chapter


class EngineeringOpportunity(BaseModel):
    alternative_hts: str
    alternative_rate: str
    duty_delta_pct: float
    required_change: str
    change_complexity: str
    binding_ruling_recommended: bool
    confidence: str
    cbp_precedent: str | None = None
    estimated_annual_savings_cad: float | None = None


class EngineeringResult(BaseModel):
    opportunities: list[EngineeringOpportunity]
    disclaimer: str


_anthropic_provider = AnthropicProvider(api_key=ANTHROPIC_API_KEY or "sk-ant-dummy-key-for-tests")

engineer_agent = Agent(
    AnthropicModel(CLAUDE_MODEL, provider=_anthropic_provider),
    system_prompt=(
        "You are a trade attorney specializing in legitimate tariff engineering. "
        "Only suggest changes that result in genuine reclassification. "
        "Never suggest misrepresentation or fraud — exclude any such opportunities. "
        "For each opportunity, describe exactly what product change qualifies it."
    ),
    output_type=EngineeringResult,
)


def _run_output(run_result: object) -> EngineeringResult:
    out = getattr(run_result, "output", None) or getattr(run_result, "data", None)
    if isinstance(out, EngineeringResult):
        return out
    if out is None:
        return EngineeringResult(
            opportunities=[],
            disclaimer="Consult a licensed customs broker before implementing changes.",
        )
    return out


async def scan_engineering_opportunities(
    hts_code: str,
    description: str,
    annual_volume_cad: float = 0.0,
) -> EngineeringResult:
    digits = "".join(c for c in hts_code if c.isdigit())[:2]
    chapter = int(digits) if digits else 94
    ch_data = load_chapter(chapter) or {}
    prompt = (
        f"Current US HTS: {hts_code}. Product: {description}. "
        f"Annual export volume (CAD): {annual_volume_cad}. "
        f"Nearby chapter HTS context (excerpt): {str(ch_data)[:4000]}. "
        "List legitimate alternative classifications with lower duty if any."
    )
    run_result = await engineer_agent.run(prompt)
    result = _run_output(run_result)
    vol = max(annual_volume_cad, 0.0)
    for opp in result.opportunities:
        if opp.duty_delta_pct != 0 and vol > 0:
            opp.estimated_annual_savings_cad = abs(opp.duty_delta_pct / 100.0) * vol
    if not result.disclaimer:
        result.disclaimer = "Consult a trade attorney before implementing changes."
    return result
