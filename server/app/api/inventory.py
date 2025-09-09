from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models

router = APIRouter()

@router.get("/products", response_model=List[schemas.Product])
def get_all_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # --- IMPROVEMENT: List ko naam ke anusaar sort kiya gaya hai ---
    # Isse frontend dropdown mein products hamesha alphabetical order mein dikhenge.
    products = db.query(models.Product).order_by(models.Product.name).offset(skip).limit(limit).all()
    return products

@router.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product_check = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product.sku}' already exists."
        )
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # --- IMPROVEMENT: Debugging ke liye print statement ---
    # Jab bhi naya product banega, terminal mein message dikhega.
    print(f"✅ New product created via API: {db_product.name} (SKU: {db_product.sku})")
    
    return db_product

# --- Aapka UPDATE function jaisa tha waisa hi hai (NO CHANGE) ---
@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- Aapka DELETE function jaisa tha waisa hi hai (NO CHANGE) ---
@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()

    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    db.delete(db_product)
    db.commit()
    return None