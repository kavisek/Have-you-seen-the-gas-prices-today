import json
import re
from pathlib import Path
from typing import Any

from config import HTS_CACHE_DIR


def _normalize_code(code: str) -> str:
    return re.sub(r"[^\d]", "", code)


def load_chapter(chapter: int) -> dict | list | None:
    ch = f"{chapter:02d}"
    path = HTS_CACHE_DIR / f"chapter_{ch}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _iter_hts_rows(data: dict | list) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                rows.append(item)
        return rows
    if not isinstance(data, dict):
        return rows
    if "HTSDataSet" in data and isinstance(data["HTSDataSet"], list):
        for item in data["HTSDataSet"]:
            if isinstance(item, dict):
                rows.append(item)
        return rows
    if "data" in data and isinstance(data["data"], list):
        for item in data["data"]:
            if isinstance(item, dict):
                rows.append(item)
    return rows


def search_hts(keyword: str) -> list[dict[str, Any]]:
    if not keyword.strip():
        return []
    kw = keyword.lower()
    out: list[dict[str, Any]] = []
    if not HTS_CACHE_DIR.exists():
        return out
    for path in sorted(HTS_CACHE_DIR.glob("chapter_*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        for row in _iter_hts_rows(data):
            desc = str(row.get("description", "")).lower()
            htsno = str(row.get("htsno", ""))
            if kw in desc or kw in htsno.lower():
                out.append({**row, "_source": path.name})
                if len(out) >= 200:
                    return out
    return out


def get_hts_entry(code: str) -> dict[str, Any] | None:
    if not code.strip():
        return None
    norm = _normalize_code(code)
    if not HTS_CACHE_DIR.exists():
        return None
    chapter = int(norm[:2]) if len(norm) >= 2 else None
    paths: list[Path] = []
    if chapter is not None and 1 <= chapter <= 99:
        paths.append(HTS_CACHE_DIR / f"chapter_{chapter:02d}.json")
    paths.extend(sorted(HTS_CACHE_DIR.glob("chapter_*.json")))
    seen: set[str] = set()
    for path in paths:
        if str(path) in seen:
            continue
        seen.add(str(path))
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        for row in _iter_hts_rows(data):
            htsno = str(row.get("htsno", ""))
            hnorm = _normalize_code(htsno)
            if hnorm.startswith(norm) or norm.startswith(hnorm[: min(len(hnorm), len(norm))]):
                return row
    return None
