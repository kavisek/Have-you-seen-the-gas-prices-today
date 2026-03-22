import time
from typing import Any

import httpx

from config import CBP_RULINGS_BASE
from logger import logger

_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
_TTL_SEC = 3600


def _cache_get(key: str) -> list[dict[str, Any]] | None:
    entry = _cache.get(key)
    if not entry:
        return None
    ts, data = entry
    if time.time() - ts > _TTL_SEC:
        del _cache[key]
        return None
    return data


def _cache_set(key: str, data: list[dict[str, Any]]) -> None:
    _cache[key] = (time.time(), data)


async def search_rulings(
    term: str,
    hts: str = "",
    limit: int = 5,
) -> list[dict[str, Any]]:
    if not term.strip():
        return []
    key = f"{term}|{hts}|{limit}"
    cached = _cache_get(key)
    if cached is not None:
        return cached[:limit]
    url = f"{CBP_RULINGS_BASE}/rulings"
    params: dict[str, str] = {"term": term, "category": "classification"}
    if hts:
        params["hts"] = hts
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(url, params=params)
            if r.status_code >= 400:
                return []
            body = r.json()
    except Exception as e:
        logger.warning(f"CBP rulings request failed: {e}")
        return []
    results: list[dict[str, Any]] = []
    if isinstance(body, dict):
        raw = body.get("results") or body.get("data") or body.get("rulings") or []
        if isinstance(raw, list):
            results = raw[:limit]
    elif isinstance(body, list):
        results = body[:limit]
    _cache_set(key, results if results else [])
    return results[:limit]
