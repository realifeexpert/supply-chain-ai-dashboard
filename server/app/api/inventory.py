from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models

router = APIRouter()

@router.get("/products", response_model=List[schemas.Product])
def get_all_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product.sku}' already exists."
        )
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- UPDATE: Naya Function Product ko Update Karne ke liye ---
@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    # Pehle database se us product ko dhoondho
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    # Agar product nahi milta, to 404 error bhejo
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    # Frontend se aaye data ko loop karke update karo
    # 'exclude_unset=True' ka matlab hai ki sirf wahi fields update hongi jo frontend ne bheji hain
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- UPDATE: Naya Function Product ko Delete Karne ke liye ---
@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    # Pehle database se us product ko dhoondho
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()

    # Agar product nahi milta, to 404 error bhejo
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    db.delete(db_product)
    db.commit()
    # 204 status code ke saath koi content return nahi hota hai
    return None

