"""
Pydantic schemas for request/response validation.
All API input and output models defined here.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────── Auth Schemas ───────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=200)
    password: str = Field(..., min_length=6, max_length=100)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)


# ─────────────────── Resume Schemas ───────────────────

class PersonalInfo(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None

class Education(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None
    gpa: Optional[str] = None
    description: Optional[str] = None

class Skill(BaseModel):
    category: str
    items: List[str]

class Project(BaseModel):
    name: str
    description: str
    technologies: Optional[List[str]] = None
    link: Optional[str] = None

class Certification(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    link: Optional[str] = None

class Internship(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    description: Optional[str] = None
    bullets: Optional[List[str]] = None

class Achievement(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None

class Experience(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    description: Optional[str] = None
    bullets: Optional[List[str]] = None

class ResumeCreate(BaseModel):
    title: str = "My Resume"
    personal_info: Optional[PersonalInfo] = None
    education: Optional[List[Education]] = None
    skills: Optional[List[Skill]] = None
    projects: Optional[List[Project]] = None
    certifications: Optional[List[Certification]] = None
    internships: Optional[List[Internship]] = None
    achievements: Optional[List[Achievement]] = None
    experience: Optional[List[Experience]] = None
    target_job_role: Optional[str] = None
    preferred_company: Optional[str] = None

class ResumeUpdate(ResumeCreate):
    pass

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    personal_info: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    internships: Optional[List[Dict[str, Any]]] = None
    achievements: Optional[List[Dict[str, Any]]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    target_job_role: Optional[str] = None
    preferred_company: Optional[str] = None
    generated_content: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── Cover Letter Schemas ───────────────────

class CoverLetterCreate(BaseModel):
    title: str
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    tone: str = "professional"  # formal / confident / professional

class CoverLetterResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    tone: str
    generated_content: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── Portfolio Schemas ───────────────────

class PortfolioCreate(BaseModel):
    title: str = "My Portfolio"
    template: str = "modern"  # modern / minimal / creative

class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template: str
    generated_html: Optional[str] = None
    generated_css: Optional[str] = None
    is_published: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── Job Description Schemas ───────────────────

class JobDescriptionCreate(BaseModel):
    title: str
    company: Optional[str] = None
    description: str

class JobDescriptionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company: Optional[str] = None
    description: str
    required_skills: Optional[List[str]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── Resume Score Schemas ───────────────────

class ResumeScoreRequest(BaseModel):
    resume_id: int
    job_description: str

class ResumeScoreResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float
    keyword_match_score: Optional[float] = None
    format_score: Optional[float] = None
    content_score: Optional[float] = None
    missing_keywords: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None
    detailed_analysis: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── Skill Analysis Schemas ───────────────────

class SkillAnalysisRequest(BaseModel):
    job_role: str
    job_description: str
    user_skills: List[str]

class SkillAnalysisResponse(BaseModel):
    id: int
    job_role: str
    required_skills: Optional[List[str]] = None
    user_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    match_percentage: Optional[float] = None
    recommendations: Optional[List[str]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────── AI Generation Schemas ───────────────────

class AIResumeGenerateRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = None

class AICoverLetterGenerateRequest(BaseModel):
    cover_letter_id: int
    resume_id: int

class AIPortfolioGenerateRequest(BaseModel):
    resume_id: int
    template: str = "modern"

class AIGenerationResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


# ─────────────────── Admin Schemas ───────────────────

class AdminDashboardResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_cover_letters: int
    total_portfolios: int
    total_scores: int
    most_requested_roles: Optional[List[Dict[str, Any]]] = None
    recent_users: Optional[List[UserResponse]] = None
