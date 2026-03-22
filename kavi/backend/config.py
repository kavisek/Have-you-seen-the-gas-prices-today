import os

from logger import logger

ENV = os.getenv("ENV", "local")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

DATA_DIR = os.getenv("DATA_DIR", "../data")


def get_origins() -> list[str]:
    return ALLOWED_ORIGINS


def initialize_check():
    logger.info(f"Starting API in '{ENV}' environment")
