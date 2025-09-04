from passlib.context import CryptContext

# Password hashing ke liye context setup karte hain
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Plain password ko hashed password se compare karta hai."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Plain password ka hash banata hai."""
    return pwd_context.hash(password)
