import os
from pathlib import Path

from logger import logger

ENV = os.getenv("ENV", "local")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

MARINE_TRAFFIC_API_KEY = os.getenv("MARINE_TRAFFIC_API_KEY", "")

_repo_root = Path(__file__).resolve().parent.parent
_backend_dir = Path(__file__).resolve().parent
DATA_DIR = os.getenv("DATA_DIR", str(_repo_root / "data"))
DATA_DIR_PATH = Path(DATA_DIR)
if not DATA_DIR_PATH.is_absolute():
    DATA_DIR_PATH = (_repo_root / DATA_DIR_PATH).resolve()
HTS_CACHE_DIR = Path(os.getenv("HTS_CACHE_DIR", str(_backend_dir / "data" / "hts")))
USMCA_ANNEX_PATH = Path(
    os.getenv("USMCA_ANNEX_PATH", str(_backend_dir / "data" / "usmca_annex4b.json"))
)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
USITC_API_BASE = "https://hts.usitc.gov/reststop/api"
CBP_RULINGS_BASE = "https://rulings.cbp.gov/api"

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///:memory:")


def get_origins() -> list[str]:
    return ALLOWED_ORIGINS


def initialize_check():
    logger.info(f"Starting API in '{ENV}' environment")
    if not MARINE_TRAFFIC_API_KEY:
        logger.warning("MARINE_TRAFFIC_API_KEY is not set")
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY is not set")
