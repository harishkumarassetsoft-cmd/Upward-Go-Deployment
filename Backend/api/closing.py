from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class ClosingStatementRequest(BaseModel):
    purchase_price_total: float
    statutory_fees: float
    prorations: float
    deposits_paid: float
    escrow_interest: float
    tarion_enrollment_fee: float = 0.0

class ClosingStatementResponse(BaseModel):
    balance_due: float
    credits: float
    debits: float

@router.post("/statement-of-adjustments", response_model=ClosingStatementResponse)
def create_statement(request: ClosingStatementRequest):
    """
    Final calculation performed on the day of possession.
    Formula: Balance_Due = (Price_Total + Fees_Statutory + Adj_Prorated + Tarion_Fee) - (Deposits_Paid + Interest_Escrow)
    """
    debits = request.purchase_price_total + request.statutory_fees + request.prorations + request.tarion_enrollment_fee
    credits = request.deposits_paid + request.escrow_interest
    
    balance_due = debits - credits
    
    return ClosingStatementResponse(
        balance_due=round(balance_due, 2),
        credits=round(credits, 2),
        debits=round(debits, 2)
    )
