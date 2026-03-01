from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import uuid
import pandas as pd
from api import pricing, upgrades, payments, closing, escrow, properties, phase6, interim_occupancy

app = FastAPI(title="UPWARD Unit Sales Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pricing.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(upgrades.router, prefix="/api/upgrades", tags=["Upgrades"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(escrow.router, prefix="/api/brokerage", tags=["Brokerage & Escrow"])
app.include_router(closing.router, prefix="/api/closing", tags=["Closing"])
app.include_router(properties.router, prefix="/api/properties", tags=["Properties Inventory"])
app.include_router(phase6.router, prefix="/api/phase6", tags=["Phase 6 Lifecycle"])
app.include_router(interim_occupancy.router, prefix="/api/occupancy", tags=["Interim Occupancy (Canada)"])

@app.on_event("startup")
def startup_event():
    database.init_db()

@app.get("/api/sales")
def get_sales():
    df = database.get_dataframe("Transactions", "Sales")
    df = df.fillna("")
    return df.to_dict(orient="records")

@app.post("/api/sales")
def create_sale(sale_data: dict):
    """
    Non-destructive upsert: only the single record is inserted or updated.
    No other rows in the Sales table are touched.
    """
    sale_id = sale_data.get("id") or sale_data.get("SaleID")
    if not sale_id:
        sale_id = f"SL-{str(uuid.uuid4())[:8].upper()}"
        sale_data["id"] = sale_id

    # Upsert only this one record — never touches any other row
    database.upsert_record("Transactions", "Sales", sale_data, id_field="id")
    return {"message": "Sale saved successfully", "sale_id": sale_id}

@app.post("/api/yardi/sync")
def sync_yardi():
    # Mock syncing payload
    return {
        "status": "success",
        "message": "Push to Yardi Voyager successful",
        "trace": [{"timestamp": "2026-02-28", "action": "GL Allocation", "status": "200 OK"}]
    }
