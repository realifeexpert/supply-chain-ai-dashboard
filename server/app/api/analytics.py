from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db  # <-- Yahaan badlav karein
from ..schemas import schemas
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    # This is dummy data. In a real app, you'd query the database.
    kpi_cards = [
        {"title": "Total Orders", "value": "1,250", "change": "+15%"},
        {"title": "Revenue", "value": "$85,620", "change": "+8.5%"},
        {"title": "On-Time Deliveries", "value": "98.2%", "change": "-0.5%"},
        {"title": "Pending Orders", "value": "42", "change": "+5"},
    ]
    top_selling_products = [
        {"name": "Organic Bananas", "value": 450},
        {"name": "Whole Milk", "value": 320},
        {"name": "Avocados", "value": 280},
        {"name": "Ground Coffee", "value": 150},
    ]
    delivery_status = {"on_time": 1228, "delayed": 22}
    
    return {
        "kpi_cards": kpi_cards,
        "top_selling_products": top_selling_products,
        "delivery_status": delivery_status
    }

@router.get("/forecast", response_model=schemas.DemandForecast)
def get_demand_forecast(db: Session = Depends(get_db)):
    # Mocking AI-based forecast
    forecast_data = []
    today = datetime.now()
    for i in range(30):
        date = today + timedelta(days=i)
        # Simulate a sine wave for seasonality + some noise
        value = int(100 + 20 * (1 + 0.8 * (i % 7)) + random.uniform(-10, 10))
        forecast_data.append({"date": date.strftime("%Y-%m-%d"), "value": value})
        
    return {"forecast": forecast_data}
