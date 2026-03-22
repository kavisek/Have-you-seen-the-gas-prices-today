"""Tests for the Redis cache module."""

import json
from unittest.mock import AsyncMock, patch

import pytest

import cache as cache_module


# --- make_cache_key ---

def test_make_cache_key_is_deterministic():
    assert cache_module.make_cache_key("softwood lumber") == cache_module.make_cache_key("softwood lumber")


def test_make_cache_key_normalizes_case_and_whitespace():
    assert cache_module.make_cache_key("  Softwood Lumber  ") == cache_module.make_cache_key("softwood lumber")


def test_make_cache_key_different_queries_produce_different_keys():
    assert cache_module.make_cache_key("softwood lumber") != cache_module.make_cache_key("maple syrup")


def test_make_cache_key_has_correct_prefix():
    key = cache_module.make_cache_key("anything")
    assert key.startswith("trade_analysis:")


# --- get_cached ---

async def test_get_cached_returns_none_on_miss():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None
    with patch.object(cache_module, "_redis", mock_redis):
        result = await cache_module.get_cached("softwood lumber")
    assert result is None


async def test_get_cached_returns_dict_on_hit():
    payload = {"response": "cached report", "citations": [], "model": "test", "input_tokens": 10, "output_tokens": 20}
    mock_redis = AsyncMock()
    mock_redis.get.return_value = json.dumps(payload)
    with patch.object(cache_module, "_redis", mock_redis):
        result = await cache_module.get_cached("softwood lumber")
    assert result == payload


async def test_get_cached_uses_correct_key():
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None
    with patch.object(cache_module, "_redis", mock_redis):
        await cache_module.get_cached("softwood lumber")
    expected_key = cache_module.make_cache_key("softwood lumber")
    mock_redis.get.assert_called_once_with(expected_key)


async def test_get_cached_returns_none_on_redis_error():
    mock_redis = AsyncMock()
    mock_redis.get.side_effect = Exception("connection refused")
    with patch.object(cache_module, "_redis", mock_redis):
        result = await cache_module.get_cached("softwood lumber")
    assert result is None


# --- set_cached ---

async def test_set_cached_stores_with_correct_key_and_ttl():
    mock_redis = AsyncMock()
    data = {"response": "report", "citations": []}
    with patch.object(cache_module, "_redis", mock_redis):
        await cache_module.set_cached("softwood lumber", data)
    mock_redis.setex.assert_called_once()
    key, ttl, value = mock_redis.setex.call_args[0]
    assert key == cache_module.make_cache_key("softwood lumber")
    assert ttl == cache_module.CACHE_TTL_SECONDS
    assert json.loads(value) == data


async def test_set_cached_does_not_raise_on_redis_error():
    mock_redis = AsyncMock()
    mock_redis.setex.side_effect = Exception("connection refused")
    with patch.object(cache_module, "_redis", mock_redis):
        await cache_module.set_cached("softwood lumber", {"response": "test"})


# --- clear_all ---

async def test_clear_all_returns_deleted_count():
    mock_redis = AsyncMock()
    mock_redis.keys.return_value = ["trade_analysis:aaa", "trade_analysis:bbb"]
    mock_redis.delete.return_value = 2
    with patch.object(cache_module, "_redis", mock_redis):
        count = await cache_module.clear_all()
    assert count == 2


async def test_clear_all_returns_zero_when_no_keys():
    mock_redis = AsyncMock()
    mock_redis.keys.return_value = []
    with patch.object(cache_module, "_redis", mock_redis):
        count = await cache_module.clear_all()
    assert count == 0
    mock_redis.delete.assert_not_called()


async def test_clear_all_scans_correct_prefix():
    mock_redis = AsyncMock()
    mock_redis.keys.return_value = []
    with patch.object(cache_module, "_redis", mock_redis):
        await cache_module.clear_all()
    mock_redis.keys.assert_called_once_with(f"{cache_module.CACHE_KEY_PREFIX}*")


async def test_clear_all_raises_on_redis_error():
    mock_redis = AsyncMock()
    mock_redis.keys.side_effect = Exception("connection refused")
    with patch.object(cache_module, "_redis", mock_redis), pytest.raises(Exception, match="connection refused"):
        await cache_module.clear_all()
