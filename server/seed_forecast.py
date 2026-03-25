from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import models

def seed_trending_data():
    db = SessionLocal()
    try:
        # 1. Get some products to make "Trending"
        products = db.query(models.Product).limit(3).all()
        if not products:
            print("❌ No products found in DB. Please add products first.")
            return

        print(f"Generating synthetic demand for: {[p.name for p in products]}")

        # 2. Create 30 days of "Spiking" sales history
        for product in products:
            for i in range(30):
                target_date = datetime.utcnow() - timedelta(days=i)
                
                # Create a fake order
                new_order = models.Order(
                    order_date=target_date,
                    status="Delivered",
                    total_amount=100.0,
                    payment_status="Paid"
                )
                db.add(new_order)
                db.flush() # Get order ID

                # Add quantity (make it look like a growing trend)
                # More recent days get higher numbers
                base_qty = 5 if i < 5 else 1
                random_spike = random.randint(1, 10)
                
                item = models.OrderItem(
                    order_id=new_order.id,
                    product_id=product.id,
                    quantity=base_qty + random_spike,
                    unit_price=product.selling_price or 50.0
                )
                db.add(item)
        
        db.commit()
        print("✅ Success! 90 fake orders created. Refresh your dashboard.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_trending_data()