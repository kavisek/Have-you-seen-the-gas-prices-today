import os

from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_ai import Agent

load_dotenv()

from logger import logger

MODEL = "anthropic:claude-sonnet-4-6"

SYSTEM_PROMPT = (
    "You are a trade attorney specialising in legitimate tariff engineering for Canadian exporters. "
    "Only suggest changes that result in genuine reclassification under the Harmonized System. "
    "Never suggest misrepresentation or fraud — exclude any such opportunities. "
    "For each opportunity, describe exactly what product change qualifies it for the alternative classification."
)


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


def _make_agent() -> Agent:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    return Agent(MODEL, system_prompt=SYSTEM_PROMPT, output_type=EngineeringResult, output_retries=2)


_agent: Agent | None = None


def get_agent() -> Agent:
    global _agent
    if _agent is None:
        _agent = _make_agent()
    return _agent


async def scan_opportunities(
    hts_code: str,
    description: str,
    annual_volume_cad: float = 0.0,
) -> EngineeringResult:
    logger.info(f"Tariff intelligence scan: hts={hts_code!r} description={description[:60]!r} volume={annual_volume_cad}")
    prompt = (
        f"Current HTS code: {hts_code}. "
        f"Product description: {description}. "
        f"Annual export volume (CAD): {annual_volume_cad}. "
        "List all legitimate alternative HS classifications with lower duty rates. "
        "For each, state the exact product change required to qualify."
    )
    agent = get_agent()
    result = await agent.run(prompt)
    output: EngineeringResult = result.output
    vol = max(annual_volume_cad, 0.0)
    for opp in output.opportunities:
        if opp.duty_delta_pct != 0 and vol > 0:
            opp.estimated_annual_savings_cad = abs(opp.duty_delta_pct / 100.0) * vol
    if not output.disclaimer:
        output.disclaimer = "Consult a licensed customs broker or trade attorney before implementing any reclassification."
    logger.info(f"Tariff intelligence scan complete: {len(output.opportunities)} opportunity(s) found")
    return output
