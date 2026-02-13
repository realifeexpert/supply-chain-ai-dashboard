from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ---------------- ENUMS ---------------- #

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class DiscountType(str, Enum):
    percentage = "percentage"
    fixed = "fixed"

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

class MediaType(str, Enum):
    image = "image"
    video = "video"


# ---------------- ADDRESS SCHEMAS ---------------- #

# ADDRESS SCHEMAS

class AddressBase(BaseModel):
    full_name: str
    phone_number: str
    flat: str
    area: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: Optional[str] = "India"
    is_default: Optional[bool] = False


class AddressCreate(AddressBase):
    pass


class Address(AddressBase):
    id: int

    class Config:
        from_attributes = True



# ---------------- PRODUCT SCHEMAS ---------------- #

class ProductImageResponse(BaseModel):
    id: int
    media_url: str
    media_type: MediaType
    class Config:
        from_attributes = True


class ProductImageCreate(BaseModel):
    media_url: str
    media_type: MediaType = MediaType.image


class ProductBase(BaseModel):
    name: str
    sku: str
    stock_quantity: int
    description: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    reorder_level: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    gst_rate: Optional[float] = 0.0
    last_restocked: Optional[datetime] = None


class ProductCreate(ProductBase):
    images: List[ProductImageCreate] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    stock_quantity: Optional[int] = None
    description: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    reorder_level: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    gst_rate: Optional[float] = None
    last_restocked: Optional[datetime] = None
    images: Optional[List[ProductImageCreate]] = None


class Product(ProductBase):
    id: int
    images: List[ProductImageResponse] = []
    status: StockStatus
    class Config:
        from_attributes = True


# ---------------- USER SCHEMAS ---------------- #

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole = UserRole.user


class UserCreate(UserBase):
    password: str
    phone_number: str
    address: str


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


# ---------------- ORDER ITEM ---------------- #

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class ItemProductDetailWithPrice(BaseModel):
    name: str
    sku: str
    selling_price: float
    gst_rate: float
    class Config:
        from_attributes = True


class ItemInOrderResponse(BaseModel):
    quantity: int
    product: ItemProductDetailWithPrice
    class Config:
        from_attributes = True


# ---------------- ORDER SCHEMAS ---------------- #

class OrderBase(BaseModel):
    subtotal: float
    discount_value: Optional[float] = 0.0
    discount_type: Optional[DiscountType] = None
    total_gst: float
    shipping_charges: Optional[float] = 0.0
    total_amount: float

    payment_status: PaymentStatus = PaymentStatus.Unpaid
    payment_method: PaymentMethod
    status: OrderStatus = OrderStatus.Pending
    shipping_provider: Optional[ShippingProvider] = None
    tracking_id: Optional[str] = None
    vehicle_id: Optional[int] = None


class OrderCreate(BaseModel):
    # IMPORTANT: Now using saved address instead of manual address
    address_id: int
    payment_method: PaymentMethod

    discount_value: Optional[float] = 0.0
    discount_type: Optional[DiscountType] = None
    shipping_charges: Optional[float] = 0.0

    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    shipping_provider: Optional[ShippingProvider] = None
    tracking_id: Optional[str] = None
    vehicle_id: Optional[int] = None

    @validator("shipping_provider", pre=True)
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v


class Order(OrderBase):
    id: int
    order_date: datetime
    address: Optional[Address]
    items: List[ItemInOrderResponse]
    user: Optional[User]   # ADD THIS

    class Config:
        from_attributes = True


# ---------------- VEHICLE ---------------- #

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


# ---------------- SETTINGS ---------------- #

class AppSetting(BaseModel):
    setting_key: str
    setting_value: str
    class Config:
        from_attributes = True


class AppSettingsUpdate(BaseModel):
    settings: List[AppSetting]


# ---------------- ANALYTICS ---------------- #

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


class OrderStatusBreakdownItem(BaseModel):
    status: str
    value: int


class AnalyticsSummary(BaseModel):
    kpi_cards: List[KpiCard]
    top_selling_products: List[TopProduct]
    delivery_status: DeliveryStatusChart
    order_status_breakdown: List[OrderStatusBreakdownItem]
    class Config:
        from_attributes = True


# ---------------- FORECAST ---------------- #

class ForecastDataPoint(BaseModel):
    date: str
    value: int


class DemandForecast(BaseModel):
    forecast: List[ForecastDataPoint]
