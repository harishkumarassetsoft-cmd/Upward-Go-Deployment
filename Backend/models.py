from pydantic import BaseModel
from typing import Optional, List, Dict

class UnitPricingRequest(BaseModel):
    area_sqft: float
    rate_base: float
    plc_amount: float = 0.0
    floor_rise_amount: float = 0.0
    car_parking_amount: float = 0.0
    net_upgrades_cost: float = 0.0

class UnitPricingResponse(BaseModel):
    base_agreement_value: float
    total_price: float
    breakdown: Dict[str, float]

class UpgradeRequest(BaseModel):
    component_name: str
    cost_premium_material: float
    credit_standard_material: float
    margin_builder_pct: float = 0.0  # as a decimal, e.g., 0.20 for 20%
    procore_milestone_status: str  # "Complete" or "In Progress"

class UpgradeResponse(BaseModel):
    component_name: str
    net_upgrade_cost: float
    status: str
    message: str
