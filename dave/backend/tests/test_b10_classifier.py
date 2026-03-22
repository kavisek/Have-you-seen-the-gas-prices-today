import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from pydantic import BaseModel, ValidationError

from services.classifier import (
    ClassificationResult,
    HTSCandidate,
    classify_product,
)


class MockHTSCandidate(BaseModel):
    hts_code: str = "9403.60.8081"
    description: str = "Other wooden furniture"
    duty_rate: str = "Free"
    confidence: float = 0.92
    reasoning: str = "Wooden desk fits Chapter 94"
    gri_applied: str = "GRI 1"
    warnings: list[str] = []


class MockClassificationResult(BaseModel):
    candidates: list[MockHTSCandidate] = [MockHTSCandidate()]
    needs_more_info: bool = False
    additional_info_needed: str | None = None


def test_classification_result_schema_valid():
    candidate = HTSCandidate(
        hts_code="9403.60.8081",
        description="Wooden furniture",
        duty_rate="Free",
        confidence=0.9,
        reasoning="Test",
        gri_applied="GRI 1",
        warnings=[],
    )
    result = ClassificationResult(
        candidates=[candidate],
        needs_more_info=False,
        additional_info_needed=None,
    )
    assert result.candidates[0].hts_code == "9403.60.8081"
    assert result.needs_more_info is False


def test_hts_code_format_validation():
    for code in ["9403.60.8081", "6110.11.1020", "0304.41.0000"]:
        c = HTSCandidate(
            hts_code=code,
            description="x",
            duty_rate="Free",
            confidence=0.9,
            reasoning="x",
            gri_applied="GRI 1",
            warnings=[],
        )
        assert c.hts_code == code


def test_classify_product_calls_hs_search():
    with patch("services.classifier.search_hs_codes") as mock_search, patch(
        "services.classifier.classifier_agent"
    ) as mock_agent, patch("services.classifier.search_rulings", new=AsyncMock(return_value=[])):
        mock_search.return_value = [
            {"tariff": "9403.60.00", "description": "Furniture", "mfn": "Free", "ust": "Free"}
        ]
        mock_result = MagicMock()
        mock_result.output = MockClassificationResult()
        mock_agent.run = AsyncMock(return_value=mock_result)

        result = asyncio.run(classify_product("wooden desk", "", ""))

        mock_search.assert_called_once()
        assert len(result.candidates) == 1


def test_classify_product_result_schema():
    with patch("services.classifier.search_hs_codes") as mock_search, patch(
        "services.classifier.classifier_agent"
    ) as mock_agent, patch("services.classifier.search_rulings", new=AsyncMock(return_value=[])):
        mock_search.return_value = []
        mock_result = MagicMock()
        mock_result.output = MockClassificationResult()
        mock_agent.run = AsyncMock(return_value=mock_result)

        result = asyncio.run(classify_product("test product", "", ""))
        assert isinstance(result, ClassificationResult)


def test_confidence_values_between_0_and_1():
    with pytest.raises(ValidationError):
        HTSCandidate(
            hts_code="9403.60.8081",
            description="x",
            duty_rate="Free",
            confidence=1.5,
            reasoning="x",
            gri_applied="GRI 1",
            warnings=[],
        )


def test_empty_description_handled():
    with patch("services.classifier.search_hs_codes") as mock_search, patch(
        "services.classifier.classifier_agent"
    ) as mock_agent, patch("services.classifier.search_rulings", new=AsyncMock(return_value=[])):
        mock_search.return_value = []
        mock_result = MagicMock()
        mock_result.output = MockClassificationResult(
            needs_more_info=True, additional_info_needed="Need description"
        )
        mock_agent.run = AsyncMock(return_value=mock_result)

        result = asyncio.run(classify_product("", "", ""))
        assert result.needs_more_info is True
