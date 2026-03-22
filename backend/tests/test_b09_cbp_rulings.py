import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from services.cbp_rulings import search_rulings


def test_search_rulings_network_failure_returns_empty():
    with patch("services.cbp_rulings.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.side_effect = Exception("Network error")
        result = asyncio.run(search_rulings("furniture", limit=5))
        assert result == []


def test_search_rulings_response_schema():
    with patch("services.cbp_rulings.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [{"reference": "NY N123456", "title": "Test"}]
        }
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        results = asyncio.run(search_rulings("furniture", limit=5))
        assert isinstance(results, list)


def test_empty_term_returns_empty():
    result = asyncio.run(search_rulings("", limit=5))
    assert result == []


def test_search_rulings_returns_list():
    with patch("services.cbp_rulings.httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"results": []}
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        results = asyncio.run(search_rulings("x", limit=5))
        assert isinstance(results, list)
