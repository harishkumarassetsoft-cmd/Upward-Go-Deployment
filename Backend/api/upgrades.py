from fastapi import APIRouter, HTTPException
from models import UpgradeRequest, UpgradeResponse

router = APIRouter()

@router.post("/calculate", response_model=UpgradeResponse)
def calculate_upgrade(request: UpgradeRequest):
    """
    Calculates the 'Net Upgrade Cost' by subtracting the credit for standard materials.
    Formula: Cost_NetUpgrade = (Cost_PremiumMaterial - Credit_StandardMaterial) * (1 + Margin_Builder)
    """
    # Logic Gate
    if request.procore_milestone_status.lower() == "complete":
        return UpgradeResponse(
            component_name=request.component_name,
            net_upgrade_cost=0.0,
            status="Locked",
            message="Structural/Internal work is complete in Procore. Upgrades are locked for this unit."
        )
        
    net_cost = (request.cost_premium_material - request.credit_standard_material) * (1 + request.margin_builder_pct)
    
    # Ensure cost doesn't go negative if standard credit is incorrectly higher than premium
    if net_cost < 0:
        net_cost = 0.0
        
    return UpgradeResponse(
        component_name=request.component_name,
        net_upgrade_cost=round(net_cost, 2),
        status="Approved",
        message="100% upfront payment required to trigger Change Order Invoice."
    )
