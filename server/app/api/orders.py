from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models

router = APIRouter()

@router.get("/", response_model=List[schemas.Order])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Fetches all orders with their related items and product details efficiently.
    """
    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
        )
        .order_by(models.Order.order_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return orders

@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Creates a new order, validates items, and updates product stock.
    """
    # 1. Separate the basic order details from the items list
    order_data = order.model_dump(exclude={"items"})
    db_order = models.Order(**order_data)
    
    # 2. Process each item in the order
    if not order.items:
        raise HTTPException(status_code=400, detail="An order must contain at least one item.")

    for item_data in order.items:
        product = db.query(models.Product).filter(models.Product.id == item_data.product_id).first()
        
        # Check if product exists
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item_data.product_id} not found.")
        
        # Check if there is enough stock
        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for {product.name}. Available: {product.stock_quantity}, Requested: {item_data.quantity}"
            )
            
        # Update the product's stock quantity
        product.stock_quantity -= item_data.quantity
        
        # Create the OrderItem link
        order_item = models.OrderItem(
            product_id=product.id, 
            quantity=item_data.quantity
        )
        # Associate the item with the order
        db_order.items.append(order_item)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """
    Updates fulfillment details for a specific order.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
        
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """
    Deletes an order. The 'cascade' setting in the model will also delete its items.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()

    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    db.delete(db_order)
    db.commit()
    return None

