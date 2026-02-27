"""
Database connection and session management using SQLAlchemy.
Connects to Supabase PostgreSQL. Falls back to SQLite for local development.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Attempt to connect to Supabase PostgreSQL
database_url = settings.DATABASE_URL

# SQLAlchemy requires postgresql:// not postgres://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

is_sqlite = "sqlite" in database_url

try:
    if is_sqlite:
        raise Exception("Using SQLite")
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        connect_args={"connect_timeout": 10, "options": "-c statement_timeout=30000"},
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Connected to PostgreSQL")
except Exception as e:
    print(f"Could not connect to PostgreSQL: {e}")
    print("Using local SQLite database as fallback")
    # For Vercel, use /tmp for writable SQLite
    if os.environ.get("VERCEL"):
        db_path = "/tmp/ai_resume.db"
    else:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_resume.db")
    database_url = f"sqlite:///{db_path}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
