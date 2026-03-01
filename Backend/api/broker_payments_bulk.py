from fastapi import APIRouter
import database as db

router = APIRouter()

@router.get("/brokers/payments/all")
def get_all_broker_payments():
    """Return all broker payments for history mapping."""
    df = db.get_dataframe("Transactions", "BrokerPayments")
    if df.empty:
        return []
    df = df.where(df.notnull(), None)
    return df.to_dict(orient="records")
