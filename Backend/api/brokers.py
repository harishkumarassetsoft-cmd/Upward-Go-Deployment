from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json, re, uuid
from datetime import datetime
import database as db

router = APIRouter()

# ──────────────────────────────────────────────
# SQLite commission payment store & Brokers
# ──────────────────────────────────────────────

def _load_payments() -> list:
    """Load broker payments from SQLite Transactions__BrokerPayments"""
    df = db.get_dataframe("Transactions", "BrokerPayments")
    if df.empty:
        return []
    # Fill NaN values with None or defaults to prevent JSON serialization errors
    df = df.where(df.notnull(), None)
    return df.to_dict(orient="records")

def _save_payment(payment: dict):
    """Save a single broker payment to SQLite"""
    db.upsert_record("Transactions", "BrokerPayments", payment, id_field="id")

def _delete_payment(payment_id: str) -> bool:
    """Delete from SQLite (re-save dataframe without it)"""
    df = db.get_dataframe("Transactions", "BrokerPayments")
    if df.empty:
        return False
    # keep rows that do not match the id
    filtered_df = df[df["id"] != payment_id]
    if len(filtered_df) == len(df):
        return False
    # Save back the whole dataframe
    db.save_dataframe(filtered_df, "Transactions", "BrokerPayments")
    return True

def _save_broker_profile(broker_data: dict):
    """Upsert broker information to People__Brokers"""
    if "broker_name" not in broker_data or not broker_data["broker_name"]:
        return
    # Use broker_name as the unique identifier
    db.upsert_record("People", "Brokers", broker_data, id_field="broker_name")

def _load_broker_profiles() -> list:
    df = db.get_dataframe("People", "Brokers")
    if df.empty:
        return []
    df = df.where(df.notnull(), None)
    return df.to_dict(orient="records")


def _parse_commission_rate(raw: str) -> float:
    """Parse strings like '2.5%', '2.5', '$15,000' into a decimal rate or fixed amount.
    Returns (rate_decimal, is_fixed_amount).
    This helper returns (rate, is_percent)."""
    if not raw:
        return 0.0
    raw = str(raw).strip()
    # Percentage like "2.5%"
    pct_match = re.search(r"([\d.]+)\s*%", raw)
    if pct_match:
        return float(pct_match.group(1)) / 100.0
    # Plain decimal like "0.025"
    try:
        val = float(raw.replace(",", ""))
        if val < 1:
            return val  # already a decimal
        return val  # treat as fixed dollar amount — caller checks
    except Exception:
        return 0.0


def _compute_commission(sale_price: float, commission_raw: str) -> float:
    """Given a sale price and raw commission string, return the dollar commission."""
    raw = str(commission_raw).strip()
    # Fixed dollar like "$15,000" or "15000"
    dollar_match = re.search(r"\$\s*([\d,]+)", raw)
    if dollar_match:
        return float(dollar_match.group(1).replace(",", ""))
    rate = _parse_commission_rate(raw)
    if rate > 1:
        return rate  # it was parsed as fixed dollar
    return round(sale_price * rate, 2)


# ── Models ─────────────────────────────────────

class CommissionPayment(BaseModel):
    broker_name: str
    amount: float
    date: str          # ISO date string
    method: Optional[str] = "Bank Transfer"
    notes: Optional[str] = ""

class BrokerProfile(BaseModel):
    broker_name: str
    firm: Optional[str] = ""
    contact_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    commission_status: Optional[str] = ""


# ── Sales data helper ───────────────────────────

def _get_sales():
    """Fetch all sales from the sales API store."""
    try:
        import database as db
        rows = db.get_all("sales") if hasattr(db, 'get_all') else None
        if rows is None:
            # fallback for the newer implementation
            df = db.get_dataframe("Transactions", "Sales")
            if df.empty:
                return []
            df = df.where(df.notnull(), None)
            return df.to_dict(orient="records")
        else:
            result = []
            for r in rows:
                if isinstance(r.get("data"), str):
                    try:
                        r["data"] = json.loads(r["data"])
                    except Exception:
                        r["data"] = {}
                result.append(r)
            return result
    except Exception as e:
        print("Error fetching sales in brokers API:", e)
        return []


def _aggregate_brokers(sales, payments, profiles):
    """Group sales by broker name and compute commission totals."""
    broker_map: dict = {}
    
    # Pre-populate with known profiles even if no sales yet
    for p in profiles:
        bname = p.get("broker_name", "").strip()
        if bname:
            broker_map[bname] = {
                "broker_name": bname,
                "firm": p.get("firm", ""),
                "contact_name": p.get("contact_name", ""),
                "email": p.get("email", ""),
                "phone": p.get("phone", ""),
                "commission_status": p.get("commission_status", ""),
                "sales": [],
                "total_sale_value": 0.0,
                "total_commission_owed": 0.0,
                "total_commission_paid": 0.0,
            }

    for s in sales:
        data = s.get("data") or {}
        # if this is a parsed string it might be an empty string, fallback
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except:
                data = {}
        broker_name = data.get("brokerName", "").strip()
        if not broker_name:
            continue

        commission_raw = data.get("brokerCommissionStatus", "0")
        # Parse sale price
        price_str = str(s.get("price") or s.get("amount") or data.get("salePrice") or 0)
        price_str = re.sub(r"[^\d.]", "", price_str)
        sale_price = float(price_str) if price_str else 0.0

        commission_amt = _compute_commission(sale_price, commission_raw)

        if broker_name not in broker_map:
            broker_map[broker_name] = {
                "broker_name": broker_name,
                "firm": data.get("brokerFirm", ""),
                "sales": [],
                "total_sale_value": 0.0,
                "total_commission_owed": 0.0,
                "total_commission_paid": 0.0,
            }

        broker_map[broker_name]["sales"].append({
            "sale_id": s.get("id") or s.get("SaleID"),
            "buyer": s.get("buyer") or s.get("buyer_name") or data.get("buyerName"),
            "property": s.get("property"),
            "unit": s.get("unit"),
            "sale_price": sale_price,
            "commission_rate": commission_raw,
            "commission_amount": commission_amt,
            "sale_status": s.get("status"),
            "sale_date": data.get("finalSalesDate") or s.get("created_at", ""),
        })
        broker_map[broker_name]["total_sale_value"] += sale_price
        broker_map[broker_name]["total_commission_owed"] += commission_amt

    # Apply payments
    for p in payments:
        bname = p.get("broker_name", "").strip()
        if bname in broker_map:
            broker_map[bname]["total_commission_paid"] = round(
                broker_map[bname].get("total_commission_paid", 0.0) + p.get("amount", 0.0), 2
            )

    # Compute outstanding balance for each broker
    for b in broker_map.values():
        b["total_commission_paid"] = round(b.get("total_commission_paid", 0.0), 2)
        b["total_commission_outstanding"] = round(
            b["total_commission_owed"] - b["total_commission_paid"], 2
        )
        b["total_commission_owed"] = round(b["total_commission_owed"], 2)
        b["total_sale_value"] = round(b["total_sale_value"], 2)
        b["sales_count"] = len(b["sales"])

    # filter out brokers with no sales and no profiles (should be rare)
    return list(broker_map.values())


# ── Endpoints ───────────────────────────────────

@router.get("/brokers")
def list_brokers():
    """Return all brokers aggregated from sales data with commission totals."""
    sales = _get_sales()
    payments = _load_payments()
    profiles = _load_broker_profiles()
    brokers = _aggregate_brokers(sales, payments, profiles)
    return brokers


@router.get("/brokers/summary")
def broker_summary():
    """Return system-wide commission totals."""
    sales = _get_sales()
    payments = _load_payments()
    profiles = _load_broker_profiles()
    brokers = _aggregate_brokers(sales, payments, profiles)
    
    # filter to only brokers with sales for the summary
    active_brokers = [b for b in brokers if b["sales_count"] > 0]
    
    total_owed = sum(b["total_commission_owed"] for b in active_brokers)
    total_paid = sum(b["total_commission_paid"] for b in active_brokers)
    return {
        "total_commission_owed": round(total_owed, 2),
        "total_commission_paid": round(total_paid, 2),
        "total_commission_outstanding": round(total_owed - total_paid, 2),
        "broker_count": len(active_brokers),
    }


@router.get("/brokers/{broker_name}/payments")
def get_broker_payments(broker_name: str):
    """Return all payment records for a specific broker."""
    payments = _load_payments()
    broker_payments = [p for p in payments if p.get("broker_name", "").strip().lower() == broker_name.strip().lower()]
    return sorted(broker_payments, key=lambda p: p.get("date", ""), reverse=True)


@router.post("/brokers/payments")
def record_broker_payment(payment: CommissionPayment):
    """Record a new commission payment to a broker."""
    record = {
        "id": str(uuid.uuid4()),
        "broker_name": payment.broker_name.strip(),
        "amount": round(payment.amount, 2),
        "date": payment.date,
        "method": payment.method or "Bank Transfer",
        "notes": payment.notes or "",
        "recorded_at": datetime.utcnow().isoformat(),
    }
    _save_payment(record)
    return record


@router.delete("/brokers/payments/{payment_id}")
def delete_broker_payment(payment_id: str):
    """Delete a payment record (for corrections)."""
    success = _delete_payment(payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"message": "Payment deleted"}


@router.post("/brokers/profile")
def update_broker_profile(profile: BrokerProfile):
    """Upsert a broker profile."""
    record = {
        "broker_name": profile.broker_name.strip(),
        "firm": profile.firm or "",
        "contact_name": profile.contact_name or "",
        "email": profile.email or "",
        "phone": profile.phone or "",
        "commission_status": profile.commission_status or "",
        "updated_at": datetime.utcnow().isoformat()
    }
    _save_broker_profile(record)
    return record
