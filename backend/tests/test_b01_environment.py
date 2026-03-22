import pdfplumber
from reportlab.pdfgen import canvas

from config import ANTHROPIC_API_KEY, CBP_RULINGS_BASE, CLAUDE_MODEL, USITC_API_BASE


def test_pdfplumber_imports():
    assert pdfplumber.__version__


def test_reportlab_imports():
    assert canvas.Canvas


def test_chromadb_imports():
    import chromadb

    assert chromadb.__version__


def test_pydantic_ai_imports():
    from pydantic_ai import Agent

    assert Agent


def test_config_has_new_vars():
    assert CLAUDE_MODEL == "claude-sonnet-4-6"
    assert "hts.usitc.gov" in USITC_API_BASE
    assert "rulings.cbp.gov" in CBP_RULINGS_BASE
    assert ANTHROPIC_API_KEY is not None or ANTHROPIC_API_KEY == ""


def test_health_endpoint_still_works(client):
    resp = client.get("/health/")
    assert resp.status_code == 200


def test_hs_codes_endpoint_still_works(client):
    resp = client.get("/hs-codes/?q=wood&page=1&page_size=5")
    assert resp.status_code == 200
    data = resp.json()
    assert "data" in data
    assert "total" in data
