SAMPLE_COO_BODY = {
    "certifier_type": "Exporter",
    "certifier_name": "Acme Ltd",
    "certifier_address": "123 Main St",
    "certifier_phone": "604-555-0100",
    "certifier_email": "test@test.ca",
    "exporter_name": "Acme Ltd",
    "exporter_address": "123 Main St",
    "producer_name": "Acme Ltd",
    "producer_address": "123 Main St",
    "importer_name": "US Corp",
    "importer_address": "456 Commerce Ave",
    "goods_description": "Wooden tables",
    "hts_code": "9403.30.80",
    "origin_criterion": "B",
    "country_of_origin": "Canada",
    "signature_name": "Jane Smith",
    "signature_date": "2026-03-22",
}


def test_coo_endpoint_returns_200(client):
    resp = client.post("/documents/coo", json=SAMPLE_COO_BODY)
    assert resp.status_code == 200


def test_coo_endpoint_returns_pdf_content_type(client):
    resp = client.post("/documents/coo", json=SAMPLE_COO_BODY)
    assert "application/pdf" in resp.headers.get("content-type", "")


def test_coo_endpoint_pdf_bytes_valid(client):
    resp = client.post("/documents/coo", json=SAMPLE_COO_BODY)
    assert resp.content[:4] == b"%PDF"


def test_binding_ruling_returns_200(client):
    body = {
        "company_name": "Acme Ltd",
        "company_address": "123 Main St",
        "contact_name": "Jane Smith",
        "contact_email": "jane@test.ca",
        "transaction_description": "Import of wooden tables",
        "product_description": "Solid oak dining tables",
        "proposed_hts": "9403.30.8090",
        "legal_argument": "Fits Chapter 94",
        "date": "2026-03-22",
    }
    resp = client.post("/documents/binding-ruling", json=body)
    assert resp.status_code == 200


def test_binding_ruling_returns_pdf(client):
    body = {
        "company_name": "Acme",
        "company_address": "123 Main",
        "contact_name": "Jane",
        "contact_email": "j@t.ca",
        "transaction_description": "Import",
        "product_description": "Tables",
        "proposed_hts": "9403.30.8090",
        "legal_argument": "GRI 1",
        "date": "2026-03-22",
    }
    resp = client.post("/documents/binding-ruling", json=body)
    assert resp.content[:4] == b"%PDF"


def test_package_endpoint_unknown_product_404(client):
    resp = client.get("/documents/00000000-0000-0000-0000-000000000000/package")
    assert resp.status_code == 404
