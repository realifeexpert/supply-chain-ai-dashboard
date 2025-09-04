from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db  # <-- Yahaan badlav karein
from ..schemas import schemas
from ..models import models # <-- Yahaan '..' add karna zaroori hai

router = APIRouter()

@router.get("/vehicles", response_model=List[schemas.Vehicle])
def get_all_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles
