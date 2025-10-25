from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..schemas import schemas
from ..models import models
from ..utils.settings_helpers import get_low_stock_threshold, get_product_status

router = APIRouter()

# --- YAHAN BADLAAV KIYA GAYA HAI ---
@router.get("/products", response_model=List[schemas.Product])
def get_all_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Settings se low stock limit fetch karein
    low_stock_threshold = get_low_stock_threshold(db)

    # Product ke saath uske images ko bhi pehle se load kar lein
    products_from_db = db.query(models.Product).options(joinedload(models.Product.images)).order_by(models.Product.name).offset(skip).limit(limit).all()

    # Har product ke liye status ko calculate karein
    products_with_status = []
    for product in products_from_db:
        # Calculate status
        calculated_status = get_product_status(product.stock_quantity, low_stock_threshold)

        # 'product' object par 'status' attribute set karein
        # Yeh database mein save nahi hoga, sirf response ke liye hai
        product.status = calculated_status
        products_with_status.append(product)

    return products_with_status

@router.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # (Is function mein koi badlaav ki zaroorat nahi hai)
    # Kyunki 'status' ab 'ProductCreate' schema ka hissa nahi hai,
    # isliye 'product.model_dump()' mein woh field hoga hi nahi.

    db_product_check = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product.sku}' already exists."
        )

    product_data = product.model_dump(exclude={"images"})
    db_product = models.Product(**product_data)

    if product.images:
        for img_data in product.images:
            new_image = models.ProductImage(**img_data.model_dump())
            db_product.images.append(new_image)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Response ke liye, status ko calculate karke add karein
    low_stock_threshold = get_low_stock_threshold(db)
    # Manually assign the calculated status to the object before returning
    # This relies on the response_model (schemas.Product) including the 'status' field
    calculated_status = get_product_status(db_product.stock_quantity, low_stock_threshold)
    setattr(db_product, 'status', calculated_status) # Use setattr for clarity or direct assignment

    print(f"✅ New product created via API: {db_product.name} (SKU: {db_product.sku})")
    return db_product

@router.put("/products/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    # (Is function mein koi badlaav ki zaroorat nahi hai)
    # Kyunki 'status' ab 'ProductUpdate' schema ka hissa nahi hai,
    # isliye 'update_data' mein woh field hoga hi nahi.

    db_product = db.query(models.Product).options(joinedload(models.Product.images)).filter(models.Product.id == product_id).first()

    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = product_update.model_dump(exclude_unset=True)

    if 'images' in update_data:
        # Fetch existing images to delete them properly if needed (depends on cascade settings)
        # Or just clear the relationship as done here
        db_product.images.clear()
        for img_data_dict in update_data['images']:
            # Assuming img_data_dict is already validated or comes from a trusted source
            # If it's raw data, validate using ProductImageCreate first
            new_image = models.ProductImage(**img_data_dict)
            db_product.images.append(new_image)
        del update_data['images']

    # Update other fields
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.add(db_product) # Add might not be strictly necessary for updates, but safe.
    db.commit()
    db.refresh(db_product)

    # Response ke liye, status ko calculate karke add karein
    low_stock_threshold = get_low_stock_threshold(db)
    # Manually assign the calculated status to the object before returning
    calculated_status = get_product_status(db_product.stock_quantity, low_stock_threshold)
    setattr(db_product, 'status', calculated_status) # Use setattr for clarity or direct assignment

    return db_product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    # ... (Is function mein koi change nahi) ...
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return None