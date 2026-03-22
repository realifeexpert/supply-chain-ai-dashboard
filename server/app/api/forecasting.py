import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from typing import Optional

from ..database import get_db
from ..models import models

router = APIRouter()

@router.get("/forecast")
def get_demand_forecast(
    product_id: Optional[int] = None, 
    db: Session = Depends(get_db)
):
    # 1. Configuration & Date Setup
    today = datetime.utcnow().date()
    history_limit = today - timedelta(days=120) # Get a bit more history for better patterns
    
    # 2. Optimized Database Query
    query = db.query(
        cast(models.Order.order_date, Date).label("date"),
        func.sum(models.OrderItem.quantity).label("total_quantity")
    ).join(models.OrderItem, models.OrderItem.order_id == models.Order.id)\
     .filter(models.Order.order_date >= history_limit)

    if product_id:
        query = query.filter(models.OrderItem.product_id == product_id)
    
    order_data = query.group_by("date").order_by("date").all()

    if not order_data:
        return {"forecast": [], "metadata": {"status": "no_data"}}

    # 3. Data Engineering (Feature Extraction)
    df = pd.DataFrame(order_data, columns=['date', 'total_quantity'])
    df['date'] = pd.to_datetime(df['date'])
    
    # Fill missing dates to maintain the time-series rhythm
    idx = pd.date_range(start=df['date'].min(), end=today, freq='D')
    df = df.set_index('date').reindex(idx, fill_value=0).reset_index().rename(columns={'index': 'date'})
    
    # Feature 1: Time Trend
    df['time_index'] = np.arange(len(df))
    # Feature 2: Day of Week (0=Monday, 6=Sunday)
    df['day_of_week'] = df['date'].dt.dayofweek
    
    # Convert Day of Week into "One-Hot" columns (7 columns of 0s and 1s)
    df_encoded = pd.get_dummies(df, columns=['day_of_week'], prefix='dow')
    
    # Ensure all 7 days are represented even if they aren't in the data yet
    for i in range(7):
        col = f'dow_{i}'
        if col not in df_encoded.columns:
            df_encoded[col] = 0

    # Define X (Trend + Days) and y (Quantity)
    feature_cols = ['time_index'] + [f'dow_{i}' for i in range(7)]
    X = df_encoded[feature_cols]
    y = df_encoded['total_quantity']

    # 4. Training the Intelligent Model
    model = LinearRegression()
    model.fit(X, y)

    # Calculate error (Standard Deviation of Residuals)
    preds_hist = model.predict(X)
    std_dev = np.std(y - preds_hist)

    # 5. Generating the 30-Day Future
    forecast_results = []
    last_time_idx = df['time_index'].max()

    for i in range(1, 31):
        future_date = today + timedelta(days=i)
        
        # Prepare feature row for this specific future date
        dow = future_date.weekday()
        future_row = {col: 0 for col in feature_cols}
        future_row['time_index'] = last_time_idx + i
        future_row[f'dow_{dow}'] = 1
        
        # Make prediction
        X_future = pd.DataFrame([future_row])[feature_cols]
        pred_val = model.predict(X_future)[0]
        
        # Safety: Demand can't be negative
        val = max(0, float(pred_val))
        
        # "Smart" Confidence Interval: It grows slightly as we go further out (uncertainty)
        uncertainty_multiplier = 1.96 * (1 + (i * 0.01)) 
        
        forecast_results.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "day_name": future_date.strftime("%A"),
            "demand_estimate": round(val, 2),
            "confidence_upper": round(val + (uncertainty_multiplier * std_dev), 2),
            "confidence_lower": max(0, round(val - (uncertainty_multiplier * std_dev), 2)),
            "is_weekend": dow >= 5
        })

    return {
        "product_id": product_id,
        "model_confidence": round(max(0, 1 - (std_dev / (y.mean() + 1))), 2), # Simplified R-squared feel
        "forecast": forecast_results
    }