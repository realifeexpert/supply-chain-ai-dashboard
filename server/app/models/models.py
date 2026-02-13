from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Enum, Boolean, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from ..database import Base 
import enum
import datetime


# ---------------- ENUMS ---------------- #

class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"

class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"

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

class MediaType(str, enum.Enum):
    image = "image"
    video = "video"


# ---------------- ASSOCIATION TABLE ---------------- #

class OrderItem(Base):
    __tablename__ = 'order_items'

    order_id = Column(Integer, ForeignKey('orders.id'), primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class ProductImage(Base):
    __tablename__ = 'product_images'

    id = Column(Integer, primary_key=True, index=True)
    media_url = Column(String, nullable=False)
    media_type = Column(Enum(MediaType), default=MediaType.image)

    product_id = Column(Integer, ForeignKey('products.id'))
    product = relationship("Product", back_populates="images")


# ---------------- MAIN TABLES ---------------- #

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole, name="userrole"), default=UserRole.user)
    is_active = Column(Boolean, default=True)

    phone_number = Column(String, unique=True, nullable=True)
    address = Column(Text, nullable=True)

    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)

    # Relationships
    orders = relationship("Order", back_populates="user")
    addresses = relationship("Address", back_populates="user", cascade="all, delete")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)

    flat = Column(String, nullable=False)
    area = Column(String, nullable=False)
    landmark = Column(String, nullable=True)

    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    country = Column(String, default="India")

    is_default = Column(Boolean, default=False)

    user = relationship("User")



class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    stock_quantity = Column(Integer)

    description = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=True)
    supplier = Column(String, nullable=True)

    reorder_level = Column(Integer, default=10, nullable=True)
    cost_price = Column(Float, nullable=True)
    selling_price = Column(Float, nullable=True)
    gst_rate = Column(Float, nullable=True, default=0.0)
    last_restocked = Column(DateTime, nullable=True)

    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan"
    )


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Link to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="orders")

    # NEW: Link to saved address
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=True)
    address = relationship("Address")

    # --- OLD FIELDS (kept for backward compatibility) ---
    customer_name = Column(String, index=True)
    customer_email = Column(String, index=True)
    phone_number = Column(String, nullable=True)
    shipping_address = Column(String)

    # Financial
    subtotal = Column(Float)
    discount_value = Column(Float, default=0.0)
    discount_type = Column(Enum(DiscountType), nullable=True)
    total_gst = Column(Float)
    shipping_charges = Column(Float, default=0.0)
    total_amount = Column(Float)

    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.Unpaid)
    payment_method = Column(Enum(PaymentMethod))
    status = Column(Enum(OrderStatus), default=OrderStatus.Pending)

    shipping_provider = Column(Enum(ShippingProvider), nullable=True)
    tracking_id = Column(String, nullable=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


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


class AppSettings(Base):
    __tablename__ = 'app_settings'

    setting_key = Column(String, primary_key=True, index=True)
    setting_value = Column(String, nullable=False)
