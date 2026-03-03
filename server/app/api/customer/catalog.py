from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from ...database import get_db
from ...models import models
from ...schemas import schemas
from ...schemas.schemas import StockStatus

router = APIRouter()

# ================================
# 1. GET ALL PRODUCTS (EXISTING)
# ================================
@router.get("/products", response_model=List[schemas.Product])
def get_storefront_products(db: Session = Depends(get_db)):
    products = (
        db.query(models.Product)
        .options(joinedload(models.Product.images))
        .filter(models.Product.stock_quantity > 0)
        .all()
    )

    result = []
    for product in products:
        # Reusable Status Logic
        if product.stock_quantity <= 0:
            status = StockStatus.Out_of_Stock
        elif product.reorder_level and product.stock_quantity <= product.reorder_level:
            status = StockStatus.Low_Stock
        else:
            status = StockStatus.In_Stock

        product.status = status
        result.append(product)

    return result

# ================================
# 2. GET SINGLE PRODUCT DETAILS (ADD THIS)
# ================================
@router.get("/products/{product_id}", response_model=schemas.Product)
def get_product_details(product_id: int, db: Session = Depends(get_db)):
    # Fetch product with images
    product = (
        db.query(models.Product)
        .options(joinedload(models.Product.images))
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 🔥 ATTACH STATUS MANUALLY (Matches your List Logic)
    if product.stock_quantity <= 0:
        product.status = StockStatus.Out_of_Stock
    elif product.reorder_level and product.stock_quantity <= product.reorder_level:
        product.status = StockStatus.Low_Stock
    else:
        product.status = StockStatus.In_Stock

    return product