import json
import re
from pathlib import Path
from typing import Any

from config import USMCA_ANNEX_PATH

_cache: dict[str, str] | None = None


def _load() -> dict[str, str]:
    global _cache
    if _cache is not None:
        return _cache
    if not USMCA_ANNEX_PATH.exists():
        _cache = {}
        return _cache
    _cache = json.loads(USMCA_ANNEX_PATH.read_text(encoding="utf-8"))
    return _cache


def _digits_prefix(code: str) -> list[str]:
    d = re.sub(r"[^\d]", "", code)
    out = []
    for n in (4, 6, 8, 10):
        if len(d) >= n:
            out.append(d[:n])
    if len(d) >= 2:
        out.append(d[:2])
    return out


def get_rule(hts_code: str) -> str | None:
    data = _load()
    if not data:
        return None
    for prefix in _digits_prefix(hts_code):
        if prefix in data:
            return data[prefix]
        dotted = _add_dots(prefix)
        if dotted in data:
            return data[dotted]
    return None


def _add_dots(prefix: str) -> str:
    if len(prefix) <= 4:
        return prefix
    if len(prefix) <= 6:
        return f"{prefix[:4]}.{prefix[4:6]}"
    return f"{prefix[:4]}.{prefix[4:6]}.{prefix[6:]}"


def get_rule_type(hts_code: str) -> str:
    text = get_rule(hts_code) or ""
    u = text.upper()
    if "WHOLLY" in u or "WHOLLY OBTAINED" in u:
        return "wholly_obtained"
    if "RVC" in u or "REGIONAL VALUE" in u:
        return "RVC"
    if "TCC" in u or "CHANGE TO" in u:
        return "TCC"
    if "PROCESS" in u:
        return "specific_process"
    return "unknown"


def load_annex_data() -> dict[str, Any]:
    return dict(_load())
