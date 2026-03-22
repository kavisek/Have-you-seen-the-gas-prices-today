import os

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from logger import logger

router = APIRouter()

MODEL = "claude-sonnet-4-5"


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

Always ground your response in Canadian law and CBSA guidance. Be specific — give HS codes, tariff rates, agency names, and form numbers where relevant. If information is uncertain, say so and recommend the user seek a licensed customs broker or trade lawyer."""


class ChatRequest(BaseModel):
    message: str
    system_prompt: str = TRADE_SYSTEM_PROMPT


class ChatResponse(BaseModel):
    response: str
    model: str
    input_tokens: int
    output_tokens: int


def get_client() -> anthropic.Anthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not set")
    return anthropic.Anthropic(api_key=api_key)


@router.post("/chat", description="Chat with Claude Sonnet 4.5.", tags=["Claude"])
async def chat(request: ChatRequest) -> ChatResponse:
    logger.info(f"Claude chat request received: {request.message[:80]!r}")
    try:
        client = get_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=2048,
            system=request.system_prompt,
            messages=[{"role": "user", "content": request.message}],
        )
        text = next(
            (block.text for block in response.content if block.type == "text"), ""
        )
        logger.info(f"Claude response: {text[:80]!r}")
        return ChatResponse(
            response=text,
            model=MODEL,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )
    except HTTPException:
        raise
    except anthropic.AuthenticationError:
        logger.error("Anthropic authentication failed — check ANTHROPIC_API_KEY")
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key")
    except anthropic.RateLimitError:
        logger.error("Anthropic rate limit hit")
        raise HTTPException(status_code=429, detail="Anthropic rate limit exceeded")
    except Exception as e:
        logger.error(f"Claude chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
