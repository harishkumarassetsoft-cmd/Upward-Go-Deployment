#!/usr/bin/env python3
"""
Adds PROP-003: Rideau Grand Tower (Ottawa, Ontario) with 10 units of varied statuses.
Safe to re-run — skips if already present.
"""
import pandas as pd
from pathlib import Path

EXCEL = Path("/app/Data/Property.xlsx")

def load(sheet):
    return pd.read_excel(EXCEL, sheet_name=sheet, dtype=str)

def save(sheet, df):
    xl = pd.ExcelFile(EXCEL, engine="openpyxl")
    sheets = {s: pd.read_excel(EXCEL, sheet_name=s, dtype=str) for s in xl.sheet_names}
    sheets[sheet] = df
    with pd.ExcelWriter(EXCEL, engine="openpyxl") as w:
        for s, d in sheets.items():
            d.to_excel(w, sheet_name=s, index=False)
    print(f"  Saved '{sheet}'")

# ── Add Property ──────────────────────────────────────────────────────────────
NEW_PROP = {
    "id":                     "PROP-003",
    "name":                   "Rideau Grand Tower",
    "location":               "150 Wellington Street, Ottawa",
    "province":               "Ontario",
    "country":                "Canada",
    "developer_legal_entity": "Rideau Capital Developments Corp.",
    "developer_tax_id":       "BN 456789123 RT0001",
    "status":                 "Active",
    "total_units":            "95",
    "image_url":              "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800",
}

props = load("Properties")
if "PROP-003" in props["id"].values:
    print("PROP-003 already exists — skipping property insert.")
else:
    for col in NEW_PROP:
        if col not in props.columns:
            props[col] = ""
    props = pd.concat([props, pd.DataFrame([{c: NEW_PROP.get(c, "") for c in props.columns}])], ignore_index=True)
    save("Properties", props)
    print("+ Added PROP-003: Rideau Grand Tower")

# ── Add Units ─────────────────────────────────────────────────────────────────
NEW_UNITS = [
    # Sold units
    {"id":"UNIT-P3-A101","property_id":"PROP-003","unit_number":"A-101","floor":"1","area_sqft":"720","price":"420000","status":"Sold","available_date":"2025-09-01","bedrooms":"1","bathrooms":"1","image_url":"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"},
    {"id":"UNIT-P3-B202","property_id":"PROP-003","unit_number":"B-202","floor":"2","area_sqft":"950","price":"565000","status":"Sold","available_date":"2025-10-15","bedrooms":"2","bathrooms":"1","image_url":"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"},
    # Reserved units
    {"id":"UNIT-P3-C305","property_id":"PROP-003","unit_number":"C-305","floor":"3","area_sqft":"1100","price":"640000","status":"Reserved","available_date":"2026-03-01","bedrooms":"2","bathrooms":"2","image_url":"https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400"},
    {"id":"UNIT-P3-D410","property_id":"PROP-003","unit_number":"D-410","floor":"4","area_sqft":"1250","price":"710000","status":"Reserved","available_date":"2026-04-01","bedrooms":"3","bathrooms":"2","image_url":"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"},
    # Available units
    {"id":"UNIT-P3-E501","property_id":"PROP-003","unit_number":"E-501","floor":"5","area_sqft":"850","price":"530000","status":"Available","available_date":"2026-05-01","bedrooms":"1","bathrooms":"1","image_url":"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400"},
    {"id":"UNIT-P3-F608","property_id":"PROP-003","unit_number":"F-608","floor":"6","area_sqft":"1300","price":"780000","status":"Available","available_date":"2026-06-01","bedrooms":"2","bathrooms":"2","image_url":"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400"},
    {"id":"UNIT-P3-G715","property_id":"PROP-003","unit_number":"G-715","floor":"7","area_sqft":"1550","price":"895000","status":"Available","available_date":"2026-07-01","bedrooms":"3","bathrooms":"2","image_url":"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400"},
    # Under Construction
    {"id":"UNIT-P3-H801","property_id":"PROP-003","unit_number":"H-801","floor":"8","area_sqft":"1800","price":"1050000","status":"Under Construction","available_date":"2027-01-01","bedrooms":"3","bathrooms":"2","image_url":"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400"},
    {"id":"UNIT-P3-I905","property_id":"PROP-003","unit_number":"I-905","floor":"9","area_sqft":"2100","price":"1280000","status":"Under Construction","available_date":"2027-03-01","bedrooms":"4","bathrooms":"3","image_url":"https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=400"},
    # Penthouse
    {"id":"UNIT-P3-PH01","property_id":"PROP-003","unit_number":"PH-01","floor":"12","area_sqft":"3200","price":"2900000","status":"Available","available_date":"2027-06-01","bedrooms":"4","bathrooms":"4","image_url":"https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400"},
]

units = load("Units")
added = 0
for u in NEW_UNITS:
    if u["id"] in units["id"].values:
        print(f"  SKIP: {u['id']}")
        continue
    for col in u:
        if col not in units.columns:
            units[col] = ""
    units = pd.concat([units, pd.DataFrame([{c: u.get(c,"") for c in units.columns}])], ignore_index=True)
    print(f"  + {u['id']}  {u['unit_number']}  {u['status']}  C${int(u['price']):,}")
    added += 1

if added:
    save("Units", units)

# Summary
units = load("Units")
g = units[units["property_id"] == "PROP-003"]
print(f"\nPROP-003 total: {len(g)} units")
print(g["status"].value_counts().to_string())
