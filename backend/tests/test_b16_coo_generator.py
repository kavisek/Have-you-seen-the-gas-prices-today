from services.doc_generator import generate_coo

SAMPLE_COO_DATA = {
    "certifier_type": "Exporter",
    "certifier_name": "Acme Wood Products Ltd",
    "certifier_address": "123 Maple St, Vancouver, BC V6B 1A1",
    "certifier_phone": "604-555-0100",
    "certifier_email": "export@acmewood.ca",
    "exporter_name": "Acme Wood Products Ltd",
    "exporter_address": "123 Maple St, Vancouver, BC",
    "producer_name": "Acme Wood Products Ltd",
    "producer_address": "123 Maple St, Vancouver, BC",
    "importer_name": "Pacific Imports LLC",
    "importer_address": "456 Commerce Ave, Seattle, WA 98101",
    "goods_description": "Solid oak dining tables",
    "hts_code": "9403.30.80",
    "origin_criterion": "B",
    "country_of_origin": "Canada",
    "blanket_period_start": "2026-01-01",
    "blanket_period_end": "2026-12-31",
    "signature_name": "Jane Smith",
    "signature_date": "2026-03-22",
}


def test_generate_coo_returns_bytes():
    pdf_bytes = generate_coo(SAMPLE_COO_DATA)
    assert isinstance(pdf_bytes, bytes)


def test_generated_pdf_starts_with_pdf_header():
    pdf_bytes = generate_coo(SAMPLE_COO_DATA)
    assert pdf_bytes[:4] == b"%PDF"


def test_generated_pdf_non_empty():
    pdf_bytes = generate_coo(SAMPLE_COO_DATA)
    assert len(pdf_bytes) > 1000


def test_all_required_fields_accepted():
    pdf_bytes = generate_coo(SAMPLE_COO_DATA)
    assert pdf_bytes is not None


def test_missing_optional_blanket_period_ok():
    data = {
        k: v
        for k, v in SAMPLE_COO_DATA.items()
        if k not in ("blanket_period_start", "blanket_period_end")
    }
    pdf_bytes = generate_coo(data)
    assert pdf_bytes[:4] == b"%PDF"


def test_origin_criterion_values_accepted():
    for criterion in ["A", "B", "C", "D"]:
        data = {**SAMPLE_COO_DATA, "origin_criterion": criterion}
        pdf_bytes = generate_coo(data)
        assert pdf_bytes[:4] == b"%PDF"
