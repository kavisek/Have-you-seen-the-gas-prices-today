"""Fetch UK Trade Tariff commodity codes via the public API."""
import csv
import time
import requests

BASE = "https://www.trade-tariff.service.gov.uk/api/v2"
OUT = "/Users/kavi/workspaces/personal/vancity-hackathon/data/uk_tariff_2025.csv"

session = requests.Session()
session.headers["User-Agent"] = "ExportMinMaxer/1.0"


def get(path, retries=3):
    for i in range(retries):
        try:
            r = session.get(BASE + path, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if i == retries - 1:
                raise
            time.sleep(2)


def extract_duty(measures, measure_type_id="103"):
    """Extract third-country duty rate from measures."""
    for m in measures:
        if m.get("type") == "measure":
            rel = m.get("relationships", {})
            mt = rel.get("measure_type", {}).get("data", {})
            if mt.get("id") == measure_type_id:
                de_id = rel.get("duty_expression", {}).get("data", {}).get("id", "")
                return de_id
    return ""


rows = []

print("Fetching chapters...")
chapters_data = get("/chapters")
chapters = [c["attributes"]["goods_nomenclature_item_id"][:2] for c in chapters_data["data"]]
print(f"  {len(chapters)} chapters found")

for chap in chapters:
    print(f"  Chapter {chap}...", end=" ", flush=True)
    try:
        chap_data = get(f"/chapters/{chap}")
    except Exception as e:
        print(f"ERROR: {e}")
        continue

    heading_ids = [h["id"] for h in chap_data["data"]["relationships"]["headings"]["data"]]

    for hid in heading_ids:
        try:
            h_data = get(f"/headings/{hid[:4]}")
        except Exception as e:
            continue

        included = {i["id"]: i for i in h_data.get("included", [])}
        commodities = [i for i in h_data.get("included", []) if i["type"] == "commodity"]

        for comm in commodities:
            attrs = comm["attributes"]
            code = attrs.get("goods_nomenclature_item_id", "")
            desc = attrs.get("description_plain", "")

            duty_rate = ""
            for m_ref in comm.get("relationships", {}).get("overview_measures", {}).get("data", []):
                m = included.get(m_ref["id"])
                if not m:
                    continue
                mt_ref = m.get("relationships", {}).get("measure_type", {}).get("data", {})
                if mt_ref.get("id") == "103":  # third-country duty
                    de_ref = m.get("relationships", {}).get("duty_expression", {}).get("data", {})
                    de = included.get(de_ref.get("id", ""))
                    if de:
                        duty_rate = de["attributes"].get("base", "")

            rows.append({
                "hs_code": code,
                "description": desc,
                "third_country_duty": duty_rate,
                "declarable": attrs.get("leaf", False),
            })
        time.sleep(0.05)
    print(f"{len(heading_ids)} headings")

print(f"\nWriting {len(rows)} rows to {OUT}")
with open(OUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["hs_code", "description", "third_country_duty", "declarable"])
    writer.writeheader()
    writer.writerows(rows)

print("Done.")
