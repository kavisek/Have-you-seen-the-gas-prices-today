import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.db import Classification, Product
from models.schemas import ClassifyRequest, ClassifyResponse, HTSCandidateResponse
from services.classifier import ClassificationResult, classify_product
from services.hs_search import search_hs_codes
from services.savings_calculator import calculate_savings

router = APIRouter()


def _savings_classify() -> dict[str, Any]:
    raw = calculate_savings({"classify": 1}, attorney_rate=450.0, estimate="mid")
    tb = raw["task_breakdown"][0] if raw["task_breakdown"] else None
    return {
        "attorney_cost_cad": tb["attorney_cost"] if tb else 0.0,
        "tariffiq_cost": tb["tariffiq_cost"] if tb else 0.0,
    }


def _map_candidates(ai: ClassificationResult) -> list[HTSCandidateResponse]:
    out: list[HTSCandidateResponse] = []
    canadian_rows = search_hs_codes(ai.candidates[0].description[:40], 3) if ai.candidates else []
    for i, c in enumerate(ai.candidates[:3]):
        ca_row = canadian_rows[i] if i < len(canadian_rows) else {}
        mfn = str(ca_row.get("mfn", "") or "")
        ust = str(ca_row.get("ust", "") or "")
        out.append(
            HTSCandidateResponse(
                hts_code=c.hts_code,
                canadian_code=str(ca_row.get("tariff", "") or "") or None,
                description=c.description,
                mfn_rate=mfn or c.duty_rate,
                usmca_rate=ust or c.duty_rate,
                duty_delta=0.0,
                confidence=c.confidence,
                reasoning=c.reasoning,
                gri_applied=c.gri_applied,
                cbp_rulings=[],
            )
        )
    return out


@router.post("/classify")
async def post_classify(req: ClassifyRequest, db: Session = Depends(get_db)) -> ClassifyResponse:
    if not req.description.strip():
        raise HTTPException(status_code=422, detail="description is required")
    ai = await classify_product(
        req.description, material=req.material or "", use_case=req.use_case or ""
    )
    sav = _savings_classify()
    prod: Product | None = None
    if req.name.strip():
        prod = Product(name=req.name, description=req.description)
        db.add(prod)
        db.flush()
    cl_row: Classification | None = None
    first = ai.candidates[0] if ai.candidates else None
    if first:
        cl_row = Classification(
            product_id=prod.id if prod else None,
            hts_code=first.hts_code,
            description=first.description,
            mfn_rate=first.duty_rate,
            usmca_rate=first.duty_rate,
            confidence=first.confidence,
            reasoning=first.reasoning,
            gri_applied=first.gri_applied,
            ai_model="anthropic",
        )
        db.add(cl_row)
        db.flush()
    db.commit()
    return ClassifyResponse(
        id=cl_row.id if cl_row else None,
        candidates=_map_candidates(ai),
        needs_more_info=ai.needs_more_info,
        additional_info_needed=ai.additional_info_needed,
        tokens_used=None,
        savings_estimate=sav,
    )


@router.get("/classify/{classification_id}")
async def get_classify(classification_id: str, db: Session = Depends(get_db)):
    try:
        uid = uuid.UUID(classification_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")
    row = db.query(Classification).filter(Classification.id == uid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": str(row.id),
        "hts_code": row.hts_code,
        "description": row.description,
        "confidence": row.confidence,
        "reasoning": row.reasoning,
    }
