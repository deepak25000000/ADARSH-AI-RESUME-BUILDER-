"""
SQLAlchemy ORM models for the AI Resume Builder.
All tables are mapped here with proper relationships, indexes, and constraints.
Designed for Supabase PostgreSQL.
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, Float,
    ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """User accounts with role-based access control."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # user / admin
    is_active = Column(Boolean, default=True)
    phone = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    resume_scores = relationship("ResumeScore", back_populates="user", cascade="all, delete-orphan")
    skill_analyses = relationship("SkillAnalysis", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    """User resume data with structured sections."""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, default="My Resume")

    # Personal Details
    personal_info = Column(JSON, nullable=True)  # name, email, phone, linkedin, github, location

    # Resume Sections (stored as JSON for flexibility)
    education = Column(JSON, nullable=True)       # [{degree, institution, year, gpa}]
    skills = Column(JSON, nullable=True)           # [{category, items}]
    projects = Column(JSON, nullable=True)         # [{name, description, technologies, link}]
    certifications = Column(JSON, nullable=True)   # [{name, issuer, date, link}]
    internships = Column(JSON, nullable=True)      # [{company, role, duration, description}]
    achievements = Column(JSON, nullable=True)     # [{title, description, date}]
    experience = Column(JSON, nullable=True)       # [{company, role, duration, bullets}]

    # AI Generation
    target_job_role = Column(String(200), nullable=True)
    preferred_company = Column(String(200), nullable=True)
    generated_content = Column(Text, nullable=True)  # AI-generated resume text
    pdf_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="resumes")

    __table_args__ = (
        Index("idx_resume_user_id", "user_id"),
    )


class CoverLetter(Base):
    """AI-generated cover letters."""
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    company_name = Column(String(200), nullable=False)
    job_title = Column(String(200), nullable=False)
    job_description = Column(Text, nullable=True)
    tone = Column(String(50), default="professional")  # formal / confident / professional
    generated_content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="cover_letters")

    __table_args__ = (
        Index("idx_cover_letter_user_id", "user_id"),
    )


class Portfolio(Base):
    """AI-generated portfolio websites."""
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False, default="My Portfolio")
    template = Column(String(50), default="modern")  # modern / minimal / creative
    generated_html = Column(Text, nullable=True)
    generated_css = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="portfolios")

    __table_args__ = (
        Index("idx_portfolio_user_id", "user_id"),
    )


class JobDescription(Base):
    """Stored job descriptions for matching analysis."""
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=True)  # Extracted via NLP
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="job_descriptions")

    __table_args__ = (
        Index("idx_job_desc_user_id", "user_id"),
    )


class ResumeScore(Base):
    """Resume scoring results from AI analysis."""
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_description_id = Column(Integer, nullable=True)
    overall_score = Column(Float, nullable=False)
    keyword_match_score = Column(Float, nullable=True)
    format_score = Column(Float, nullable=True)
    content_score = Column(Float, nullable=True)
    missing_keywords = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    detailed_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="resume_scores")

    __table_args__ = (
        Index("idx_resume_score_user_id", "user_id"),
    )


class SkillAnalysis(Base):
    """Skill gap analysis results."""
    __tablename__ = "skill_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_role = Column(String(200), nullable=False)
    required_skills = Column(JSON, nullable=True)
    user_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    match_percentage = Column(Float, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="skill_analyses")

    __table_args__ = (
        Index("idx_skill_analysis_user_id", "user_id"),
    )
