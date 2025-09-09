from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Enum, Boolean, ForeignKey
)
from sqlalchemy.orm import relationship
from ..database import Base
import enum
import datetime

# --- Enums for Choices (As per Final Blueprint) ---

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class OrderStatus(str, enum.Enum):
    Pending = "Pending"
    Processing = "Processing"
    Shipped = "Shipped"
    In_Transit = "In Transit"
    Delivered = "Delivered"
    Cancelled = "Cancelled"
    Returned = "Returned"

class PaymentStatus(str, enum.Enum):
    Paid = "Paid"
    Unpaid = "Unpaid"
    Pending = "Pending"
    COD = "COD"
    Refunded = "Refunded"

class PaymentMethod(str, enum.Enum):
    Credit_Card = "Credit Card"
    Debit_Card = "Debit Card"
    UPI = "UPI"
    Net_Banking = "Net Banking"
    Wallet = "Wallet"
    COD = "COD"

class ShippingProvider(str, enum.Enum):
    Self_Delivery = "Self-Delivery"
    BlueDart = "BlueDart"
    Delhivery = "Delhivery"
    DTDC = "DTDC"

class StockStatus(str, enum.Enum):
    In_Stock = "In Stock"
    Low_Stock = "Low Stock"
    Out_of_Stock = "Out of Stock"


# --- [NEW] Association Object for Order <-> Product Relationship ---
# This is crucial for storing the 'quantity' of each item in an order.
class OrderItem(Base):
    __tablename__ = 'order_items'
    order_id = Column(Integer, ForeignKey('orders.id'), primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    quantity = Column(Integer, nullable=False)
    
    # Relationships to easily access Order and Product objects
    order = relationship("Order", back_populates="items")
    product = relationship("Product")


# --- Main Table Models ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(Enum(UserRole, name="userrole"), default=UserRole.user)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    stock_quantity = Column(Integer)
    status = Column(Enum(StockStatus))
    image_url = Column(String, nullable=True)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Customer Info
    customer_name = Column(String, index=True)
    customer_email = Column(String, index=True) # NEW as per blueprint
    shipping_address = Column(String)
    
    # Payment Info
    amount = Column(Float)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.Unpaid)
    payment_method = Column(Enum(PaymentMethod))
    
    # Fulfillment Info
    status = Column(Enum(OrderStatus), default=OrderStatus.Pending)
    shipping_provider = Column(Enum(ShippingProvider), nullable=True) # NEW as per blueprint
    tracking_id = Column(String, nullable=True, index=True)
    
    # Logistics Info
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    
    # Relationship to OrderItem (to get products with quantity)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, index=True)
    driver_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="Idle")
    live_temp = Column(Float)
    orders_count = Column(Integer)
    fuel_level = Column(Float)

