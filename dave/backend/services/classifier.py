from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel
from pydantic_ai.providers.anthropic import AnthropicProvider

from config import ANTHROPIC_API_KEY, CLAUDE_MODEL
from services.cbp_rulings import search_rulings
from services.hs_search import search_hs_codes


class HTSCandidate(BaseModel):
    hts_code: str
    description: str
    duty_rate: str
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    gri_applied: str
    warnings: list[str] = Field(default_factory=list)


class ClassificationResult(BaseModel):
    candidates: list[HTSCandidate]
    needs_more_info: bool = False
    additional_info_needed: str | None = None


_anthropic_provider = AnthropicProvider(api_key=ANTHROPIC_API_KEY or "sk-ant-dummy-key-for-tests")

classifier_agent = Agent(
    AnthropicModel(CLAUDE_MODEL, provider=_anthropic_provider),
    system_prompt=(
        "You are a licensed US Customs Broker with 20 years of HTS classification experience. "
        "Apply General Rules of Interpretation (GRI) strictly in order: GRI 1, 2, 3, 4, 5, 6. "
        "Always cite the specific HTS heading number and legal note that controls. "
        "Warn about Section 301 tariffs, antidumping duties, or required permits. "
        "Never guess — if uncertain, set needs_more_info=true."
    ),
    output_type=ClassificationResult,
)


def _run_output(run_result: object) -> ClassificationResult:
    out = getattr(run_result, "output", None) or getattr(run_result, "data", None)
    if isinstance(out, ClassificationResult):
        return out
    if out is None:
        return ClassificationResult(candidates=[], needs_more_info=True, additional_info_needed="No result")
    return out


async def classify_product(
    description: str, material: str = "", use_case: str = ""
) -> ClassificationResult:
    matches = search_hs_codes(description or "goods", limit=10)
    context = "\n".join(
        [
            f"- Canadian HS {m.get('tariff', '')}: {m.get('description', '')} "
            f"(MFN: {m.get('mfn', '')}, UST: {m.get('ust', '')})"
            for m in matches[:10]
        ]
    )
    prompt = (
        f"Product description: {description}\n"
        f"Material: {material}\n"
        f"Primary use: {use_case}\n\n"
        f"Matching Canadian HS codes from the tariff schedule:\n{context}\n\n"
        "Cross-reference to US HTS codes and classify this product. "
        "Return the top 3 candidates ranked by confidence."
    )
    run_result = await classifier_agent.run(prompt)
    result = _run_output(run_result)
    norm: list[HTSCandidate] = []
    for c in result.candidates:
        if isinstance(c, HTSCandidate):
            norm.append(c)
        else:
            norm.append(HTSCandidate.model_validate(c.model_dump()))
    result = ClassificationResult(
        candidates=norm,
        needs_more_info=result.needs_more_info,
        additional_info_needed=result.additional_info_needed,
    )
    updated: list[HTSCandidate] = []
    for c in result.candidates:
        rulings = await search_rulings(c.description[:80] if c.description else description, limit=3)
        refs = []
        for r in rulings:
            ref = r.get("reference") or r.get("rulingNumber") or r.get("id")
            if ref:
                refs.append(str(ref))
        extra = [] if not refs else [f"CBP precedents: {', '.join(refs)}"]
        updated.append(
            c.model_copy(update={"warnings": list(c.warnings) + extra})
        )
    return ClassificationResult(
        candidates=updated if updated else result.candidates,
        needs_more_info=result.needs_more_info,
        additional_info_needed=result.additional_info_needed,
    )
