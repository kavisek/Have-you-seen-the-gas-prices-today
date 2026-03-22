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
    logger.info(f"Fetching vessel positions from Marine Traffic")

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
