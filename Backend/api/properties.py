from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import database
import uuid
import pandas as pd

router = APIRouter()

class Property(BaseModel):
    id: str
    name: str
    location: str
    province: str
    country: str
    developer_legal_entity: str
    developer_tax_id: str
    status: str
    total_units: int
    available_units: Optional[int] = 0
    image_url: str

class Unit(BaseModel):
    id: str
    property_id: str
    unit_number: str
    floor: int
    area_sqft: float
    price: float
    status: str # "Available", "Sold", "Reserved", "Under Construction"
    available_date: Optional[str] = None
    bedrooms: int
    bathrooms: int
    image_url: str

@router.get("/")
def get_properties():
    """Returns a list of all available properties/buildings."""
    df = database.get_dataframe("Property", "Properties")
    if df.empty:
        return []
    df = df.fillna("")
    # Compute available_units on the fly from Units sheet
    df_units = database.get_dataframe("Property", "Units")
    if not df_units.empty:
        avail = df_units[df_units["status"] == "Available"].groupby("property_id").size().to_dict()
        df["available_units"] = df["id"].map(avail).fillna(0).astype(int)
    else:
        df["available_units"] = 0
    return df.to_dict(orient="records")

@router.post("/")
def create_or_update_property(prop: Property):
    """Creates or updates a Property."""
    df = database.get_dataframe("Property", "Properties")
    prop_dict = prop.dict()
    
    # If ID is empty string or "new", assign a new one
    if not prop.id or prop.id == "new":
        prop_dict["id"] = f"PROP-{str(uuid.uuid4())[:8].upper()}"
        df = pd.concat([df, pd.DataFrame([prop_dict])], ignore_index=True)
    else:
        # Update existing
        if df.empty or prop_dict["id"] not in df["id"].values:
            df = pd.concat([df, pd.DataFrame([prop_dict])], ignore_index=True)
        else:
            idx = df.index[df["id"] == prop_dict["id"]].tolist()[0]
            for k, v in prop_dict.items():
                df.at[idx, k] = v
                
    database.save_dataframe(df, "Property", "Properties")
    # Simulate Yardi sync trigger
    print(f"Triggered logical Yardi Sync for Property: {prop_dict['id']}")
    return {"message": "Property saved successfully", "property_id": prop_dict["id"]}

@router.get("/{property_id}/units")
def get_property_units(property_id: str):
    """Returns the unit inventory for a specific property."""
    df = database.get_dataframe("Property", "Units")
    if df.empty:
        return []
    df = df.fillna("")
    # Filter by property_id
    units = df[df["property_id"] == property_id].to_dict(orient="records")
    return units

@router.post("/{property_id}/units")
def create_or_update_unit(property_id: str, unit: Unit):
    """Creates or updates a Unit within a Property."""
    df = database.get_dataframe("Property", "Units")
    unit_dict = unit.dict()
    unit_dict["property_id"] = property_id
    
    # If ID is empty string or "new", assign a new one
    if not unit.id or unit.id == "new":
        unit_dict["id"] = f"UNIT-{str(uuid.uuid4())[:8].upper()}"
        df = pd.concat([df, pd.DataFrame([unit_dict])], ignore_index=True)
    else:
        # Update existing
        if df.empty or unit_dict["id"] not in df["id"].values:
            df = pd.concat([df, pd.DataFrame([unit_dict])], ignore_index=True)
        else:
            idx = df.index[df["id"] == unit_dict["id"]].tolist()[0]
            for k, v in unit_dict.items():
                df.at[idx, k] = v

    database.save_dataframe(df, "Property", "Units")
    # Simulate Yardi sync trigger
    print(f"Triggered logical Yardi Sync for Unit: {unit_dict['id']}")
    return {"message": "Unit saved successfully", "unit_id": unit_dict["id"]}
