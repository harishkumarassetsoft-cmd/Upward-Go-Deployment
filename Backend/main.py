from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import uuid
import pandas as pd
from api import pricing, upgrades, payments, closing, escrow, properties, phase6, interim_occupancy, brokers, buyer_payments, broker_payments_bulk

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
app.include_router(brokers.router, prefix="/api", tags=["Broker Commissions"])
app.include_router(buyer_payments.router, prefix="/api", tags=["Buyer Payments"])
app.include_router(broker_payments_bulk.router, prefix="/api", tags=["Broker Payments Bulk"])

@app.on_event("startup")
def startup_event():
    database.init_db()

@app.get("/api/sales")
def get_sales():
    df = database.get_dataframe("Transactions", "Sales")
    df = df.fillna("")
    sales = df.to_dict(orient="records")

    # Enrich each sale with the resolved property name
    try:
        props_df = database.get_dataframe("Property", "Properties")
        props_df = props_df.fillna("")
        prop_map = {str(row["id"]): str(row.get("name", "")) for _, row in props_df.iterrows() if row.get("id")}
        for s in sales:
            prop_val = str(s.get("property", ""))
            s["propertyName"] = prop_map.get(prop_val, prop_val)
    except Exception:
        for s in sales:
            s["propertyName"] = s.get("property", "")

    return sales

def _resolve_unit_id(sale_data: dict, units_df) -> str:
    """
    Returns the database unit ID for this sale.
    1. Uses sale_data['unitId'] directly if non-empty.
    2. Falls back to matching by unit_number + property_id in the Units table.
    """
    unit_id = str(sale_data.get("unitId") or "").strip()
    if unit_id and not units_df.empty and unit_id in units_df["id"].values:
        return unit_id

    # Fallback: match by unit_number (sale.unit) and property_id (sale.property)
    unit_number = str(sale_data.get("unit") or "").strip()
    prop_id = str(sale_data.get("property") or "").strip()

    if units_df.empty or not unit_number:
        return ""

    mask = units_df["unit_number"].astype(str).str.strip() == unit_number
    # Narrow by property if the prop field looks like a PROP-xxx id
    if prop_id and prop_id.startswith("PROP-"):
        mask = mask & (units_df.get("property_id", units_df.get("propertyId", "")).astype(str).str.strip() == prop_id)
    elif prop_id:
        # prop field may store the property name — also try matching by name via Properties table
        try:
            props_df = database.get_dataframe("Property", "Properties")
            props_df = props_df.fillna("")
            matched = props_df[props_df["name"].astype(str).str.strip() == prop_id]
            if not matched.empty:
                found_prop_id = str(matched.iloc[0]["id"])
                col = "property_id" if "property_id" in units_df.columns else "propertyId"
                if col in units_df.columns:
                    mask = mask & (units_df[col].astype(str).str.strip() == found_prop_id)
        except Exception:
            pass

    matched_units = units_df[mask]
    if not matched_units.empty:
        return str(matched_units.iloc[0]["id"])
    return ""


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

    # Load units once for all status-update logic
    units_df = database.get_dataframe("Property", "Units")

    # Sync Unit Status to Sold if Sale is fully closed
    # Stage 6 is "Closing & Possession" completed
    if sale_data.get("stage", 0) >= 6 and sale_data.get("status") != "Cancelled":
        sale_data["status"] = "Completed"
        unit_id = _resolve_unit_id(sale_data, units_df)
        if unit_id and not units_df.empty:
            units_df.loc[units_df["id"] == unit_id, "status"] = "Sold"
            database.save_dataframe(units_df, "Property", "Units")
    elif sale_data.get("status") == "Cancelled":
        unit_id = _resolve_unit_id(sale_data, units_df)
        if unit_id and not units_df.empty:
            units_df.loc[units_df["id"] == unit_id, "status"] = "Available"
            database.save_dataframe(units_df, "Property", "Units")
    elif sale_data.get("status") not in ["Cancelled", "Completed"]:
        # Mark Sale In-Progress
        unit_id = _resolve_unit_id(sale_data, units_df)
        if unit_id and not units_df.empty and unit_id in units_df["id"].values:
            current_status = units_df.loc[units_df["id"] == unit_id, "status"].values[0]
            if current_status in ["Available", "Under Construction"]:
                units_df.loc[units_df["id"] == unit_id, "status"] = "Sale In-Progress"
                database.save_dataframe(units_df, "Property", "Units")

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
