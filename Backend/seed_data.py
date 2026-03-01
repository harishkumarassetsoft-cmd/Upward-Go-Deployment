import os
import sys
import pandas as pd
from datetime import datetime
import uuid
import json

# Setup path so database can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import get_dataframe, save_dataframe, upsert_dataframe

def seed():
    print("Seeding sample data for Analytics Dashboard and Sales/Buyers views...")

    df_sales = pd.DataFrame()
    
    schedules = [
        # Schedule 1 (Confirmed, 2 payments made)
        [
            {"milestone_name": "Booking Deposit", "percentage": 0.05, "amount_due": 33900, "estimated_date": "2026-01-15", "actual_date": "2026-01-16"},
            {"milestone_name": "30 Days", "percentage": 0.05, "amount_due": 33900, "estimated_date": "2026-02-15", "actual_date": "2026-02-14"},
            {"milestone_name": "90 Days", "percentage": 0.05, "amount_due": 33900, "estimated_date": "2026-04-15", "actual_date": ""},
            {"milestone_name": "Occupancy", "percentage": 0.05, "amount_due": 33900, "estimated_date": "2027-06-01", "actual_date": ""},
            {"milestone_name": "Closing", "percentage": 0.80, "amount_due": 542400, "estimated_date": "2027-06-15", "actual_date": ""}
        ],
        # Schedule 2 (Confirmed, no payments made)
        [
            {"milestone_name": "Reservation", "percentage": 0.10, "amount_due": 56500, "estimated_date": "2026-03-05", "actual_date": ""},
            {"milestone_name": "Foundation", "percentage": 0.15, "amount_due": 84750, "estimated_date": "2026-06-01", "actual_date": ""},
            {"milestone_name": "Closing", "percentage": 0.75, "amount_due": 423750, "estimated_date": "2027-01-01", "actual_date": ""}
        ]
    ]

    sales_data = [
        {
            "id": "SALE-1001", "property": "PROP-001", "unit": "A-101",
            "buyer": "Nupur K", "price": 600000.0, "date": "2025-11-15",
            "status": "Completed", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-001", "unitId": "A-101", "buyerId": "BYR-1001", "kycName": "Nupur K",
                "salePrice": 600000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 600000, "paymentScheduleFinalAmount": 678000,
                "paymentScheduleRegion": "Canada", "closingDate": "2026-02-28", "deedRegistered": True,
                "paymentSchedule": [
                    {"milestone_name": "Initial", "percentage": 0.20, "amount_due": 135600, "estimated_date": "2025-11-20", "actual_date": "2025-11-19"},
                    {"milestone_name": "Closing", "percentage": 0.80, "amount_due": 542400, "estimated_date": "2026-02-28", "actual_date": "2026-02-28"}
                ]
            }),
            "stage": 5
        },
        {
            "id": "SALE-1002", "property": "PROP-001", "unit": "A-205",
            "buyer": "Michael Scott", "price": 525000.0, "date": "2026-02-28",
            "status": "Confirmed", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-001", "unitId": "A-205", "buyerId": "BYR-1002", "kycName": "Michael Scott",
                "salePrice": 525000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 525000, "paymentScheduleFinalAmount": 593250,
                "paymentScheduleRegion": "Canada",
                "paymentSchedule": schedules[0]
            }),
            "stage": 3
        },
        {
            "id": "SALE-1003", "property": "PROP-002", "unit": "B-304",
            "buyer": "Dwight Schrute", "price": 420000.0, "date": "2026-03-01",
            "status": "Reservation", "fintrac_verified": 0.0,
            "data": json.dumps({
                "propertyId": "PROP-002", "unitId": "B-304", "buyerId": "BYR-1003", "kycName": "Dwight Schrute",
                "salePrice": 420000, "agreementType": "Pre-Construction", "kycVerified": False,
                "earnestMoney": "5000"
            }),
            "stage": 1
        },
        {
            "id": "SALE-1004", "property": "PROP-002", "unit": "B-404",
            "buyer": "Jim Halpert", "price": 435000.0, "date": "2026-02-12",
            "status": "Pending", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-002", "unitId": "B-404", "buyerId": "BYR-1004", "kycName": "Jim Halpert",
                "salePrice": 435000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 435000, "paymentScheduleFinalAmount": 491550,
                "paymentScheduleRegion": "Canada",
                "paymentSchedule": schedules[1]
            }),
            "stage": 3
        },
        {
            "id": "SALE-1005", "property": "PROP-003", "unit": "C-101",
            "buyer": "Pam Beesly", "price": 450000.0, "date": "2026-02-25",
            "status": "Cancelled", "fintrac_verified": 0.0,
            "data": json.dumps({
                "propertyId": "PROP-003", "unitId": "C-101", "buyerId": "BYR-1005", "kycName": "Pam Beesly",
                "salePrice": 450000, "agreementType": "Pre-Construction", "kycVerified": False,
                "cancelReason": "Buyer exercised 10-day cooling-off right.", "refundDeposit": True
            }),
            "stage": 0
        },
        {
            "id": "SALE-1006", "property": "PROP-001", "unit": "A-801",
            "buyer": "Angela Martin", "price": 750000.0, "date": "2025-08-10",
            "status": "Confirmed", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-001", "unitId": "A-801", "buyerId": "BYR-1006", "kycName": "Angela Martin",
                "salePrice": 750000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 750000, "paymentScheduleFinalAmount": 847500,
                "paymentScheduleRegion": "Canada", "walkthroughDate": "2026-03-10", "snaggingStatus": "Pending Fixes",
                "paymentSchedule": [
                    {"milestone_name": "Booking", "percentage": 0.10, "amount_due": 84750, "estimated_date": "2025-08-15", "actual_date": "2025-08-14"},
                    {"milestone_name": "Framing", "percentage": 0.15, "amount_due": 127125, "estimated_date": "2025-11-15", "actual_date": "2025-11-20"},
                    {"milestone_name": "Finishing", "percentage": 0.25, "amount_due": 211875, "estimated_date": "2026-02-15", "actual_date": "2026-02-18"},
                    {"milestone_name": "Closing", "percentage": 0.50, "amount_due": 423750, "estimated_date": "2026-04-01", "actual_date": ""}
                ]
            }),
            "stage": 4
        },
        {
            "id": "SALE-1007", "property": "PROP-002", "unit": "B-105",
            "buyer": "Stanley Hudson", "price": 380000.0, "date": "2026-02-20",
            "status": "Reservation", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-002", "unitId": "B-105", "buyerId": "BYR-1007", "kycName": "Stanley Hudson",
                "salePrice": 380000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": False
            }),
            "stage": 2
        },
        {
            "id": "SALE-1008", "property": "PROP-004", "unit": "Tower1-401",
            "buyer": "Kelly Kapoor", "price": 250000.0, "date": "2026-01-05",
            "status": "Pending", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-004", "unitId": "Tower1-401", "buyerId": "BYR-1008", "kycName": "Kelly Kapoor",
                "salePrice": 250000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 250000, "paymentScheduleFinalAmount": 262500,
                "paymentScheduleRegion": "India",
                "paymentSchedule": [
                    {"milestone_name": "Booking", "percentage": 0.099, "amount_due": 25987.5, "estimated_date": "2026-01-10", "actual_date": "2026-01-11"},
                    {"milestone_name": "Plinth", "percentage": 0.20, "amount_due": 52500, "estimated_date": "2026-04-01", "actual_date": ""},
                    {"milestone_name": "Slab 1", "percentage": 0.20, "amount_due": 52500, "estimated_date": "2026-08-01", "actual_date": ""},
                    {"milestone_name": "Finishing", "percentage": 0.30, "amount_due": 78750, "estimated_date": "2027-02-01", "actual_date": ""},
                    {"milestone_name": "Possession", "percentage": 0.201, "amount_due": 52762.5, "estimated_date": "2027-06-01", "actual_date": ""}
                ]
            }),
            "stage": 3
        },
        {
            "id": "SALE-1009", "property": "PROP-005", "unit": "Unit-99",
            "buyer": "Ryan Howard", "price": 850000.0, "date": "2026-02-01",
            "status": "Confirmed", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-005", "unitId": "Unit-99", "buyerId": "BYR-1009", "kycName": "Ryan Howard",
                "salePrice": 850000, "agreementType": "Resale", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 850000, "paymentScheduleFinalAmount": 850000,
                "paymentScheduleRegion": "USA",
                "paymentSchedule": [
                    {"milestone_name": "Earnest Money", "percentage": 0.05, "amount_due": 42500, "estimated_date": "2026-02-05", "actual_date": "2026-02-04"},
                    {"milestone_name": "Closing Proceeds", "percentage": 0.95, "amount_due": 807500, "estimated_date": "2026-03-15", "actual_date": ""}
                ]
            }),
            "stage": 3
        },
        {
            "id": "SALE-1010", "property": "PROP-001", "unit": "A-505",
            "buyer": "Phyllis Vance", "price": 615000.0, "date": "2025-06-20",
            "status": "Completed", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-001", "unitId": "A-505", "buyerId": "BYR-1010", "kycName": "Phyllis Vance",
                "salePrice": 615000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 615000, "paymentScheduleFinalAmount": 694950,
                "paymentScheduleRegion": "Canada", "closingDate": "2026-01-15", "deedRegistered": True,
                "paymentSchedule": [
                    {"milestone_name": "All Payments", "percentage": 1.0, "amount_due": 694950, "estimated_date": "2026-01-15", "actual_date": "2026-01-15"}
                ]
            }),
            "stage": 5
        },
        {
            "id": "SALE-1011", "property": "PROP-002", "unit": "B-606",
            "buyer": "Oscar Martinez", "price": 475000.0, "date": "2026-02-28",
            "status": "Pending", "fintrac_verified": 1.0,
            "data": json.dumps({
                "propertyId": "PROP-002", "unitId": "B-606", "buyerId": "BYR-1011", "kycName": "Oscar Martinez",
                "salePrice": 475000, "agreementType": "Pre-Construction", "kycVerified": True,
                "paymentScheduleConfirmed": True, "paymentSchedulePrice": 475000, "paymentScheduleFinalAmount": 536750,
                "paymentScheduleRegion": "Canada",
                "paymentSchedule": [
                    {"milestone_name": "Buyer Down Payment", "percentage": 0.15, "amount_due": 80512.5, "estimated_date": "2026-03-10", "actual_date": ""},
                    {"milestone_name": "Government Grant (Escrow)", "percentage": 0.10, "amount_due": 53675, "estimated_date": "2026-04-10", "actual_date": ""},
                    {"milestone_name": "Foundation", "percentage": 0.25, "amount_due": 134187.5, "estimated_date": "2026-08-01", "actual_date": ""},
                    {"milestone_name": "Structure", "percentage": 0.25, "amount_due": 134187.5, "estimated_date": "2026-12-01", "actual_date": ""},
                    {"milestone_name": "Closing", "percentage": 0.25, "amount_due": 134187.5, "estimated_date": "2027-04-01", "actual_date": ""}
                ]
            }),
            "stage": 3
        },
        {
            "id": "SALE-1012", "property": "PROP-001", "unit": "A-999",
            "buyer": "Kevin Malone", "price": 710000.0, "date": "2026-03-01",
            "status": "Reservation", "fintrac_verified": 0.0,
            "data": json.dumps({
                "propertyId": "PROP-001", "unitId": "A-999", "buyerId": "BYR-1012", "kycName": "Kevin Malone",
                "salePrice": 710000, "agreementType": "Pre-Construction", "kycVerified": False
            }),
            "stage": 1
        }
    ]

    df_sales = pd.DataFrame(sales_data)
    upsert_dataframe(df_sales, "Transactions", "Sales")
    print(f"Upserted Sales with {len(sales_data)} sample rows (non-destructive).")

    # ── Buyers ──────────────────────────────────────────────────
    buyers_data = [
        {"id": "BYR-1001", "name": "Nupur K",         "email": "nupur.k@email.com",          "phone": "+1-416-555-0101", "nationality": "Canadian", "id_type": "Passport",       "id_number": "AB123456", "kyc_verified": True,  "date_added": "2025-11-10"},
        {"id": "BYR-1002", "name": "Michael Scott",   "email": "michael.scott@dmifflin.com", "phone": "+1-416-555-0102", "nationality": "American", "id_type": "Driver's Lic.", "id_number": "DL-98765", "kyc_verified": True,  "date_added": "2026-02-20"},
        {"id": "BYR-1003", "name": "Dwight Schrute",  "email": "dwight@schrute.farm",        "phone": "+1-416-555-0103", "nationality": "American", "id_type": "Passport",       "id_number": "DS-44321", "kyc_verified": False, "date_added": "2026-02-28"},
        {"id": "BYR-1004", "name": "Jim Halpert",     "email": "jim.halpert@email.com",      "phone": "+1-647-555-0104", "nationality": "Canadian", "id_type": "Passport",       "id_number": "JH-77654", "kyc_verified": True,  "date_added": "2026-02-01"},
        {"id": "BYR-1005", "name": "Pam Beesly",      "email": "pam.beesly@email.com",       "phone": "+1-647-555-0105", "nationality": "Canadian", "id_type": "Driver's Lic.", "id_number": "PB-55432", "kyc_verified": False, "date_added": "2026-02-20"},
        {"id": "BYR-1006", "name": "Angela Martin",   "email": "angela.martin@email.com",    "phone": "+1-416-555-0106", "nationality": "Canadian", "id_type": "Passport",       "id_number": "AM-33210", "kyc_verified": True,  "date_added": "2025-08-01"},
        {"id": "BYR-1007", "name": "Stanley Hudson",  "email": "stanley.h@email.com",        "phone": "+1-416-555-0107", "nationality": "Canadian", "id_type": "Driver's Lic.", "id_number": "SH-12098", "kyc_verified": True,  "date_added": "2026-02-15"},
        {"id": "BYR-1008", "name": "Kelly Kapoor",    "email": "kelly.kapoor@email.com",     "phone": "+1-905-555-0108", "nationality": "Indian",   "id_type": "Passport",       "id_number": "KK-88901", "kyc_verified": True,  "date_added": "2026-01-01"},
        {"id": "BYR-1009", "name": "Ryan Howard",     "email": "ryan.howard@email.com",      "phone": "+1-416-555-0109", "nationality": "American", "id_type": "Passport",       "id_number": "RH-54321", "kyc_verified": True,  "date_added": "2026-01-25"},
        {"id": "BYR-1010", "name": "Phyllis Vance",   "email": "phyllis.v@email.com",        "phone": "+1-416-555-0110", "nationality": "Canadian", "id_type": "Driver's Lic.", "id_number": "PV-77123", "kyc_verified": True,  "date_added": "2025-06-10"},
        {"id": "BYR-1011", "name": "Oscar Martinez",  "email": "oscar.m@email.com",          "phone": "+1-647-555-0111", "nationality": "Canadian", "id_type": "Passport",       "id_number": "OM-66432", "kyc_verified": True,  "date_added": "2026-02-25"},
        {"id": "BYR-1012", "name": "Kevin Malone",    "email": "kevin.m@email.com",          "phone": "+1-905-555-0112", "nationality": "Canadian", "id_type": "Driver's Lic.", "id_number": "KM-21987", "kyc_verified": False, "date_added": "2026-03-01"},
    ]
    df_buyers = pd.DataFrame(buyers_data)
    upsert_dataframe(df_buyers, "People", "Buyers")
    print(f"Upserted Buyers with {len(buyers_data)} records (non-destructive).")

    # ── Brokers ─────────────────────────────────────────────────
    brokers_data = [
        {"id": "BRK-001", "name": "Sarah Johnson",   "agency": "RE/MAX Toronto",        "email": "sarah.j@remax.ca",       "phone": "+1-416-555-0201", "commission_rate": 2.5, "active": True,  "deals_closed": 14},
        {"id": "BRK-002", "name": "David Nguyen",    "agency": "Century 21",            "email": "d.nguyen@c21.ca",        "phone": "+1-647-555-0202", "commission_rate": 3.0, "active": True,  "deals_closed": 9},
        {"id": "BRK-003", "name": "Priya Sharma",    "agency": "Royal LePage",          "email": "priya.s@royallepage.ca", "phone": "+1-905-555-0203", "commission_rate": 2.0, "active": True,  "deals_closed": 22},
        {"id": "BRK-004", "name": "Carlos Mendez",   "agency": "Coldwell Banker",       "email": "c.mendez@cb.ca",         "phone": "+1-416-555-0204", "commission_rate": 2.5, "active": False, "deals_closed": 6},
        {"id": "BRK-005", "name": "Emma Larson",     "agency": "Keller Williams",       "email": "emma.l@kw.ca",           "phone": "+1-647-555-0205", "commission_rate": 3.0, "active": True,  "deals_closed": 17},
        {"id": "BRK-006", "name": "Raj Patel",       "agency": "Independent",           "email": "raj.patel@broker.ca",    "phone": "+1-416-555-0206", "commission_rate": 2.0, "active": True,  "deals_closed": 4},
        {"id": "BRK-007", "name": "Nicole Thompson", "agency": "Sotheby's Realty",     "email": "n.thompson@sothebys.ca", "phone": "+1-416-555-0207", "commission_rate": 3.5, "active": True,  "deals_closed": 31},
        {"id": "BRK-008", "name": "James Wu",        "agency": "Sutton Group",          "email": "james.wu@sutton.ca",     "phone": "+1-905-555-0208", "commission_rate": 2.5, "active": True,  "deals_closed": 11},
        {"id": "BRK-009", "name": "Fatima Al-Rashid","agency": "Homelife Realty",       "email": "fatima@homelife.ca",     "phone": "+1-647-555-0209", "commission_rate": 2.0, "active": True,  "deals_closed": 8},
        {"id": "BRK-010", "name": "Luke Patterson",  "agency": "Right At Home Realty",  "email": "luke.p@rightathome.ca",  "phone": "+1-416-555-0210", "commission_rate": 2.5, "active": False, "deals_closed": 19},
    ]
    df_brokers = pd.DataFrame(brokers_data)
    upsert_dataframe(df_brokers, "People", "Brokers")
    print(f"Upserted Brokers with {len(brokers_data)} records (non-destructive).")

if __name__ == "__main__":
    seed()
