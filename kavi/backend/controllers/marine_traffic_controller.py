import httpx
from fastapi import APIRouter, HTTPException

from config import MARINE_TRAFFIC_API_KEY
from logger import logger

router = APIRouter()

BASE_URL = "https://services.marinetraffic.com/api"


@router.get("/vessels", description="Get vessel positions.", tags=["Marine Traffic"])
async def get_vessel_positions():
    if not MARINE_TRAFFIC_API_KEY:
        raise HTTPException(status_code=503, detail="Marine Traffic API key not configured")

    url = f"{BASE_URL}/exportvessel/v:5/{MARINE_TRAFFIC_API_KEY}/protocol:json"
    logger.info("Fetching vessel positions from Marine Traffic")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        logger.error("Marine Traffic request timed out")
        raise HTTPException(status_code=504, detail="Marine Traffic API request timed out")
    except httpx.ConnectError as e:
        logger.error(f"Marine Traffic connection error: {e}")
        raise HTTPException(status_code=503, detail="Could not connect to Marine Traffic API")
    except httpx.HTTPStatusError as e:
        logger.error(f"Marine Traffic API returned {e.response.status_code}: {e.response.text[:200]}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Marine Traffic API error: {e.response.status_code}",
        )
    except httpx.RequestError as e:
        logger.error(f"Marine Traffic request error: {e}")
        raise HTTPException(status_code=502, detail="Error communicating with Marine Traffic API")
    except Exception as e:
        logger.error(f"Unexpected error fetching vessel positions: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error fetching vessel positions")
