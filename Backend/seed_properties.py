import os
import sys
import pandas as pd
from datetime import datetime

# Setup path so database can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import get_dataframe, save_dataframe

def seed():
    print("Seeding initial Properties and Units into Excel Database...")

    # Properties Data
    properties_data = [
        {
            "id": "PROP-001",
            "name": "Azure Heights",
            "location": "123 Downtown Ave",
            "province": "ON",
            "country": "Canada",
            "developer_legal_entity": "Azure Dev Corp",
            "developer_tax_id": "837492817 RT0001",
            "status": "Active",
            "total_units": 150,
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
        },
        {
            "id": "PROP-002",
            "name": "Maple Vista Residences",
            "location": "456 Maple St",
            "province": "ON",
            "country": "Canada",
            "developer_legal_entity": "Maple Projects Ltd",
            "developer_tax_id": "773928192 RC0002",
            "status": "Pre-Launch",
            "total_units": 200,
            "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
        }
    ]

    df_props = pd.DataFrame(properties_data)
    save_dataframe(df_props, "Property", "Properties")
    print(f"Added {len(properties_data)} properties.")

    # Units Data 
    units_data = []
    unit_counter = 1
    for prop in properties_data:
        for i in range(1, 11): # 10 mock units per property
            floor = (i // 4) + 1
            status = "Available" if i % 3 != 0 else ("Reserved" if i % 2 == 0 else "Sold")
            units_data.append({
                "id": f"UNIT-{unit_counter:04d}",
                "property_id": prop["id"],
                "unit_number": f"{chr(65 + (i%3))}-{floor * 100 + i}",
                "floor": floor,
                "area_sqft": 800.0 + (i * 50.0),
                "price": 500000.0 + (i * 25000.0),
                "status": status,
                "available_date": "2026-06-01" if status == "Available" else None,
                "bedrooms": 1 if i % 2 != 0 else 2,
                "bathrooms": 1 if i % 3 != 0 else 2,
                "image_url": "https://images.unsplash.com/photo-1502672260266-1c1e52b1-50e4?w=400&q=80" if i % 2 == 0 else "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80"
            })
            unit_counter += 1

    df_units = pd.DataFrame(units_data)
    save_dataframe(df_units, "Property", "Units")
    print(f"Added {len(units_data)} units.")

if __name__ == "__main__":
    seed()
