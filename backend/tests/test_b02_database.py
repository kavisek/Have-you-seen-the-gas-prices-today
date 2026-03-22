from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker

from database import engine
from models.db import Product
from models.schemas import (
    ClassifyRequest,
    ClassifyResponse,
    SavingsRequest,
    SavingsResult,
    USMCACheckRequest,
    USMCACheckResponse,
)


def test_all_tables_created():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    for expected in [
        "products",
        "classifications",
        "bom_items",
        "usmca_determinations",
        "engineering_opportunities",
        "documents",
    ]:
        assert expected in tables


def test_products_table_columns():
    inspector = inspect(engine)
    cols = {c["name"] for c in inspector.get_columns("products")}
    assert {"id", "name", "description", "created_at"}.issubset(cols)


def test_classifications_fk_to_products():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("classifications")
    referred = {fk["referred_table"] for fk in fks}
    assert "products" in referred


def test_bom_items_fk_to_products():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("bom_items")
    referred = {fk["referred_table"] for fk in fks}
    assert "products" in referred


def test_insert_and_retrieve_product():
    Session = sessionmaker(bind=engine)
    with Session() as session:
        p = Product(name="Test Product")
        session.add(p)
        session.commit()
        row = session.query(Product).filter(Product.name == "Test Product").first()
        assert row is not None
        assert row.name == "Test Product"
        session.delete(row)
        session.commit()


def test_pydantic_schemas_import():
    assert ClassifyRequest
    assert ClassifyResponse
    assert USMCACheckRequest
    assert USMCACheckResponse
    assert SavingsRequest
    assert SavingsResult
