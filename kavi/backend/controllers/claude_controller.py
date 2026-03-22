import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pydantic_ai import Agent

from logger import logger

load_dotenv()

router = APIRouter()

MODEL = "anthropic:claude-sonnet-4-5"

TRADE_SYSTEM_PROMPT = """You are a Canadian trade compliance expert helping users export products to the United States.

When a user searches for a product, analyse it across all seven stages of the trade compliance workflow and return a clear, structured report:

1. Map your trade move
   Identify whether this is an import or export, who the likely parties are, how goods typically move (mode and route), and which Incoterms apply. Explain which rules and agencies will matter based on these facts.

2. Classify with the Harmonized System
   Assign the most accurate HS / tariff classification using product facts and official Canada Border Services Agency (CBSA) guidance — not marketplace labels. Explain why you chose this classification, because it drives duties, reporting, and control-list checks.

3. Read the Canadian Customs Tariff
   Using the classification above, provide the applicable tariff rates, units of measure, and relevant program columns (e.g. MFN, CUSMA/UST, GPT, General Tariff). Note the tariff line relied upon and any preferential treatment available.

4. Export and import controls
   State whether the product requires permits, registrations, or advance notices under the Export and Import Permits Act, Controlled Goods Program, or other applicable regimes. Flag strategic or dual-use items and indicate typical agency review timelines.

5. Sanctions and restricted parties
   Identify any sanctions risk tied to this product category. Advise on screening parties, banks, and payment paths against Canadian (Global Affairs Canada), US (OFAC), and UN sanctions lists; explain what to do if a match is found.

6. Trade agreements and origin
   Identify which trade agreements (CUSMA, CETA, CPTPP, etc.) could reduce duty. Confirm applicable rules of origin and the required proof-of-origin documentation (declarations, certificates, advance rulings).

7. Declarations and recordkeeping
   Summarise the filing requirements: classification, valuation basis, origin declaration, control permits. List the documents to retain (commercial invoice, packing list, permits, B3/B13A as applicable) and the mandatory retention period.

Always ground your response in Canadian law and CBSA guidance. Be specific — give HS codes, tariff rates, agency names, and form numbers where relevant. If information is uncertain, say so and recommend the user seek a licensed customs broker or trade lawyer.

You MUST populate the citations list with real authoritative sources you relied on (government websites, legislation, CBSA publications). Each citation must have a title, organization, and url where available."""


# --- Pydantic output models ---

class Citation(BaseModel):
    title: str
    organization: str
    url: str | None = None


class TradeAnalysis(BaseModel):
    report: str
    citations: list[Citation]


# --- Request / response models ---

class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    citations: list[Citation]
    model: str
    input_tokens: int
    output_tokens: int


# --- Agent (module-level, reused across requests) ---

def _make_agent() -> Agent:
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    return Agent(
        MODEL,
        output_type=TradeAnalysis,
        system_prompt=TRADE_SYSTEM_PROMPT,
        output_retries=3,
    )


_agent: Agent | None = None


def get_agent() -> Agent:
    global _agent
    if _agent is None:
        _agent = _make_agent()
    return _agent


@router.post("/chat", description="Chat with Claude Sonnet 4.5.", tags=["Claude"])
async def chat(request: ChatRequest) -> ChatResponse:
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    logger.info(f"Claude chat request: {request.message[:80]!r}")
    try:
        agent = get_agent()
    except RuntimeError as e:
        logger.error(f"Agent init error: {e}")
        raise HTTPException(status_code=503, detail=str(e))

    try:
        result = await agent.run(f"## USER QUERY\n\n{request.message}")
        analysis: TradeAnalysis = result.output
        usage = result.usage()
        logger.info(f"Claude response ({usage.total_tokens} tokens): {analysis.report[:80]!r}")
        return ChatResponse(
            response=analysis.report,
            citations=analysis.citations,
            model=MODEL,
            input_tokens=usage.request_tokens or 0,
            output_tokens=usage.response_tokens or 0,
        )
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Claude response validation error: {e}")
        raise HTTPException(status_code=502, detail="Claude returned an unexpected response format")
    except TimeoutError:
        logger.error("Claude request timed out")
        raise HTTPException(status_code=504, detail="Claude API request timed out")
    except Exception as e:
        error_str = str(e).lower()
        if "rate limit" in error_str or "429" in error_str:
            logger.error(f"Claude rate limit hit: {e}")
            raise HTTPException(status_code=429, detail="Claude API rate limit reached — please try again shortly")
        if "authentication" in error_str or "401" in error_str or "invalid api key" in error_str:
            logger.error(f"Claude auth error: {e}")
            raise HTTPException(status_code=503, detail="Claude API authentication failed")
        if "overloaded" in error_str or "529" in error_str:
            logger.error(f"Claude overloaded: {e}")
            raise HTTPException(status_code=503, detail="Claude API is currently overloaded — please try again")
        logger.error(f"Claude chat error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while processing your request")
