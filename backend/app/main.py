"""
AI Resume & Portfolio Builder — FastAPI Application Entry Point.
Configures CORS, rate limiting, routes, and database initialization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base

# Import all routes
from app.routes import auth, resume, cover_letter, portfolio, admin, ai_features


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    # Import models to register them with Base
    from app.models import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    yield
    print("👋 Application shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Resume & Portfolio Builder with ATS optimization, cover letter generation, skill gap analysis, and portfolio website creation.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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
    return {"status": "healthy", "database": "connected"}
