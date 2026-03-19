import json
import os
import urllib.request
from urllib.error import HTTPError

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


def _validate_supabase_token(token: str):
    """Validate a Supabase access token via Supabase /auth/v1/user endpoint."""
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        return None

    url = f"{supabase_url}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": service_key,
        "Content-Type": "application/json",
    }

    try:
        request = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(request, timeout=5) as response:
            data = json.loads(response.read().decode())
            if isinstance(data, dict) and data.get("id"):
                return data
            if isinstance(data, dict) and "data" in data and data["data"].get("id"):
                return data["data"]
    except HTTPError as exc:
        return None
    except Exception:
        return None

    return None


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

    # 1) Try backend token first (local app JWT)
    user_id = None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is not None:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                return user
    except JWTError:
        pass

    # 2) Try Supabase token as a fallback (when frontend uses Supabase auth)
    supabase_user = _validate_supabase_token(token)
    if supabase_user is not None:
        email = supabase_user.get("email")
        if not email:
            raise credentials_exception

        user = db.query(models.User).filter(models.User.email == email).first()
        if user is None:
            # Create a local backend user record to satisfy protected endpoints
            # Password is random because login is handled by Supabase.
            random_password = os.urandom(24).hex()
            user = models.User(
                email=email,
                hashed_password=security.hash_password(random_password),
                role="user",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    raise credentials_exception
