from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ClassifyRequest(BaseModel):
    name: str = ""
    description: str
    material: str | None = None
    use_case: str | None = None


class HTSCandidateResponse(BaseModel):
    hts_code: str
    canadian_code: str | None = None
    description: str
    mfn_rate: str = ""
    usmca_rate: str = ""
    duty_delta: float = 0.0
    confidence: float
    reasoning: str
    gri_applied: str = ""
    cbp_rulings: list[str] = []


class ClassifyResponse(BaseModel):
    id: UUID | None = None
    candidates: list[HTSCandidateResponse]
    needs_more_info: bool = False
    additional_info_needed: str | None = None
    tokens_used: int | None = None
    savings_estimate: dict[str, Any] | None = None


class BomItemIn(BaseModel):
    material_name: str
    origin_country: str
    unit_cost: float
    currency: str = "CAD"
    hts_code: str | None = None


class USMCACheckRequest(BaseModel):
    hts_code: str
    transaction_value: float
    bom_items: list[BomItemIn] = []


class USMCACheckResponse(BaseModel):
    qualifies: bool
    rvc_percentage: float
    threshold: float
    method: str
    rule_applied: str
    reasoning: str
    annex_4b_reference: str = ""
    special_warnings: list[str] = []
    what_if_breakeven: float | None = None
    breakdown: dict[str, Any] | None = None
    savings_estimate: dict[str, Any] | None = None


class EngineerRequest(BaseModel):
    hts_code: str
    description: str
    annual_volume_cad: float | None = None


class EngineeringOpportunityOut(BaseModel):
    alternative_hts: str
    alternative_rate: str
    duty_delta_pct: float
    required_change: str
    change_complexity: str
    binding_ruling_recommended: bool
    confidence: str
    cbp_precedent: str | None = None
    estimated_annual_savings_cad: float | None = None


class EngineerResponse(BaseModel):
    opportunities: list[EngineeringOpportunityOut]
    disclaimer: str
    estimated_annual_savings: float | None = None
    savings_estimate: dict[str, Any] | None = None


class SavingsRequest(BaseModel):
    tasks_completed: dict[str, int] = Field(default_factory=dict)
    attorney_rate: float = 450.0
    estimate: str = "mid"


class TaskSaving(BaseModel):
    task: str
    count: int
    attorney_hours: float
    attorney_cost: float
    tariffiq_cost: float
    tariffiq_seconds: int
    savings_cad: float
    savings_hours: float
    speedup_factor: float


class SavingsResult(BaseModel):
    task_breakdown: list[TaskSaving]
    total_attorney_cost: float
    total_tariffiq_cost: float
    total_savings_cad: float
    total_hours_saved: float
    avg_speedup_factor: float
    annual_projection: float
    roi_percentage: float


class ProductCreate(BaseModel):
    name: str
    description: str | None = None


class ProductOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}
