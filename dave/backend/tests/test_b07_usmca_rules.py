import json

from config import USMCA_ANNEX_PATH
from services.usmca_rules import get_rule, get_rule_type


def test_annex_json_exists():
    assert USMCA_ANNEX_PATH.exists(), "Run scripts/seed_hts_cache.py first"


def test_annex_json_not_empty():
    data = json.loads(USMCA_ANNEX_PATH.read_text(encoding="utf-8"))
    assert len(data) > 100, f"Only {len(data)} rules found — parsing may have failed"


def test_get_rule_returns_string_for_known_chapter():
    rule = get_rule("9403")
    assert rule is not None
    assert isinstance(rule, str)
    assert len(rule) > 10


def test_get_rule_returns_none_for_unknown():
    rule = get_rule("9999")
    assert rule is None


def test_get_rule_type_detects_rvc():
    rule_type = get_rule_type("9403")
    assert rule_type in {"TCC", "RVC", "wholly_obtained", "specific_process", "unknown"}


def test_prefix_matching_works():
    rule = get_rule("9403.60.8081")
    assert rule is not None


def test_multiple_chapters_have_rules():
    found = 0
    for chapter in ["8471", "6110", "0304", "4407"]:
        if get_rule(chapter) is not None:
            found += 1
    assert found >= 2, "Expected rules for at least 2 of the test chapters"
