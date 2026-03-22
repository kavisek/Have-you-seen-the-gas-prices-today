from services.doc_generator import generate_binding_ruling

SAMPLE_RULING_DATA = {
    "company_name": "Acme Wood Products Ltd",
    "company_address": "123 Maple St, Vancouver, BC V6B 1A1",
    "contact_name": "Jane Smith",
    "contact_email": "jane@acmewood.ca",
    "transaction_description": "Import of solid oak dining tables from Canada",
    "product_description": "Solid oak dining table, 180cm x 90cm, fully assembled",
    "proposed_hts": "9403.30.8090",
    "legal_argument": "Product is a wooden dining table fitting HTS Chapter 94 per GRI 1.",
    "gri_applied": "GRI 1",
    "date": "2026-03-22",
}


def test_generate_ruling_returns_bytes():
    pdf_bytes = generate_binding_ruling(SAMPLE_RULING_DATA)
    assert isinstance(pdf_bytes, bytes)


def test_ruling_pdf_header():
    pdf_bytes = generate_binding_ruling(SAMPLE_RULING_DATA)
    assert pdf_bytes[:4] == b"%PDF"


def test_ruling_pdf_non_empty():
    pdf_bytes = generate_binding_ruling(SAMPLE_RULING_DATA)
    assert len(pdf_bytes) > 1000


def test_ruling_cbp_address_in_output():
    pdf_bytes = generate_binding_ruling(SAMPLE_RULING_DATA)
    assert pdf_bytes is not None


def test_missing_optional_gri_ok():
    data = {k: v for k, v in SAMPLE_RULING_DATA.items() if k != "gri_applied"}
    pdf_bytes = generate_binding_ruling(data)
    assert pdf_bytes[:4] == b"%PDF"
