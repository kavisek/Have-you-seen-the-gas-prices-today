import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "data"))

import pytest
from fastapi.testclient import TestClient

from database import init_db
from main import app


@pytest.fixture(autouse=True)
def _reset_db():
    init_db()
    yield


@pytest.fixture
def client():
    return TestClient(app)
