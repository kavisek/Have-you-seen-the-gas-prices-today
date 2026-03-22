import os

from logger import logger

ENV = os.getenv("ENV", "local")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

MARINE_TRAFFIC_API_KEY = os.getenv("MARINE_TRAFFIC_API_KEY", "")


def get_origins() -> list[str]:
    return ALLOWED_ORIGINS


def initialize_check():
    logger.info(f"Starting API in '{ENV}' environment")
    if not MARINE_TRAFFIC_API_KEY:
        logger.warning("MARINE_TRAFFIC_API_KEY is not set")
