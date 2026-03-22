from services.hs_search import get_hs_code, search_hs_codes


def test_search_returns_results():
    results = search_hs_codes("wood", limit=10)
    assert len(results) > 0


def test_search_result_has_required_fields():
    results = search_hs_codes("furniture", limit=5)
    assert len(results) > 0
    row = results[0]
    assert "tariff" in row
    assert "description" in row
    assert "mfn" in row
    assert "ust" in row


def test_search_limit_respected():
    results = search_hs_codes("steel", limit=3)
    assert len(results) <= 3


def test_search_empty_query_returns_results():
    results = search_hs_codes("", limit=5)
    assert len(results) == 5


def test_search_no_match_returns_empty():
    results = search_hs_codes("xyzzy_nonexistent_product_12345", limit=10)
    assert results == []


def test_get_hs_code_exact_lookup():
    results = search_hs_codes("", limit=1)
    if results:
        tariff = results[0]["tariff"]
        row = get_hs_code(tariff)
        assert row is not None
        assert row["tariff"] == tariff


def test_get_hs_code_missing_returns_none():
    result = get_hs_code("0000.00.00")
    assert result is None


def test_ust_column_present():
    results = search_hs_codes("", limit=1)
    assert "ust" in results[0]
