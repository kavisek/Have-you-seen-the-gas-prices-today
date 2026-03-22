from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

from config import MARINE_TRAFFIC_API_KEY
from logger import logger

router = APIRouter()

BASE_URL = "https://services.marinetraffic.com/api"


def normalize_vessels(raw: Any) -> list[dict[str, Any]]:
    items: list[Any]
    if isinstance(raw, list):
        items = raw
    elif isinstance(raw, dict):
        for key in ("VESSEL", "vessels", "data", "DATA"):
            if key in raw and isinstance(raw[key], list):
                items = raw[key]
                break
        else:
            items = [raw]
    else:
        return []

    out: list[dict[str, Any]] = []
    for obj in items[:200]:
        if not isinstance(obj, dict):
            continue
        lat = obj.get("LAT") or obj.get("lat") or obj.get("latitude")
        lon = (
            obj.get("LON")
            or obj.get("lon")
            or obj.get("longitude")
            or obj.get("LNG")
            or obj.get("lng")
        )
        name = (
            obj.get("SHIPNAME")
            or obj.get("name")
            or obj.get("SHIP_NAME")
            or obj.get("MMSI")
            or "Vessel"
        )
        if lat is None or lon is None:
            continue
        try:
            out.append({"lat": float(lat), "lng": float(lon), "name": str(name)})
        except (TypeError, ValueError):
            continue
    return out


@router.get("/vessels", description="Get vessel positions.", tags=["Marine Traffic"])
async def get_vessel_positions():
    if not MARINE_TRAFFIC_API_KEY:
        raise HTTPException(status_code=503, detail="Marine Traffic API key not configured")

    url = f"{BASE_URL}/exportvessel/v:5/{MARINE_TRAFFIC_API_KEY}/protocol:json"
    logger.info("Fetching vessel positions from Marine Traffic")

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


@router.get(
    "/vessels/map",
    description="Vessel positions normalized for map clients (lat, lng, name).",
    tags=["Marine Traffic"],
)
async def get_vessel_positions_map():
    if not MARINE_TRAFFIC_API_KEY:
        raise HTTPException(status_code=503, detail="Marine Traffic API key not configured")
    url = f"{BASE_URL}/exportvessel/v:5/{MARINE_TRAFFIC_API_KEY}/protocol:json"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        raw = response.json()
    return normalize_vessels(raw)
