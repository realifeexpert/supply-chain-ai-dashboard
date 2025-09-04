from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List 
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

# UPDATE: Humne OrderStatus ke values ko Capitalized kiya hai (pehle all caps the)
# taaki yeh hamare models.py file se bilkul match karein.
class OrderStatus(str, Enum):
    Pending = "Pending"
    Shipped = "Shipped"
    Delivered = "Delivered"
    Cancelled = "Cancelled"

class StockStatus(str, Enum):
    IN_STOCK = "In Stock"
    LOW_STOCK = "Low Stock"
    OUT_OF_STOCK = "Out of Stock"


# Base Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.user

class ProductBase(BaseModel):
    name: str
    sku: str
    stock_quantity: int
    status: StockStatus
    image_url: Optional[str] = None

class OrderBase(BaseModel):
    customer_name: str
    amount: float
    status: OrderStatus
    shipping_address: str

class VehicleBase(BaseModel):
    vehicle_number: str
    driver_name: str
    latitude: float
    longitude: float
    status: str
    live_temp: float
    orders_count: int
    fuel_level: float

# Schemas for creating new records
class UserCreate(UserBase):
    password: str

class ProductCreate(ProductBase):
    pass

class OrderCreate(OrderBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    status: Optional[StockStatus] = None
    image_url: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

# --- UPDATE: Naya Schema Order ko Update Karne ke liye ---
# Ismein saare fields Optional hain. Hum khaas taur par 'status' update karne ke liye isey use karenge.
class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = None


# Schemas for reading data
class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    order_date: datetime
    class Config:
        from_attributes = True

class Vehicle(VehicleBase):
    id: int
    class Config:
        from_attributes = True


# Analytics Schemas
class KpiCard(BaseModel):
    title: str
    value: str
    change: str

class TopProduct(BaseModel):
    name: str
    value: int

class DeliveryStatusChart(BaseModel):
    on_time: int
    delayed: int
    
class AnalyticsSummary(BaseModel):
    kpi_cards: List[KpiCard]
    top_selling_products: List[TopProduct]
    delivery_status: DeliveryStatusChart

class ForecastDataPoint(BaseModel):
    date: str
    value: int

class DemandForecast(BaseModel):
    forecast: List[ForecastDataPoint]

