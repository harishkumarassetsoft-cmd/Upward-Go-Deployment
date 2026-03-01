import os
import sys
import pandas as pd
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import get_dataframe, save_dataframe

def seed_extra():
    print("Finalizing all system data and injecting extensive test cases...")

    # 1. Properties
    df_props = get_dataframe("Property", "Properties")
    new_props = [
        {"id": "PROP-A1", "name": "Azure Heights", "location": "Miami, FL", "province": "Florida", "country": "USA", "developer_legal_entity": "Azure Dev LLC", "developer_tax_id": "TAX-123", "status": "Active", "total_units": 150, "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"},
        {"id": "PROP-M2", "name": "Maple Vista", "location": "Toronto, ON", "province": "Ontario", "country": "Canada", "developer_legal_entity": "Maple Dev Inc", "developer_tax_id": "TAX-456", "status": "Pre-Launch", "total_units": 200, "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"},
        {"id": "PROP-O3", "name": "Oasis Gardens", "location": "Mumbai, MH", "province": "Maharashtra", "country": "India", "developer_legal_entity": "Oasis Builders PVT LTD", "developer_tax_id": "TAX-789", "status": "Active", "total_units": 300, "image_url": "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=80"},
        {"id": "PROP-B4", "name": "Brooklyn Lofts", "location": "Brooklyn, NY", "province": "New York", "country": "USA", "developer_legal_entity": "BK Lofts LLC", "developer_tax_id": "TAX-101", "status": "Under Construction", "total_units": 85, "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"},
    ]
    
    existing_prop_ids = set() if df_props.empty else set(df_props["id"].values)
    props_to_add = [p for p in new_props if p["id"] not in existing_prop_ids]
    if props_to_add:
        df_props = pd.concat([df_props, pd.DataFrame(props_to_add)], ignore_index=True)
        save_dataframe(df_props, "Property", "Properties")
        print(f"Added {len(props_to_add)} properties.")

    # 2. Units
    df_units = get_dataframe("Property", "Units")
    new_units = [
        {"id": "UNIT-AZ-1402", "property_id": "PROP-A1", "unit_number": "B-1402", "floor": 14, "area_sqft": 1200, "price": 850000, "status": "Sold", "bedrooms": 2, "bathrooms": 2, "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"},
        {"id": "UNIT-AZ-905", "property_id": "PROP-A1", "unit_number": "A-905", "floor": 9, "area_sqft": 950, "price": 720000, "status": "Available", "bedrooms": 1, "bathrooms": 1, "image_url": "https://images.unsplash.com/photo-1502672260266-1c1e52ab0645?w=400&q=80"},
        {"id": "UNIT-MV-105", "property_id": "PROP-M2", "unit_number": "A-105", "floor": 1, "area_sqft": 800, "price": 620000, "status": "Reserved", "bedrooms": 1, "bathrooms": 1, "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"},
        {"id": "UNIT-MV-202", "property_id": "PROP-M2", "unit_number": "A-202", "floor": 2, "area_sqft": 850, "price": 635000, "status": "Under Construction", "bedrooms": 1, "bathrooms": 1, "image_url": "https://images.unsplash.com/photo-1502672260266-1c1e52ab0645?w=400&q=80"},
        {"id": "UNIT-OG-04", "property_id": "PROP-O3", "unit_number": "V-04", "floor": 1, "area_sqft": 2400, "price": 24000000, "status": "Available", "bedrooms": 4, "bathrooms": 3, "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"},
        {"id": "UNIT-BL-4A", "property_id": "PROP-B4", "unit_number": "4A", "floor": 4, "area_sqft": 1050, "price": 950000, "status": "Available", "bedrooms": 2, "bathrooms": 1, "image_url": "https://images.unsplash.com/photo-1502672260266-1c1e52ab0645?w=400&q=80"},
        {"id": "UNIT-BL-5B", "property_id": "PROP-B4", "unit_number": "5B", "floor": 5, "area_sqft": 1100, "price": 980000, "status": "Under Construction", "bedrooms": 2, "bathrooms": 2, "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80"}
    ]
    
    existing_unit_ids = set() if df_units.empty else set(df_units["id"].values)
    units_to_add = [u for u in new_units if u["id"] not in existing_unit_ids]
    if units_to_add:
        df_units = pd.concat([df_units, pd.DataFrame(units_to_add)], ignore_index=True)
        save_dataframe(df_units, "Property", "Units")
        print(f"Added {len(units_to_add)} units.")

    # 3. Sales
    df_sales = get_dataframe("Transactions", "Sales")
    # Mapping to SalesList.tsx format:
    # id, property, unit, buyer, price, status, country, stage
    new_sales = [
        {
            "id": "SL-2026-001", "property": "Azure Heights", "unit": "B-1402",
            "buyer": "M. Peterson", "price": "C$850,000", "status": "Confirmed",
            "country": "US", "stage": 2, "unitStatus": "Sold", "data": "{}"
        },
        {
            "id": "SL-2026-002", "property": "Maple Vista", "unit": "A-105",
            "buyer": "S. Patel", "price": "C$620,000", "status": "Pending",
            "country": "CA", "stage": 1, "unitStatus": "Reserved", "data": "{}"
        },
        {
            "id": "SL-2026-003", "property": "Oasis Gardens", "unit": "V-04",
            "buyer": "R. Sharma", "price": "₹2.4 Cr", "status": "Draft",
            "country": "IN", "stage": 0, "unitStatus": "Available", "data": "{}"
        },
        {
            "id": "SL-2026-004", "property": "Brooklyn Lofts", "unit": "4A",
            "buyer": "J. Doe", "price": "$950,000", "status": "Reservation",
            "country": "US", "stage": 0, "unitStatus": "Available", "data": "{}"
        },
        {
            "id": "SL-2026-005", "property": "Maple Vista", "unit": "A-202",
            "buyer": "T. Cruise", "price": "C$635,000", "status": "Completed",
            "country": "CA", "stage": 5, "unitStatus": "Under Construction", "data": '{"paymentScheduleConfirmed": true, "kycVerified": true}'
        }
    ]
    
    existing_sales_ids = set() if df_sales.empty else set(df_sales["id"].values if "id" in df_sales.columns else [])
    sales_to_add = [s for s in new_sales if s["id"] not in existing_sales_ids]
    if sales_to_add:
        # If df_sales is empty, ensure the columns exist
        df_sales = pd.concat([df_sales, pd.DataFrame(sales_to_add)], ignore_index=True)
        save_dataframe(df_sales, "Transactions", "Sales")
        print(f"Added {len(sales_to_add)} sales.")

if __name__ == "__main__":
    seed_extra()
