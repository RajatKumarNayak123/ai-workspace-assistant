from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config.settings import settings


# ==========================================
# Database Engine
# ==========================================

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)


# ==========================================
# Session Factory
# ==========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ==========================================
# Base Class for Models
# ==========================================

Base = declarative_base()


# ==========================================
# Dependency
# ==========================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# Import all models
from app.models import *

# Create tables
# Base.metadata.create_all(bind=engine)