from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import uuid
import database
from datetime import datetime

router = APIRouter()

class OccupancyFeeRequest(BaseModel):
    property_id: str
    unit_id: str
    sale_id: str
    purchase_balance: float
    interest_rate: float # e.g., 0.05 for 5%
    estimated_property_tax_yearly: float
    monthly_maintenance_fee: float

@router.post("/calculate")
def calculate_occupancy_fee(request: OccupancyFeeRequest):
    """
    Calculates the monthly interim occupancy fee for Canadian condo pre-construction.
    Fee = (Purchase Balance * Interest Rate / 12) + (Est. Property Tax / 12) + Maintenance Fee
    """
    interest_portion = (request.purchase_balance * request.interest_rate) / 12
    tax_portion = request.estimated_property_tax_yearly / 12
    maintenance_portion = request.monthly_maintenance_fee
    
    total_monthly_fee = interest_portion + tax_portion + maintenance_portion
    
    return {
        "monthly_fee": round(total_monthly_fee, 2),
        "breakdown": {
            "interest_portion": round(interest_portion, 2),
            "tax_portion": round(tax_portion, 2),
            "maintenance_portion": round(maintenance_portion, 2)
        }
    }

@router.post("/{sale_id}/bill")
def bill_occupancy_fee(sale_id: str, amount: float):
    # Log the billing in our mock db
    df = database.get_dataframe("Financials", "PaymentInstallments")
    bill_data = {
        "InstallmentID": str(uuid.uuid4()),
        "SaleID": sale_id,
        "Type": "Interim Occupancy Fee",
        "Amount": amount,
        "DateBilled": datetime.now().strftime("%Y-%m-%d"),
        "Status": "Pending"
    }
    df = pd.concat([df, pd.DataFrame([bill_data])], ignore_index=True)
    database.save_dataframe(df, "Financials", "PaymentInstallments")
    return {"message": "Occupancy fee billed successfully", "bill": bill_data}
