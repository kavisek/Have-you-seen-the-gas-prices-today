from fastapi import APIRouter

from logger import logger

router = APIRouter()


@router.get("/", description="Health check.", tags=["Health"])
async def health():
    logger.info("Health check.")
    return {"status": "healthy"}
