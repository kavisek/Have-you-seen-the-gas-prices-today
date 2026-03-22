"""Fetch Japan Customs Tariff Schedule via HTML scraping."""
import csv
import time
import re
import requests
from html.parser import HTMLParser

BASE = "https://www.customs.go.jp/english/tariff/2025_04_01/data"
OUT = "/Users/kavi/workspaces/personal/vancity-hackathon/data/japan_tariff_2025.csv"

session = requests.Session()
session.headers["User-Agent"] = "ExportMinMaxer/1.0"


class TariffTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_row = False
        self.in_cell = False
        self.rows = []
        self.current_row = []
        self.current_cell = ""
        self.header_rows = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table" and attrs.get("id") == "datatable":
            self.in_table = True
        if self.in_table and tag == "tr":
            self.in_row = True
            self.current_row = []
        if self.in_row and tag in ("td", "th"):
            self.in_cell = True
            self.current_cell = ""

    def handle_endtag(self, tag):
        if tag == "table" and self.in_table:
            self.in_table = False
        if self.in_row and tag == "tr":
            self.in_row = False
            if self.current_row:
                self.rows.append(self.current_row)
        if self.in_cell and tag in ("td", "th"):
            self.in_cell = False
            self.current_row.append(self.current_cell.strip())

    def handle_data(self, data):
        if self.in_cell:
            self.current_cell += data


rows = []
CHAPTERS = [f"{i:02d}" for i in range(1, 98)]

for chap in CHAPTERS:
    url = f"{BASE}/e_{chap}.htm"
    print(f"  Chapter {chap}...", end=" ", flush=True)
    try:
        r = session.get(url, timeout=20)
        r.raise_for_status()
        content = r.content.decode("shift_jis", errors="replace")
    except Exception as e:
        print(f"SKIP ({e})")
        continue

    parser = TariffTableParser()
    parser.feed(content)

    count = 0
    for row in parser.rows:
        if len(row) < 5:
            continue
        hs_code = row[0].strip()
        if not re.match(r"^\d{2}\.\d{2}", hs_code):
            continue
        description = row[2] if len(row) > 2 else ""
        general_rate = row[3] if len(row) > 3 else ""
        temporary_rate = row[4] if len(row) > 4 else ""
        wto_rate = row[5] if len(row) > 5 else ""
        rows.append({
            "hs_code": hs_code,
            "description": description.strip(),
            "general_rate": general_rate.strip(),
            "temporary_rate": temporary_rate.strip(),
            "wto_rate": wto_rate.strip(),
        })
        count += 1
    print(f"{count} rows")
    time.sleep(0.1)

print(f"\nWriting {len(rows)} rows to {OUT}")
with open(OUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["hs_code", "description", "general_rate", "temporary_rate", "wto_rate"])
    writer.writeheader()
    writer.writerows(rows)

print("Done.")
