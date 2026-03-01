from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings


# =========================
# DATABASE ENGINE
# =========================
# Production-ready SQLAlchemy engine configuration
engine = create_engine(
    settings.DATABASE_URL,

    # Ensures stale connections are automatically refreshed
    pool_pre_ping=True,

    # Connection pool configuration
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,

    # Prevents idle connections from dying (important for Supabase/Postgres)
    pool_recycle=1800,
)


print("✅ Database engine initialized.")


# =========================
# SESSION FACTORY
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
    Creates a database session per request
    and ensures it closes safely afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()