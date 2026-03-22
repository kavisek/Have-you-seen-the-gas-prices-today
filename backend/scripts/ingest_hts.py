import json
import time
from pathlib import Path

import httpx

from config import HTS_CACHE_DIR, USITC_API_BASE


def fetch_chapter(client: httpx.Client, chapter: int) -> dict | None:
    ch = f"{chapter:02d}"
    urls = [
        f"{USITC_API_BASE}/details/en/{ch}",
        f"{USITC_API_BASE}/details/en/{chapter}",
    ]
    for url in urls:
        try:
            r = client.get(url, timeout=60.0)
            if r.status_code == 200:
                return r.json()
        except Exception:
            continue
    return None


def main() -> None:
    HTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with httpx.Client() as client:
        for chapter in range(1, 100):
            ch = f"{chapter:02d}"
            path = HTS_CACHE_DIR / f"chapter_{ch}.json"
            data = fetch_chapter(client, chapter)
            if data:
                path.write_text(json.dumps(data, indent=2), encoding="utf-8")
            time.sleep(0.15)
    print(f"HTS cache in {HTS_CACHE_DIR}")


if __name__ == "__main__":
    main()
