from fastapi import APIRouter
from models import UnitPricingRequest, UnitPricingResponse

router = APIRouter()

@router.post("/calculate", response_model=UnitPricingResponse)
def calculate_unit_price(request: UnitPricingRequest):
    """
    Calculates the 'Base Agreement Value' before taxes.
    Formula: Price_Total = (Area_SqFt * Rate_Base) + PLC + FloorRise + CarParking + Upgrades
    """
    base_calc = request.area_sqft * request.rate_base
    
    total_price = (
        base_calc +
        request.plc_amount +
        request.floor_rise_amount +
        request.car_parking_amount +
        request.net_upgrades_cost
    )
    
    breakdown = {
        "base_calculation": base_calc,
        "plc": request.plc_amount,
        "floor_rise": request.floor_rise_amount,
        "car_parking": request.car_parking_amount,
        "upgrades_total": request.net_upgrades_cost
    }
    
    return UnitPricingResponse(
        base_agreement_value=base_calc,
        total_price=total_price,
        breakdown=breakdown
    )
