# server/app/core/config.py

import sys
from pydantic_settings import BaseSettings, SettingsConfigDict # UPDATE: Ise import karein
from pydantic import ValidationError
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: Optional[str] = None
    
    # UPDATE: Pydantic V2 ka naya tareeka
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8'
    )

# Baaki code same rahega
try:
    settings = Settings()
    print("✅ Configuration (.env) loaded successfully!")
except ValidationError as e:
    print("❌ FATAL ERROR: Missing or invalid environment variables in .env file.")
    print(e)
    sys.exit(1)