from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import models
# Humne security file import ki hai taaki password hash kar sakein
from app.security import get_password_hash
from datetime import datetime

def seed_database():
    # Database se connect karein
    db: Session = SessionLocal()

    try:
        # Check karein ki pehle se data hai ya nahi
        if db.query(models.User).first():
            print("Database already contains data. Seeding aborted.")
            return

        print("Seeding database with initial data...")

        # --- Users ---
        # Hum ab plain password ke bajaye hashed password daal rahe hain
        hashed_password_admin = get_password_hash("admin123")
        hashed_password_user = get_password_hash("user123")

        users = [
            # Humne 'is_active' aur 'hashed_password' fields add ki hain
            models.User(name="Admin User", email="admin@example.com", role=models.UserRole.admin, is_active=True, hashed_password=hashed_password_admin),
            models.User(name="Shiva Maurya", email="shiva@example.com", role=models.UserRole.user, is_active=True, hashed_password=hashed_password_user),
            models.User(name="Jane Smith", email="jane@example.com", role=models.UserRole.user, is_active=False, hashed_password=get_password_hash("jane123")),
        ]
        db.add_all(users)
        db.commit()
        print(f"Added {len(users)} users.")

        # --- Products ---
        products = [
            # Humne 'stock_quantity' ka istemal kiya hai 'stock' ke bajaye
            models.Product(name="Industrial Drone", sku="DRN-001", stock_quantity=15, status=models.StockStatus.In_Stock, image_url="https://placehold.co/100x100/18181b/38bdf8?text=Drone"),
            models.Product(name="Sensor Kit", sku="SNS-002", stock_quantity=8, status=models.StockStatus.Low_Stock, image_url="https://placehold.co/100x100/18181b/f472b6?text=Sensor"),
            models.Product(name="GPS Tracker", sku="GPS-003", stock_quantity=120, status=models.StockStatus.In_Stock, image_url="https://placehold.co/100x100/18181b/a78bfa?text=GPS"),
            models.Product(name="Heavy Machinery Parts", sku="HMP-004", stock_quantity=0, status=models.StockStatus.Out_of_Stock, image_url="https://placehold.co/100x100/18181b/fbbf24?text=Parts"),
        ]
        db.add_all(products)
        db.commit()
        print(f"Added {len(products)} products.")

        # --- Orders ---
        orders = [
            models.Order(customer_name="Tech Solutions Inc.", order_date=datetime.utcnow(), amount=15000.00, status=models.OrderStatus.Shipped, shipping_address="123 Tech Park, Silicon Valley"),
            models.Order(customer_name="Global Exports", order_date=datetime.utcnow(), amount=8500.50, status=models.OrderStatus.Pending, shipping_address="456 Trade Center, New York"),
            models.Order(customer_name="Innovate LLC", order_date=datetime.utcnow(), amount=22300.75, status=models.OrderStatus.Delivered, shipping_address="789 Innovation Dr, Boston"),
        ]
        db.add_all(orders)
        db.commit()
        print(f"Added {len(orders)} orders.")
        
        # --- Vehicles ---
        vehicles = [
            # Humne 'orders_count' aur 'fuel_level' fields add ki hain
            models.Vehicle(vehicle_number="MH12-AB1234", driver_name="John Doe", latitude=18.5204, longitude=73.8567, status="On Route", live_temp=4.5, orders_count=5, fuel_level=75.5),
            models.Vehicle(vehicle_number="DL03-CD5678", driver_name="Rajesh Kumar", latitude=18.5678, longitude=73.9184, status="Idle", live_temp=-1.2, orders_count=0, fuel_level=92.0),
            models.Vehicle(vehicle_number="KA05-EF9012", driver_name="Priya Sharma", latitude=18.6011, longitude=73.7862, status="In-Shop", live_temp=25.0, orders_count=0, fuel_level=15.2),
        ]
        db.add_all(vehicles)
        db.commit()
        print(f"Added {len(vehicles)} vehicles.")
        
        print("\nDatabase seeded successfully!")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

