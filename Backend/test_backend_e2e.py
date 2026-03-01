import urllib.request
import urllib.error
import json
import time

API_URL = "http://localhost:8080"

def test_api(name, req):
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"PASS: {name}")
            return data
    except urllib.error.HTTPError as e:
        print(f"FAIL: {name} - HTTP {e.code} - {e.read().decode()}")
        return None
    except Exception as e:
        print(f"FAIL: {name} - {e}")
        return None

def run_tests():
    print("Waiting for server to be responsive...")
    time.sleep(2) # Give uvicorn a moment to fully start

    # 1. Test POST /api/buyer/payments
    req1 = urllib.request.Request(
        f"{API_URL}/api/buyer/payments",
        data=json.dumps({
            "sale_id": "SL-TEST-001",
            "amount": 50000.0,
            "milestone_name": "Test Deposit",
            "date": "2026-03-02",
            "notes": "E2E Backend Test"
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    test_api("Buyer Payment Persistence", req1)

    # 2. Test POST /api/brokers/profile
    req2 = urllib.request.Request(
        f"{API_URL}/api/brokers/profile",
        data=json.dumps({
            "broker_name": "Test Broker E2E",
            "firm": "E2E Realty",
            "commission_status": "2.5%"
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    test_api("Broker Profile Persistence", req2)

    # 3. Test POST /api/brokers/payments
    req3 = urllib.request.Request(
        f"{API_URL}/api/brokers/payments",
        data=json.dumps({
            "broker_name": "Test Broker E2E",
            "amount": 2500.0,
            "date": "2026-03-02",
            "method": "Wire",
            "notes": "Commission Advance"
        }).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    test_api("Broker Commission Payment Persistence", req3)

    # 4. Test GET /api/brokers/payments/all
    req4 = urllib.request.Request(f"{API_URL}/api/brokers/payments/all")
    payments_data = test_api("Fetch All Broker Payments", req4)
    if payments_data:
        found = any(p.get("broker_name") == "Test Broker E2E" and p.get("amount") == 2500.0 for p in payments_data)
        if found:
            print("PASS: Broker payment successfully found in bulk fetch!")
        else:
            print("FAIL: Broker payment NOT found in bulk fetch!")

if __name__ == "__main__":
    run_tests()
