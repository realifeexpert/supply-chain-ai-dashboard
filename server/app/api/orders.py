# UPDATE: Humne status_code aur HTTPException ko import kiya hai
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models

router = APIRouter()

@router.get("/", response_model=List[schemas.Order])
def get_all_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Hum orders ko date ke hisaab se sort kar rahe hain taaki sabse naye order upar dikhein
    orders = db.query(models.Order).order_by(models.Order.order_date.desc()).offset(skip).limit(limit).all()
    return orders

# UPDATE: Naya order create hone par 201 status code bhejenge
@router.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # UPDATE: Humne Pydantic v2 ke liye .model_dump() ka istemal kiya hai
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

# --- UPDATE: Naya Function Order ka Status Update Karne ke liye ---
@router.put("/{order_id}", response_model=schemas.Order)
def update_order_status(order_id: int, order_update: schemas.OrderUpdate, db: Session = Depends(get_db)):
    # Pehle database se us order ko dhoondho
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    # Agar order nahi milta, to 404 error bhejo
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    # Frontend se aaye status ko update karo
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
        
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

# --- UPDATE: Naya Function Order ko Delete Karne ke liye ---
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    # Pehle database se us order ko dhoondho
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()

    # Agar order nahi milta, to 404 error bhejo
    if db_order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    db.delete(db_order)
    db.commit()
    # 204 status code ke saath koi content return nahi hota hai
    return None

