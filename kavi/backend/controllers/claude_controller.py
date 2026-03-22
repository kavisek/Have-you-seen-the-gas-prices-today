import os

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from logger import logger

router = APIRouter()

MODEL = "claude-sonnet-4-5"


class ChatRequest(BaseModel):
    message: str
    system_prompt: str = "You are a helpful assistant."


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
