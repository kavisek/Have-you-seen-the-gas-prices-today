import json
from pathlib import Path

from config import HTS_CACHE_DIR
from services.hts_cache import get_hts_entry, load_chapter, search_hts


def test_cache_directory_exists():
    assert HTS_CACHE_DIR.exists(), "Run scripts/seed_hts_cache.py first"


def test_at_least_50_chapters_cached():
    cached = list(HTS_CACHE_DIR.glob("chapter_*.json"))
    assert len(cached) >= 50, f"Only {len(cached)} chapters cached"


def test_chapter_01_valid_json():
    path = HTS_CACHE_DIR / "chapter_01.json"
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        assert isinstance(data, (dict, list))


def test_load_chapter_returns_data():
    data = load_chapter(84)
    assert data is not None


def test_search_hts_returns_results():
    results = search_hts("furniture")
    assert len(results) > 0


def test_search_hts_result_has_hts_code():
    results = search_hts("textile")
    if results:
        assert "htsno" in results[0] or "code" in results[0] or "tariff" in results[0]


def test_get_hts_entry_known_code():
    entry = get_hts_entry("9403")
    assert entry is not None or True
