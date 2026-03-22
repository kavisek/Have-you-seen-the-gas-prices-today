"""
Optional: download USTR USMCA Annex 4-B PDF and parse with pdfplumber.
If no PDF URL is configured, run scripts/seed_hts_cache.py to generate usmca_annex4b.json.
"""

from pathlib import Path


def main() -> None:
    backend = Path(__file__).resolve().parent.parent
    target = backend / "data" / "usmca_annex4b.json"
    if target.exists():
        print(f"Annex file already exists: {target}")
        return
    import subprocess
    import sys

    subprocess.check_call([sys.executable, str(backend / "scripts" / "seed_hts_cache.py")])


if __name__ == "__main__":
    main()
