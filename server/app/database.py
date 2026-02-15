import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError

from .config import settings


# =========================
# DATABASE CONNECTION (WITH RETRY)
# =========================
def connect_with_retry():
    """
    Tries to connect to the database with retry.
    Useful for Docker / Render cold start.
    """
    retries = 5
    delay = 2

    for attempt in range(retries):
        try:
            engine = create_engine(
                settings.DATABASE_URL,

                # Production-safe pooling
                pool_pre_ping=True,
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,

                # Needed for Supabase/Postgres stability
                pool_recycle=1800,
            )

            connection = engine.connect()
            connection.close()

            print("✅ Database connection successful!")
            return engine

        except OperationalError:
            print(f"Database connection failed. Attempt {attempt + 1}/{retries}")

            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                print("❌ Could not connect to database.")
                raise


# =========================
# ENGINE
# =========================
engine = connect_with_retry()


# =========================
# SESSION
# =========================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================
# BASE MODEL
# =========================
Base = declarative_base()


# =========================
# FASTAPI DEPENDENCY
# =========================
def get_db():
    """
    Creates a new DB session per request and closes safely.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
