"""Tests for claude_controller endpoints and WebSocket cache behaviour."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import cache as cache_module
import controllers.claude_controller as claude_ctrl


# --- DELETE /claude/cache ---

def test_clear_cache_returns_deleted_count(client):
    with patch.object(cache_module, "_redis", AsyncMock()) as _:
        with patch("cache.clear_all", new_callable=AsyncMock, return_value=3):
            response = client.delete("/claude/cache")
    assert response.status_code == 200
    assert response.json() == {"deleted": 3}


def test_clear_cache_returns_zero_when_empty(client):
    with patch("cache.clear_all", new_callable=AsyncMock, return_value=0):
        response = client.delete("/claude/cache")
    assert response.status_code == 200
    assert response.json() == {"deleted": 0}


def test_clear_cache_returns_500_on_redis_error(client):
    with patch("cache.clear_all", new_callable=AsyncMock, side_effect=Exception("redis down")):
        response = client.delete("/claude/cache")
    assert response.status_code == 500


# --- WebSocket: cache hit ---

def test_ws_cache_hit_returns_cached_result_without_calling_agent(client):
    cached = {
        "response": "cached trade report",
        "citations": [],
        "model": "anthropic:claude-sonnet-4-5",
        "input_tokens": 100,
        "output_tokens": 200,
    }

    with patch("cache.get_cached", new_callable=AsyncMock, return_value=cached) as mock_get, \
         patch("cache.set_cached", new_callable=AsyncMock) as mock_set, \
         patch.object(claude_ctrl, "get_agent") as mock_agent:

        with client.websocket_connect("/claude/ws") as ws:
            ws.send_json({"message": "softwood lumber export query"})
            status_msg = ws.receive_json()
            result_msg = ws.receive_json()

    assert status_msg == {"type": "status", "status": "thinking"}
    assert result_msg["type"] == "result"
    assert result_msg["response"] == "cached trade report"
    assert result_msg["citations"] == []
    mock_agent.assert_not_called()
    mock_set.assert_not_called()


# --- WebSocket: cache miss ---

def _make_mock_result(report="fresh trade report", citations=None, total=500, request=300, response=200, message_count=1):
    mock_analysis = MagicMock()
    mock_analysis.report = report
    mock_analysis.citations = citations or []

    mock_usage = MagicMock()
    mock_usage.total_tokens = total
    mock_usage.request_tokens = request
    mock_usage.response_tokens = response

    mock_result = MagicMock()
    mock_result.output = mock_analysis
    mock_result.usage.return_value = mock_usage
    mock_result.all_messages.return_value = [MagicMock()] * message_count
    return mock_result


def test_ws_cache_miss_calls_agent_and_caches_result(client):
    mock_result = _make_mock_result()

    with patch("cache.get_cached", new_callable=AsyncMock, return_value=None), \
         patch("cache.set_cached", new_callable=AsyncMock) as mock_set, \
         patch.object(claude_ctrl, "_run_with_keepalive", new_callable=AsyncMock, return_value=mock_result):

        with client.websocket_connect("/claude/ws") as ws:
            ws.send_json({"message": "softwood lumber export query"})
            status_msg = ws.receive_json()
            result_msg = ws.receive_json()

    assert status_msg == {"type": "status", "status": "thinking"}
    assert result_msg["type"] == "result"
    assert result_msg["response"] == "fresh trade report"
    mock_set.assert_called_once()


def test_ws_cache_miss_result_stored_without_type_key(client):
    mock_result = _make_mock_result()

    with patch("cache.get_cached", new_callable=AsyncMock, return_value=None), \
         patch("cache.set_cached", new_callable=AsyncMock) as mock_set, \
         patch.object(claude_ctrl, "_run_with_keepalive", new_callable=AsyncMock, return_value=mock_result):

        with client.websocket_connect("/claude/ws") as ws:
            ws.send_json({"message": "softwood lumber export query"})
            ws.receive_json()
            ws.receive_json()

    _, cached_data = mock_set.call_args[0]
    assert "type" not in cached_data
    assert "response" in cached_data


# --- WebSocket: error handling ---

def test_ws_empty_message_returns_error(client):
    with client.websocket_connect("/claude/ws") as ws:
        ws.send_json({"message": "   "})
        msg = ws.receive_json()
    assert msg["type"] == "error"


def test_ws_invalid_json_returns_error(client):
    with client.websocket_connect("/claude/ws") as ws:
        ws.send_text("not json at all")
        msg = ws.receive_json()
    assert msg["type"] == "error"


def test_ws_agent_error_sends_error_message(client):
    with patch("cache.get_cached", new_callable=AsyncMock, return_value=None), \
         patch.object(claude_ctrl, "_run_with_keepalive", new_callable=AsyncMock,
                      side_effect=Exception("something went wrong")):

        with client.websocket_connect("/claude/ws") as ws:
            ws.send_json({"message": "softwood lumber export query"})
            ws.receive_json()  # status
            error_msg = ws.receive_json()

    assert error_msg["type"] == "error"
    assert "detail" in error_msg


def test_ws_rate_limit_error_returns_correct_detail(client):
    with patch("cache.get_cached", new_callable=AsyncMock, return_value=None), \
         patch.object(claude_ctrl, "_run_with_keepalive", new_callable=AsyncMock,
                      side_effect=Exception("rate limit exceeded 429")):

        with client.websocket_connect("/claude/ws") as ws:
            ws.send_json({"message": "softwood lumber export query"})
            ws.receive_json()  # status
            error_msg = ws.receive_json()

    assert error_msg["type"] == "error"
    assert "rate limit" in error_msg["detail"].lower()
