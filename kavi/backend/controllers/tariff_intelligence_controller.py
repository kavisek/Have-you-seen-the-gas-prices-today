from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from logger import logger
from services.tariff_intelligence import EngineeringOpportunity, scan_opportunities

router = APIRouter()


class ScanRequest(BaseModel):
    hts_code: str
    description: str
    annual_volume_cad: float | None = None


class ScanResponse(BaseModel):
    opportunities: list[EngineeringOpportunity]
    disclaimer: str
    estimated_annual_savings: float | None = None


@router.post("/scan", description="Scan for legitimate tariff reclassification opportunities.", tags=["Tariff Intelligence"])
async def scan(req: ScanRequest) -> ScanResponse:
    if not req.hts_code.strip():
        raise HTTPException(status_code=400, detail="hts_code is required")
    if not req.description.strip():
        raise HTTPException(status_code=400, detail="description is required")

    vol = req.annual_volume_cad or 0.0
    logger.info(f"Tariff intelligence request: hts={req.hts_code!r} vol={vol}")

    try:
        result = await scan_opportunities(req.hts_code, req.description, vol)
    except RuntimeError as e:
        logger.error(f"Tariff intelligence agent init error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Tariff intelligence scan error: {e}")
        raise HTTPException(status_code=500, detail="Failed to scan for opportunities")

    total_savings = sum(
        (o.estimated_annual_savings_cad or 0.0) for o in result.opportunities
    ) or None

    return ScanResponse(
        opportunities=result.opportunities,
        disclaimer=result.disclaimer,
        estimated_annual_savings=total_savings,
    )
