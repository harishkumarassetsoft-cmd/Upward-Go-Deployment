from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

class BrokerageRequest(BaseModel):
    region: str # "NA" or "India"
    total_price: float
    split_percentage: float = 0.0 # for NA processing

class BrokerageResponse(BaseModel):
    total_commission: float
    breakdown: Dict[str, float]

@router.post("/calculate", response_model=BrokerageResponse)
def calculate_brokerage(request: BrokerageRequest):
    """
    Brokerage is calculated as a percentage of the Base Price.
    NA: Usually 5-6% Total, split between buyer and seller agent.
    India: Standard 1% from Buyer, 1% from Seller. (or 2-4% from builder). Released 50% at Agreement, 50% at Possession.
    """
    if request.region.lower() == "na":
        # NA standard logic (assuming split_percentage is the total rate, e.g., 0.06 for 6%)
        total_comm = request.total_price * request.split_percentage
        # Typical 50/50 split between buyer/seller agents
        half_comm = total_comm / 2
        
        return BrokerageResponse(
            total_commission=total_comm,
            breakdown={
                "buyer_agent_split": half_comm,
                "seller_agent_split": half_comm
            }
        )
    else:
        # India standard logic (Assuming 2% total from builder as an example)
        # Passed via split_percentage (e.g., 0.02)
        total_comm = request.total_price * request.split_percentage
        
        return BrokerageResponse(
            total_commission=total_comm,
            breakdown={
                "stage_1_agreement_50_pct": total_comm * 0.50,
                "stage_2_possession_50_pct": total_comm * 0.50
            }
        )

class EscrowRoutingRequest(BaseModel):
    payment_received: float

class EscrowRoutingResponse(BaseModel):
    separate_account_70: float
    transaction_account_30: float

@router.post("/escrow-routing")
def process_escrow_routing(request: EscrowRoutingRequest):
    """
    India RERA Escrow Routing
    70% to Separate Account (Locked for construction)
    30% to Transaction Account (Builder profit/overheads)
    """
    sep_acct = request.payment_received * 0.70
    tran_acct = request.payment_received * 0.30
    
    return EscrowRoutingResponse(
        separate_account_70=round(sep_acct, 2),
        transaction_account_30=round(tran_acct, 2)
    )
