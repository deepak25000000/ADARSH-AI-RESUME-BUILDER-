"""
AI Resume & Portfolio Builder — FastAPI Application Entry Point.
Configures CORS, routes, and database initialization.
Compatible with Vercel serverless deployment.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.config import settings
from app.database import engine, Base

# Import all routes
from app.routes import auth, resume, cover_letter, portfolio, admin, ai_features


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    from app.models import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified")
    yield
    print("Application shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Resume & Portfolio Builder",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware — allow all origins for deployment compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(cover_letter.router)
app.include_router(portfolio.router)
app.include_router(admin.router)
app.include_router(ai_features.router)


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """API health check."""
    return {"status": "healthy"}


# Vercel serverless handler
handler = app
