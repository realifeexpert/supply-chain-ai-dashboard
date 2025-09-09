from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- Enums (Matching Final Blueprint from models.py) ---

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class OrderStatus(str, Enum):
    Pending = "Pending"
    Processing = "Processing"
    Shipped = "Shipped"
    In_Transit = "In Transit"
    Delivered = "Delivered"
    Cancelled = "Cancelled"
    Returned = "Returned"

class PaymentStatus(str, Enum):
    Paid = "Paid"
    Unpaid = "Unpaid"
    Pending = "Pending"
    COD = "COD"
    Refunded = "Refunded"

class PaymentMethod(str, Enum):
    Credit_Card = "Credit Card"
    Debit_Card = "Debit Card"
    UPI = "UPI"
    Net_Banking = "Net Banking"
    Wallet = "Wallet"
    COD = "COD"

class ShippingProvider(str, Enum):
    Self_Delivery = "Self-Delivery"
    BlueDart = "BlueDart"
    Delhivery = "Delhivery"
    DTDC = "DTDC"

class StockStatus(str, Enum):
    In_Stock = "In Stock"
    Low_Stock = "Low Stock"
    Out_of_Stock = "Out of Stock"


# --- Product Related Schemas ---

class ProductBase(BaseModel):
    name: str
    sku: str
    stock_quantity: int
    status: StockStatus
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    stock_quantity: Optional[int] = None
    status: Optional[StockStatus] = None
    image_url: Optional[str] = None

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

# NEW: Schema for showing product details within an order response
class ItemProductDetail(BaseModel):
    name: str
    sku: str
    class Config:
        from_attributes = True

# NEW: Schema for showing an item inside an order response, with quantity
class ItemInOrder(BaseModel):
    quantity: int
    product: ItemProductDetail
    class Config:
        from_attributes = True


# --- User & Vehicle Schemas (No major changes) ---
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.user

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    vehicle_number: str
    driver_name: str
    latitude: float
    longitude: float
    status: str
    live_temp: float
    orders_count: int
    fuel_level: float

class Vehicle(VehicleBase):
    id: int
    class Config:
        from_attributes = True

# --- Order Related Schemas (Fully Updated to Blueprint) ---

# NEW: Schema for defining an item when creating an order
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderBase(BaseModel):
    # Customer Info
    customer_name: str
    customer_email: str
    shipping_address: str
    
    # Payment Info
    amount: float
    payment_status: PaymentStatus = PaymentStatus.Unpaid
    payment_method: PaymentMethod
    
    # Fulfillment Info
    status: OrderStatus = OrderStatus.Pending
    shipping_provider: Optional[ShippingProvider] = None
    tracking_id: Optional[str] = None
    
    # Logistics Info
    vehicle_id: Optional[int] = None

class OrderCreate(OrderBase):
    # An order must be created with at least one item
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    # Allows updating specific fulfillment fields
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    shipping_provider: Optional[ShippingProvider] = None
    tracking_id: Optional[str] = None
    vehicle_id: Optional[int] = None

    @validator("shipping_provider", pre=True)
    def empty_str_to_none(cls, v):
        """Khaali string ko None mein badal deta hai."""
        if v == "":
            return None
        return v

class Order(OrderBase):
    id: int
    order_date: datetime
    # The response will show a list of items with their quantities
    items: List[ItemInOrder]
    class Config:
        from_attributes = True


# --- Analytics Schemas (No Change) ---
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

