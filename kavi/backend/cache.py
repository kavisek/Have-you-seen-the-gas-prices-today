import hashlib
import json
import os

import redis.asyncio as aioredis

from logger import logger

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
CACHE_TTL_SECONDS = 60 * 60 * 24  # 24 hours
CACHE_KEY_PREFIX = "trade_analysis:"

_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(REDIS_URL, decode_responses=True)
        logger.info(f"Redis client initialized: {REDIS_URL}")
    return _redis


def make_cache_key(query: str) -> str:
    normalized = query.strip().lower()
    digest = hashlib.sha256(normalized.encode()).hexdigest()[:16]
    return f"{CACHE_KEY_PREFIX}{digest}"


async def get_cached(query: str) -> dict | None:
    key = make_cache_key(query)
    try:
        redis = get_redis()
        value = await redis.get(key)
        if value is None:
            logger.info(f"Cache miss for query: {query[:60]!r}")
            return None
        logger.info(f"Cache hit for query: {query[:60]!r} (key={key})")
        return json.loads(value)
    except Exception as e:
        logger.error(f"Redis get error (key={key}): {e}")
        return None


async def set_cached(query: str, data: dict) -> None:
    key = make_cache_key(query)
    try:
        redis = get_redis()
        await redis.setex(key, CACHE_TTL_SECONDS, json.dumps(data))
        logger.info(f"Cached result for query: {query[:60]!r} (key={key}, ttl={CACHE_TTL_SECONDS}s)")
    except Exception as e:
        logger.error(f"Redis set error (key={key}): {e}")


async def list_keys() -> list[dict]:
    try:
        redis = get_redis()
        keys = await redis.keys(f"{CACHE_KEY_PREFIX}*")
        if not keys:
            logger.info("Cache keys requested — no keys found")
            return []
        ttls = [await redis.ttl(key) for key in keys]
        result = [{"key": key, "ttl_seconds": ttl} for key, ttl in zip(keys, ttls)]
        logger.info(f"Cache keys listed: {len(result)} key(s)")
        return result
    except Exception as e:
        logger.error(f"Redis list keys error: {e}")
        raise


async def clear_all() -> int:
    try:
        redis = get_redis()
        keys = await redis.keys(f"{CACHE_KEY_PREFIX}*")
        if not keys:
            logger.info("Cache clear requested — no keys found")
            return 0
        count = await redis.delete(*keys)
        logger.info(f"Cache cleared: {count} key(s) deleted")
        return count
    except Exception as e:
        logger.error(f"Redis clear error: {e}")
        raise
