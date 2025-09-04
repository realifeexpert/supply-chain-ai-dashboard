# server/app/models/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Boolean
from ..database import Base
import enum
import datetime

# UPDATE: Humne member names (Admin, User) ko bhi lowercase kar diya hai
# Isse Python aur Database ke beech koi confusion nahi rahega.
class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

# Baaki Enums waise hi rahenge
class OrderStatus(str, enum.Enum):
    Pending = "Pending"
    Shipped = "Shipped"
    Delivered = "Delivered"
    Cancelled = "Cancelled"

class StockStatus(str, enum.Enum):
    In_Stock = "In Stock"
    Low_Stock = "Low Stock"
    Out_of_Stock = "Out of Stock"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    # UPDATE: Humne Enum(UserRole) ko naye, lowercase enum se joda hai
    # Aur default value bhi lowercase .user kar di hai
    role = Column(Enum(UserRole, name="userrole", create_type=True), default=UserRole.user)
    
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
    customer_name = Column(String, index=True)
    order_date = Column(DateTime, default=datetime.datetime.utcnow)
    amount = Column(Float)
    status = Column(Enum(OrderStatus), default=OrderStatus.Pending)
    shipping_address = Column(String)


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