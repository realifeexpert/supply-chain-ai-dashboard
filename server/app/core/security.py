import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext

# Load environment variables from .env
load_dotenv()

# ==============================
# ENV CONFIG
# ==============================

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080)  # Default = 7 days
)

if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in environment variables")


# ==============================
# PASSWORD HASHING (BCRYPT)
# ==============================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ==============================
# JWT TOKEN CREATION
# ==============================

def create_access_token(subject: Union[str, Any]) -> str:
    """
    Create JWT access token.

    subject = usually user.id
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access_token"
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
