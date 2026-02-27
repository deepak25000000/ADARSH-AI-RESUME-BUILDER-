"""
Application configuration using Pydantic Settings.
Loads values from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "AI Resume Builder"
    DEBUG: bool = False

    # Supabase PostgreSQL Database
    DATABASE_URL: str = "sqlite:///./ai_resume.db"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # JWT Authentication
    SECRET_KEY: str = "change-this-to-a-super-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # HuggingFace (FREE API)
    HUGGINGFACE_API_KEY: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
