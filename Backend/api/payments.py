from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class PaymentScheduleRequest(BaseModel):
    region: str # "India", "Canada", "USA"
    total_price: float
    floors: int = 0  # To calculate slab-wise for India
    
class PaymentMilestone(BaseModel):
    milestone_name: str
    percentage: float
    amount_due: float
    trigger_type: str # "Time", "Event"

class PaymentScheduleResponse(BaseModel):
    schedule: List[PaymentMilestone]

@router.post("/generate-schedule", response_model=PaymentScheduleResponse)
def generate_payment_schedule(request: PaymentScheduleRequest):
    """
    Generates a regional payment schedule based on market risk-profiles.
    """
    schedule = []
    
    if request.region.lower() == "india":
        # India Construction-Linked Plan
        schedule.append(PaymentMilestone(milestone_name="Booking", percentage=0.10, amount_due=request.total_price * 0.10, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="Plinth/Foundation", percentage=0.15, amount_due=request.total_price * 0.15, trigger_type="Event"))
        
        # Calculate slab-wise logic
        floor_percentage = 0.05
        for i in range(1, request.floors + 1):
            schedule.append(PaymentMilestone(milestone_name=f"On completion of Slab {i}", percentage=floor_percentage, amount_due=request.total_price * floor_percentage, trigger_type="Event"))
        
        # Calculate remaining
        total_p = 0.10 + 0.15 + (request.floors * 0.05)
        remaining = 1.0 - total_p
        
        if remaining > 0.05:
            finishing_pct = remaining - 0.05
            schedule.append(PaymentMilestone(milestone_name="Finishing (Plaster/Tiling)", percentage=finishing_pct, amount_due=request.total_price * finishing_pct, trigger_type="Event"))
            
        schedule.append(PaymentMilestone(milestone_name="Possession (Post OC)", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Event"))
        
    elif request.region.lower() == "canada":
        # Canada Deposit Structure
        schedule.append(PaymentMilestone(milestone_name="At Signing", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="30 Days", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="90 Days", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="180 Days", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="Closing", percentage=0.80, amount_due=request.total_price * 0.80, trigger_type="Event"))
        
    elif request.region.lower() == "usa":
        # USA Resale/New Build
        schedule.append(PaymentMilestone(milestone_name="Earnest Money Deposit", percentage=0.05, amount_due=request.total_price * 0.05, trigger_type="Time"))
        schedule.append(PaymentMilestone(milestone_name="Closing Day", percentage=0.95, amount_due=request.total_price * 0.95, trigger_type="Event"))

    return PaymentScheduleResponse(schedule=schedule)
