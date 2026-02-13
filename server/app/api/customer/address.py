from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...database import get_db
from ...models import models
from ...schemas import schemas
from ..auth import get_current_user

router = APIRouter()

# ---------------- ADD ADDRESS ----------------
@router.post("/add", response_model=schemas.Address)
def add_address(
    address: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_address = models.Address(
        user_id=current_user.id,
        full_name=address.full_name,
        phone_number=address.phone_number,
        flat=address.flat,
        area=address.area,
        landmark=address.landmark,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        country=address.country,
        is_default=address.is_default
    )

    if address.is_default:
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


# ---------------- GET MY ADDRESSES ----------------
@router.get("/my-addresses", response_model=List[schemas.Address])
def get_my_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Address).filter(
        models.Address.user_id == current_user.id
    ).all()


# ---------------- UPDATE ADDRESS ----------------
@router.put("/update/{address_id}", response_model=schemas.Address)
def update_address(
    address_id: int,
    address: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id
    ).first()

    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")

    if address.is_default:
        db.query(models.Address).filter(
            models.Address.user_id == current_user.id
        ).update({"is_default": False})

    db_address.full_name = address.full_name
    db_address.phone_number = address.phone_number
    db_address.flat = address.flat
    db_address.area = address.area
    db_address.landmark = address.landmark
    db_address.city = address.city
    db_address.state = address.state
    db_address.pincode = address.pincode
    db_address.country = address.country
    db_address.is_default = address.is_default

    db.commit()
    db.refresh(db_address)
    return db_address


# ---------------- DELETE ADDRESS ----------------
@router.delete("/delete/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_address = db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == current_user.id
    ).first()

    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")

    db.delete(db_address)
    db.commit()

    return {"message": "Address deleted successfully"}
