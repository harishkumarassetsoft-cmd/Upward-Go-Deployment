from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import json, uuid
from datetime import datetime
import database as db

router = APIRouter()

class BuyerPayment(BaseModel):
    sale_id: str
    amount: float
    milestone_name: str
    date: str
    method: Optional[str] = "Bank Transfer"
    notes: Optional[str] = ""

@router.post("/buyer/payments")
def record_buyer_payment(payment: BuyerPayment):
    """Record a buyer milestone payment to the ledger."""
    record = {
        "id": str(uuid.uuid4()),
        "sale_id": payment.sale_id,
        "amount": round(payment.amount, 2),
        "milestone_name": payment.milestone_name,
        "date": payment.date,
        "method": payment.method or "Bank Transfer",
        "notes": payment.notes or "",
        "recorded_at": datetime.utcnow().isoformat(),
    }
    db.upsert_record("Transactions", "BuyerPayments", record, id_field="id")
    return record

@router.get("/buyer/payments")
def get_buyer_payments(sale_id: Optional[str] = None):
    """Get all buyer payments, optionally filtered by sale ID."""
    df = db.get_dataframe("Transactions", "BuyerPayments")
    if df.empty:
        return []
    df = df.where(df.notnull(), None)
    records = df.to_dict(orient="records")
    if sale_id:
        records = [r for r in records if r.get("sale_id") == sale_id]
    return records
