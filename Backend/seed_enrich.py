#!/usr/bin/env python3
"""
Seed script (runs INSIDE Docker at /app/Data/Property.xlsx).
- Enriches PROP-001 (Azure Heights Condominiums) and PROP-002 (Maple Vista Residences)
  with distinct, detailed data.
- Adds 2 new units to each property (idempotent – skips if already present).
"""

import pandas as pd
from pathlib import Path

EXCEL_PATH = Path("/app/Data/Property.xlsx")


def load(sheet):
    return pd.read_excel(EXCEL_PATH, sheet_name=sheet, dtype=str)


def save(sheet, df):
    xl = pd.ExcelFile(EXCEL_PATH, engine="openpyxl")
    all_sheets = {s: pd.read_excel(EXCEL_PATH, sheet_name=s, dtype=str) for s in xl.sheet_names}
    all_sheets[sheet] = df
    with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as w:
        for s, d in all_sheets.items():
            d.to_excel(w, sheet_name=s, index=False)
    print(f"  Saved '{sheet}'")


# ── 1. Enrich Properties ─────────────────────────────────────────────────────
PROP_UPDATES = {
    "PROP-001": {
        "name":                   "Azure Heights Condominiums",
        "location":               "88 Harbour Front Drive, Toronto",
        "province":               "Ontario",
        "country":                "Canada",
        "developer_legal_entity": "Azure Developments Inc.",
        "developer_tax_id":       "BN 123456789 RT0001",
        "status":                 "Active",
        "total_units":            "180",
        "image_url":              "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    },
    "PROP-002": {
        "name":                   "Maple Vista Residences",
        "location":               "225 Riverside Blvd, Vancouver",
        "province":               "British Columbia",
        "country":                "Canada",
        "developer_legal_entity": "Maple Vista Properties Ltd.",
        "developer_tax_id":       "BN 987654321 RT0001",
        "status":                 "Pre-Launch",
        "total_units":            "120",
        "image_url":              "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
    },
}

print("[1/2] Updating properties ...")
props = load("Properties")
for pid, upd in PROP_UPDATES.items():
    mask = props["id"] == pid
    if mask.any():
        for col, val in upd.items():
            if col not in props.columns:
                props[col] = ""
            props.loc[mask, col] = val
        print(f"  Updated {pid}: {upd['name']}")
    else:
        print(f"  NOT FOUND: {pid}")
save("Properties", props)


# ── 2. Add new units (idempotent) ────────────────────────────────────────────
NEW_UNITS = [
    # PROP-001 Azure Heights – luxury penthouse
    {
        "id":             "UNIT-P1-PH01",
        "property_id":    "PROP-001",
        "unit_number":    "PH-01",
        "floor":          "32",
        "area_sqft":      "2800",
        "price":          "2250000",
        "status":         "Available",
        "available_date": "2026-06-01",
        "bedrooms":       "4",
        "bathrooms":      "3",
        "image_url":      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    },
    # PROP-001 Azure Heights – accessible ground-floor studio (Reserved)
    {
        "id":             "UNIT-P1-G01",
        "property_id":    "PROP-001",
        "unit_number":    "G-01",
        "floor":          "1",
        "area_sqft":      "950",
        "price":          "540000",
        "status":         "Reserved",
        "available_date": "2026-04-15",
        "bedrooms":       "1",
        "bathrooms":      "1",
        "image_url":      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    },
    # PROP-002 Maple Vista – mid-floor 2BR (Available)
    {
        "id":             "UNIT-P2-M01",
        "property_id":    "PROP-002",
        "unit_number":    "M-601",
        "floor":          "6",
        "area_sqft":      "1150",
        "price":          "820000",
        "status":         "Available",
        "available_date": "2026-07-01",
        "bedrooms":       "2",
        "bathrooms":      "2",
        "image_url":      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    },
    # PROP-002 Maple Vista – corner suite 12th floor (Sold)
    {
        "id":             "UNIT-P2-C01",
        "property_id":    "PROP-002",
        "unit_number":    "C-1201",
        "floor":          "12",
        "area_sqft":      "1650",
        "price":          "1100000",
        "status":         "Sold",
        "available_date": "2025-12-01",
        "bedrooms":       "3",
        "bathrooms":      "2",
        "image_url":      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    },
]

print("[2/2] Adding test units ...")
units = load("Units")
for u in NEW_UNITS:
    if u["id"] in units["id"].values:
        print(f"  SKIP (exists): {u['id']}")
        continue
    for col in u:
        if col not in units.columns:
            units[col] = ""
    row = {col: u.get(col, "") for col in units.columns}
    units = pd.concat([units, pd.DataFrame([row])], ignore_index=True)
    print(f"  + {u['id']}  unit={u['unit_number']}  prop={u['property_id']}  status={u['status']}  C${int(u['price']):,}")

save("Units", units)

# ── Summary ──────────────────────────────────────────────────────────────────
units = load("Units")
print()
print("SUMMARY:")
for pid in ["PROP-001", "PROP-002"]:
    g = units[units["property_id"] == pid]
    counts = g["status"].value_counts().to_dict()
    print(f"  {pid}: {len(g)} units | {counts}")

props = load("Properties")
for pid in ["PROP-001", "PROP-002"]:
    row = props[props["id"] == pid].iloc[0]
    print(f"  {pid}: name={row['name']} | province={row['province']} | status={row['status']} | total_units={row['total_units']}")
