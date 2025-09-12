import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import ValidationError
from typing import Optional

class Settings(BaseSettings):
    # Database URL (Required)
    DATABASE_URL: str

    # Cloudinary Credentials for Image Storage (Required for inventory feature)
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # Groq AI Credentials for Description Generation (Required for inventory feature)
    GROQ_API_KEY: str
    # --- UPDATE: Added the Groq model name with a default value ---
    GROQ_MODEL_NAME: str = "gemma2-9b-it" 

    # Security Key (Optional for now, as you requested)
    SECRET_KEY: Optional[str] = None
    
    # Pydantic V2 configuration to load from .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8'
    )

# This block remains the same. It will now check for all the required keys.
try:
    settings = Settings()
    print("✅ Configuration (.env) loaded successfully!")
except ValidationError as e:
    print("❌ FATAL ERROR: Missing or invalid environment variables in .env file.")
    print("Please ensure DATABASE_URL, CLOUDINARY_..., and GROQ_API_KEY are set.")
    print(e)
    sys.exit(1)

