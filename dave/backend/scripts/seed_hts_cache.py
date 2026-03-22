import json
from pathlib import Path


def main() -> None:
    backend = Path(__file__).resolve().parent.parent
    hts_dir = backend / "data" / "hts"
    hts_dir.mkdir(parents=True, exist_ok=True)
    for i in range(1, 100):
        ch = f"{i:02d}"
        path = hts_dir / f"chapter_{ch}.json"
        path.write_text(
            json.dumps(
                {
                    "HTSDataSet": [
                        {
                            "htsno": f"{ch}01.00.0000",
                            "description": f"Sample goods chapter {ch}",
                            "general": "5%",
                        },
                        {
                            "htsno": "9403.60.8081" if ch == "94" else f"{ch}02.00.0000",
                            "description": "Other wooden furniture" if ch == "94" else "Other",
                            "general": "Free",
                        },
                    ]
                },
                indent=2,
            ),
            encoding="utf-8",
        )
    annex = backend / "data" / "usmca_annex4b.json"
    rules = {
        f"{i:04d}": f"A change to heading {i:04d} or RVC (60) for chapter-related goods."
        for i in range(1, 101)
    }
    rules["9403"] = (
        "A change to subheading 9403 from any other heading; or RVC 60% transaction value method."
    )
    rules["8471"] = "RVC 50% net cost; specific processes for electronic devices."
    rules["6110"] = "Knitted apparel: yarn forward or RVC 55%."
    rules["0304"] = "Fish: wholly obtained or specific process in NA."
    rules["4407"] = "Wood sawn: TCC from heading 44."
    annex.write_text(json.dumps(rules, indent=2), encoding="utf-8")
    print(f"Wrote {len(list(hts_dir.glob('chapter_*.json')))} chapter files and {annex.name}")


if __name__ == "__main__":
    main()
