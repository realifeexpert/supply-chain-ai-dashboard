from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..core import security
from ..core.security import SECRET_KEY, ALGORITHM

router = APIRouter()


# =========================
# SIGNUP (Email + Password only)
# =========================
@router.post("/signup", response_model=schemas.User)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Simple signup → Only Email + Password required.
    """

    existing_user = db.query(models.User).filter(
        models.User.email == user_in.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        email=user_in.email,
        hashed_password=security.hash_password(user_in.password),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# LOGIN
# =========================
@router.post("/login")
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Login using Email + Password
    """

    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    access_token = security.create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }


# =========================
# AUTH DEPENDENCY
# =========================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    Extract user from JWT token
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(
        models.User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user
