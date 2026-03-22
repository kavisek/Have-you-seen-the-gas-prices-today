import os
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from pydantic_ai import Agent

from logger import logger

router = APIRouter()

# ---------------------------------------------------------------------------
# Output schema
# ---------------------------------------------------------------------------

class HsCodeEntry(BaseModel):
    hs_code: str = Field(description="HS code in standard format e.g. 4407.10")
    description: str = Field(description="Official product description")
    us_mfn_rate: str = Field(description="US MFN tariff rate applied to all WTO members")
    us_usmca_rate: str = Field(description="US rate for Canadian-origin goods under USMCA/CUSMA")
    canadian_export_permit_required: bool = Field(description="Whether a Canadian export permit is required")


class ExportAnalysis(BaseModel):
    product_name: str = Field(description="Standardised product name as it would appear in trade documents")
    summary: str = Field(description="2-3 sentence overview of key export considerations for this product")
    hs_codes: list[HsCodeEntry] = Field(description="1 to 3 most applicable HS codes for this product")
    canadian_export_requirements: list[str] = Field(
        description="Canadian-side requirements: export permits, CFIA certificates, Health Canada approvals, ITAR/EAR controls, etc."
    )
    us_import_requirements: list[str] = Field(
        description="US-side requirements: FDA registration, USDA APHIS permits, CBP entry, FCC approval, EPA registration, CPSC compliance, etc."
    )
    regulatory_agencies: list[str] = Field(
        description="Key regulatory bodies on both sides of the border relevant to this product"
    )
    trade_remedy_risks: str = Field(
        description="Any active anti-dumping duties, countervailing duties, Section 232/301 tariffs, safeguard measures, or quotas that apply to Canadian exports of this product to the US"
    )
    recommendations: list[str] = Field(
        description="3 to 5 practical, actionable recommendations for a Canadian exporter of this product"
    )


# ---------------------------------------------------------------------------
# Pydantic AI agent
# ---------------------------------------------------------------------------

_agent: Agent | None = None


def get_agent() -> Agent:
    global _agent
    if _agent is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY is not set")
        _agent = Agent(
            "anthropic:claude-sonnet-4-6",
            output_type=ExportAnalysis,
            system_prompt=(
                "You are an expert Canadian trade compliance advisor specialising in exporting goods "
                "from Canada to the United States. "
                "When given a product query you must:\n"
                "1. Identify the correct HS code(s) under both the Canadian Customs Tariff and the US HTSUS.\n"
                "2. State the applicable US MFN rate and the USMCA/CUSMA preferential rate for Canadian-origin goods.\n"
                "3. List all Canadian export requirements (Export and Import Permits Act permits, CFIA health "
                "   certificates, Health Canada authorisations, Strategic Goods List controls, etc.).\n"
                "4. List all US import requirements (FDA prior notice / facility registration, USDA APHIS import "
                "   permit, CBP entry type, FCC authorisation, EPA tolerance, CPSC certification, etc.).\n"
                "5. Identify any active trade remedy measures: anti-dumping duties, countervailing duties, "
                "   Section 232 tariffs (steel/aluminum/autos), Section 301 tariffs (not applicable from Canada "
                "   but note if the product category has been under review), safeguard quotas, or softwood lumber "
                "   CVD/AD orders.\n"
                "6. Provide 3–5 practical recommendations.\n"
                "Be specific, accurate, and focused on 2025-2026 regulations. "
                "If the product is ambiguous, pick the most common commercial interpretation."
            ),
        )
        logger.info("Product analysis agent initialised with anthropic:claude-sonnet-4-6")
    return _agent


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get(
    "/",
    response_model=ExportAnalysis,
    description="Run an AI-powered export analysis for a product from Canada to the United States.",
    tags=["Product Analysis"],
)
async def analyse_product(
    q: str = Query(..., min_length=2, max_length=200, description="Product name or description to analyse"),
):
    try:
        agent = get_agent()
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    logger.info(f"Running export analysis for: {q!r}")
    try:
        result = await agent.run(
            f"Analyse the requirements to export this product from Canada to the United States: {q}"
        )
        return result.output
    except Exception as exc:
        logger.error(f"Analysis failed for {q!r}: {exc}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")
