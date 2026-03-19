import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ValidationError
from typing import Optional


class Settings(BaseSettings):
    # =========================
    # DATABASE (REQUIRED)
    # =========================
    DATABASE_URL: str

    # =========================
    # SUPABASE (REQUIRED)
    # =========================

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str


    # =========================
    # CLOUDINARY (REQUIRED)
    # =========================
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # =========================
    # GROQ AI (REQUIRED)
    # =========================
    GROQ_API_KEY: str
    GROQ_MODEL_NAME: str = "llama-3.1-8b-instant"

    # =========================
    # JWT SECURITY (REQUIRED)
    # =========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    # =========================
    # RAZORPAY (OPTIONAL)
    # =========================
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None

    # =========================
    # Pydantic config
    # =========================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


# =========================
# LOAD SETTINGS
# =========================
try:
    settings = Settings()
    print("✅ Configuration (.env) loaded successfully!")

except ValidationError as e:
    print("\n❌ FATAL ERROR: Missing or invalid environment variables in .env file.\n")

    print("Required variables:")
    print("""
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
""")

    print("\nError Details:\n", e)
    sys.exit(1)
