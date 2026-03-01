import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000/api"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def run_tests():
    # 1. Pre-Construction Project Planning
    print_step("PART 1: Property Verification (Developer Land & Registration Params)")
    res = requests.get(f"{BASE_URL}/properties/")
    props = res.json()
    maple = next((p for p in props if p['id'] == 'PROP-002'), None)
    assert maple, "Maple Vista missing"
    print(" - Found Maple Vista")
    assert maple['developer_legal_entity'] == "Maple Projects Ltd"
    assert maple['developer_tax_id'] == "773928192 RC0002"
    assert maple['province'] == "ON"
    assert maple['status'] == "Pre-Launch"
    print(" - Developer params and Pre-Launch status verified.")

    # 2. Registration Planning (Units)
    print_step("PART 2: Unit Inventory Verification")
    res = requests.get(f"{BASE_URL}/properties/PROP-002/units")
    units = res.json()
    assert len(units) > 0, "No units found"
    available_unit = next((u for u in units if u['status'] == 'Available'), None)
    print(f" - Found Available unit: {available_unit['unit_number']}")

    # 3. Reservation & APS
    print_step("PART 3 & 4: Reservation & Agreement of Purchase and Sale")
    sale_data = {
        "PropertyID": "PROP-002",
        "UnitID": available_unit['id'],
        "BuyerName": "John Doe",
        "SalePrice": available_unit['price'],
        "Date": "2026-03-01",
        "Status": "Draft"
    }
    res = requests.post(f"{BASE_URL}/sales", json=sale_data)
    assert res.status_code == 200, res.text
    sale_id = res.json()['sale_id']
    print(f" - APS Created, Sale ID: {sale_id}")

    # 5. Buyer KYC / FINTRAC
    print_step("PART 5: FINTRAC Compliance Verification")
    res = requests.post(f"{BASE_URL}/phase6/sales/{sale_id}/confirm", json={"fintrac_verified": False, "sin_itn": ""})
    assert res.status_code == 400, "Should have blocked confirmation without FINTRAC"
    print(" - Successfully blocked sale confirmation due to missing KYC/FINTRAC.")
    
    res = requests.post(f"{BASE_URL}/phase6/sales/{sale_id}/confirm", json={"fintrac_verified": True, "sin_itn": "123-456-789"})
    assert res.status_code == 200, f"Should have allowed confirmation with FINTRAC: {res.text}"
    print(" - Successfully confirmed sale with FINTRAC verification.")

    # 6. Cooling Off
    print_step("PART 7: Cooling Off Cancellation Logic")
    res = requests.post(f"{BASE_URL}/phase6/sales/{sale_id}/cancel", json={"reason": "10 day cooloff test"})
    assert res.status_code == 200, res.text
    print(" - Cancellation trigger processed correctly.")

    sale_data["Status"] = "Confirmed"
    res = requests.post(f"{BASE_URL}/sales", json=sale_data)
    sale_id = res.json()['sale_id']

    # 9. Interim Occupancy
    print_step("PART 9: Interim Occupancy Phase Billing")
    occ_req = {
        "property_id": "PROP-002",
        "unit_id": available_unit['id'],
        "sale_id": sale_id,
        "purchase_balance": 500000.0,
        "interest_rate": 0.05,
        "estimated_property_tax_yearly": 4800.0,
        "monthly_maintenance_fee": 350.0
    }
    res = requests.post(f"{BASE_URL}/occupancy/calculate", json=occ_req)
    assert res.status_code == 200, res.text
    occ_calc = res.json()
    print(f" - Interim Occupancy monthly fee calculated: ${occ_calc['monthly_fee']}")
    res = requests.post(f"{BASE_URL}/occupancy/{sale_id}/bill?amount={occ_calc['monthly_fee']}")
    assert res.status_code == 200, res.text
    print(" - Successfully generated Occupancy Fee Billing record.")

    # 11 & 14. Closing Statement & Tarion
    print_step("PART 11 & 14: Statement of Adjustments & Tarion Warranty Registration")
    closing_req = {
        "purchase_price_total": 525000.0,
        "statutory_fees": 1500.0,
        "prorations": 500.0,
        "deposits_paid": 50000.0,
        "escrow_interest": 200.0,
        "tarion_enrollment_fee": 1250.0
    }
    res = requests.post(f"{BASE_URL}/closing/statement-of-adjustments", json=closing_req)
    assert res.status_code == 200, res.text
    stmt = res.json()
    print(f" - Final Statement of Adjustments calculated Balance Due: ${stmt['balance_due']}")
    print(f" - Total Debits including Tarion Registration: ${stmt['debits']}")

    print("\n[SUCCESS] Entire Canadian System State flow verified programmatically.")

if __name__ == "__main__":
    run_tests()
