# server/app/database.py

import time
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# UPDATE: Humne '.core' ko hata diya hai, kyunki config.py ab same folder mein hai.
from .config import settings

def connect_with_retry():
    """
    Database se connect karne ki koshish karta hai, aur fail hone par dobara try karta hai.
    """
    retries = 5
    delay = 2
    for attempt in range(retries):
        try:
            engine = create_engine(settings.DATABASE_URL)
            connection = engine.connect()
            connection.close()
            print("✅ Database connection successful!")
            return engine
        except OperationalError:
            print(f"Database connection failed. Attempt {attempt + 1} of {retries}.")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("❌ Could not connect to the database after several retries.")
                raise

# Final engine, session, aur base
engine = connect_with_retry()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()