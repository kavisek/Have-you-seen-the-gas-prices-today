"""Fetch US HTS codes via the USITC HTS web API."""
import csv
import time
import requests

BASE = "https://hts.usitc.gov/reststop/api"
OUT = "/Users/kavi/workspaces/personal/vancity-hackathon/data/us_hts_2025.csv"

session = requests.Session()
session.headers["User-Agent"] = "ExportMinMaxer/1.0"


def get(path, retries=3):
    for i in range(retries):
        try:
            r = session.get(BASE + path, timeout=15)
            if r.status_code == 404:
                return None
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if i == retries - 1:
                return None
            time.sleep(2)


rows = []

# Try fetching the HTS details structure
# USITC API format: /details/heading/{4-digit} e.g. 0101
CHAPTERS = [f"{i:02d}" for i in range(1, 98)]
HEADINGS_PER_CHAPTER = {
    "01": range(1, 7), "02": range(1, 11), "03": range(1, 8),
    "04": range(1, 11), "05": range(1, 12), "06": range(1, 5),
    "07": range(1, 15), "08": range(1, 15), "09": range(1, 11),
    "10": range(1, 9), "11": range(1, 10), "12": range(1, 15),
    "13": range(1, 3), "14": range(1, 5), "15": range(1, 24),
    "16": range(1, 6), "17": range(1, 6), "18": range(1, 7),
    "19": range(1, 6), "20": range(1, 10), "21": range(1, 7),
    "22": range(1, 11), "23": range(1, 9), "24": range(1, 5),
    "25": range(1, 29), "26": range(1, 22), "27": range(1, 17),
    "28": range(1, 55), "29": range(1, 43), "30": range(1, 7),
    "31": range(1, 6), "32": range(1, 16), "33": range(1, 8),
    "34": range(1, 8), "35": range(1, 8), "36": range(1, 9),
    "37": range(1, 8), "38": range(1, 26), "39": range(1, 27),
    "40": range(1, 17), "41": range(1, 8), "42": range(1, 7),
    "43": range(1, 5), "44": range(1, 22), "45": range(1, 4),
    "46": range(1, 3), "47": range(1, 8), "48": range(1, 23),
    "49": range(1, 12), "50": range(1, 10), "51": range(1, 14),
    "52": range(1, 13), "53": range(1, 11), "54": range(1, 9),
    "55": range(1, 17), "56": range(1, 9), "57": range(1, 6),
    "58": range(1, 12), "59": range(1, 12), "60": range(1, 7),
    "61": range(1, 18), "62": range(1, 18), "63": range(1, 11),
    "64": range(1, 7), "65": range(1, 8), "66": range(1, 4),
    "67": range(1, 5), "68": range(1, 17), "69": range(1, 15),
    "70": range(1, 21), "71": range(1, 19), "72": range(1, 30),
    "73": range(1, 27), "74": range(1, 22), "75": range(1, 9),
    "76": range(1, 17), "78": range(1, 7), "79": range(1, 8),
    "80": range(1, 8), "81": range(1, 14), "82": range(1, 16),
    "83": range(1, 14), "84": range(1, 69), "85": range(1, 49),
    "86": range(1, 10), "87": range(1, 17), "88": range(1, 6),
    "89": range(1, 9), "90": range(1, 34), "91": range(1, 15),
    "92": range(1, 10), "93": range(1, 8), "94": range(1, 7),
    "95": range(1, 8), "96": range(1, 21), "97": range(1, 9),
}

for chap in CHAPTERS:
    heading_range = HEADINGS_PER_CHAPTER.get(chap, range(1, 20))
    print(f"  Chapter {chap}...", end=" ", flush=True)
    count = 0
    for h in heading_range:
        code = f"{chap}{h:02d}"
        data = get(f"/details/heading/{code}")
        if not data:
            continue
        if "heading" not in data:
            continue
        heading = data["heading"]
        subheadings = data.get("subheadings", [])
        for sub in subheadings:
            rows.append({
                "hts_code": sub.get("htsno", ""),
                "description": sub.get("description", "").strip(),
                "general_rate": sub.get("general", ""),
                "special_rate": sub.get("special", ""),
                "other_rate": sub.get("other", ""),
                "unit": sub.get("units", ""),
            })
            count += 1
        time.sleep(0.05)
    print(f"{count} rows")

print(f"\nWriting {len(rows)} rows to {OUT}")
with open(OUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["hts_code", "description", "general_rate", "special_rate", "other_rate", "unit"])
    writer.writeheader()
    writer.writerows(rows)

print("Done.")
