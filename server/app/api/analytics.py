from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
# --- CHANGE 1: Import extract ---
from sqlalchemy import func, case, Date, cast, extract
from pydantic import BaseModel
from typing import List, Dict
from ..database import get_db
from ..schemas import schemas
from ..models import models
import random
from datetime import datetime, timedelta, date
from calendar import month_abbr # --- CHANGE 2: Import month_abbr ---

router = APIRouter()

# --- RevenueOverTime Schemas (Keep as is) ---
class RevenueDataPoint(BaseModel):
    date: date # Use date type for just the date part
    revenue: float

class RevenueOverTimeResponse(BaseModel):
    data: List[RevenueDataPoint]

# --- CHANGE 3: Define Pydantic Schemas for Monthly Revenue ---
class MonthlyRevenueDataPoint(BaseModel):
    month: str # e.g., "Jan", "Feb"
    revenue: float

class MonthlyRevenueResponse(BaseModel):
    data: List[MonthlyRevenueDataPoint]


# --- /summary endpoint (Unchanged) ---
@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Calculates and returns key analytics summary data from the database.
    """

    # 1. KPI Cards Data
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(models.Order.total_amount)).scalar() or 0.0
    pending_orders = db.query(func.count(models.Order.id)).filter(models.Order.status == schemas.OrderStatus.Pending).scalar() or 0
    delivered_orders = db.query(func.count(models.Order.id)).filter(models.Order.status == schemas.OrderStatus.Delivered).scalar() or 0
    on_time_deliveries_percentage = 99.9 if delivered_orders > 0 else 0.0 # Placeholder
    low_stock_items_count = db.query(func.count(models.Product.id)).filter(
        models.Product.stock_quantity <= models.Product.reorder_level,
        models.Product.stock_quantity > 0
    ).scalar() or 0

    # Calculate Total Inventory Value
    total_inventory_value = db.query(
        func.sum(models.Product.stock_quantity * func.coalesce(models.Product.cost_price, 0.0))
    ).filter(
        models.Product.stock_quantity > 0 # Only include items in stock
    ).scalar() or 0.0

    kpi_cards = [
        {"title": "Total Orders", "value": f"{total_orders:,}", "change": ""},
        {"title": "Revenue", "value": f"₹{total_revenue:,.2f}", "change": ""},
        {"title": "Inventory Value", "value": f"₹{total_inventory_value:,.2f}", "change": ""},
        {"title": "Pending Orders", "value": str(pending_orders), "change": ""},
        {"title": "Low Stock Items", "value": str(low_stock_items_count), "change": ""},
    ]

    # 2. Top Selling Products
    top_products_query = db.query(
            models.Product.name,
            func.sum(models.OrderItem.quantity).label("total_quantity")
        ).join(models.OrderItem, models.OrderItem.product_id == models.Product.id)\
         .group_by(models.Product.name)\
         .order_by(func.sum(models.OrderItem.quantity).desc())\
         .limit(5)\
         .all()
    top_selling_products = [{"name": name, "value": qty} for name, qty in top_products_query]

    # 3. Delivery Status (Placeholder)
    delayed_statuses = [ # Renamed for clarity
        schemas.OrderStatus.Pending, schemas.OrderStatus.Processing,
        schemas.OrderStatus.Shipped, schemas.OrderStatus.In_Transit,
    ]
    delayed_count = db.query(func.count(models.Order.id)).filter(
        models.Order.status.in_(delayed_statuses)
        ).scalar() or 0
    delivery_status = {"on_time": delivered_orders, "delayed": delayed_count}

    # 4. Order Status Breakdown
    status_counts_query = db.query(
            models.Order.status,
            func.count(models.Order.id).label("status_count")
        ).group_by(models.Order.status)\
         .order_by(models.Order.status)\
         .all()
    order_status_breakdown = [{"status": status.value, "value": count} for status, count in status_counts_query]

    return {
        "kpi_cards": kpi_cards,
        "top_selling_products": top_selling_products,
        "delivery_status": delivery_status,
        "order_status_breakdown": order_status_breakdown
    }


# --- /revenue-over-time endpoint (Unchanged) ---
@router.get("/revenue-over-time", response_model=RevenueOverTimeResponse)
def get_revenue_over_time(
    days: int = 30, # Default to last 30 days
    db: Session = Depends(get_db)
):
    """
    Calculates total revenue grouped by date for the specified number of past days.
    """
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1) # Inclusive date range

    revenue_query = db.query(
            cast(models.Order.order_date, Date).label("order_day"),
            func.sum(models.Order.total_amount).label("daily_revenue")
        ).filter(
            cast(models.Order.order_date, Date) >= start_date,
            cast(models.Order.order_date, Date) <= end_date
        ).group_by(
            cast(models.Order.order_date, Date)
        ).order_by(
            cast(models.Order.order_date, Date)
        ).all()

    # Create a dictionary with all dates in the range initialized to 0 revenue
    date_range = [start_date + timedelta(days=i) for i in range(days)]
    revenue_map = {day: 0.0 for day in date_range}

    # Populate the map with actual revenue data
    for day, daily_revenue in revenue_query:
        if day in revenue_map: # Check if the date is within our range
            revenue_map[day] = daily_revenue if daily_revenue is not None else 0.0

    # Convert the map to the list format required by the response model
    revenue_data = [{"date": day, "revenue": revenue} for day, revenue in revenue_map.items()]

    return {"data": revenue_data}


# --- CHANGE 4: NEW Monthly Revenue Endpoint ---
@router.get("/monthly-revenue", response_model=MonthlyRevenueResponse)
def get_monthly_revenue(
    months: int = 6, # Default to last 6 months
    db: Session = Depends(get_db)
):
    """
    Calculates total revenue grouped by month for the specified number of past months.
    """
    # Determine the date range (e.g., last 6 full months including the current partial month)
    today = datetime.utcnow().date()
    
    # Correct way to find the start date 'months' ago (e.g., if today is Oct 23, 6 months ago is May 1)
    start_month_date = today.replace(day=1) # Start of current month (Oct 1)
    for _ in range(months - 1):
        # Go to the last day of the previous month, then to the first day
        start_month_date = (start_month_date - timedelta(days=1)).replace(day=1)
        
    # start_month_date is now the first day of the month 'months-1' months ago (e.g., May 1)

    # Query to get sum(total_amount) grouped by year and month
    revenue_query = db.query(
            extract('year', models.Order.order_date).label("order_year"),
            extract('month', models.Order.order_date).label("order_month"),
            func.sum(models.Order.total_amount).label("monthly_revenue")
        ).filter(
            models.Order.order_date >= start_month_date
            # No end date needed as we filter later
        ).group_by(
            extract('year', models.Order.order_date),
            extract('month', models.Order.order_date)
        ).order_by(
            extract('year', models.Order.order_date),
            extract('month', models.Order.order_date)
        ).all()

    # Create a dictionary { "YYYY-MM": 0.0 } for all months in the range
    revenue_map: Dict[str, float] = {}
    current_date = start_month_date
    end_date = today # Include current month
    
    while current_date <= end_date:
        month_key = current_date.strftime("%Y-%m")
        revenue_map[month_key] = 0.0
        # Move to the next month
        # Go to the first day of the next month
        # Find the last day of the current month
        last_day = (current_date.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        current_date = last_day + timedelta(days=1) # First day of next month


    # Populate the map with actual data
    for year, month, monthly_revenue in revenue_query:
        month_key = f"{int(year)}-{int(month):02d}" # Format as YYYY-MM
        if month_key in revenue_map:
            revenue_map[month_key] = monthly_revenue if monthly_revenue is not None else 0.0

    # Convert map to the list format with month abbreviations
    monthly_data = []
    # Ensure chronological order by sorting the keys
    for month_key in sorted(revenue_map.keys()):
        year, month_num = map(int, month_key.split('-'))
        month_abbr_name = month_abbr[month_num] # Get "Jan", "Feb" etc.
        monthly_data.append({"month": month_abbr_name, "revenue": revenue_map[month_key]})

    return {"data": monthly_data}


# --- Demand Forecast Endpoint (Unchanged) ---
@router.get("/forecast", response_model=schemas.DemandForecast)
def get_demand_forecast(db: Session = Depends(get_db)):
    """ Provides dummy demand forecast data. """
    forecast_data = []
    today = datetime.now()
    for i in range(30): # Generate forecast for next 30 days
        future_date = today + timedelta(days=i)
        # Simple dummy logic: base + weekly cycle + random noise
        value = int(100 + 20 * (1 + 0.8 * (future_date.weekday() / 6)) + random.uniform(-15, 15))
        forecast_data.append({"date": future_date.strftime("%Y-%m-%d"), "value": max(0, value)}) # Ensure value is not negative
    return {"forecast": forecast_data}