"""
Resume CRUD routes: create, read, update, delete resumes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, Resume
from app.schemas.schemas import ResumeCreate, ResumeUpdate, ResumeResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])


@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def create_resume(
    data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new resume."""
    resume = Resume(
        user_id=current_user.id,
        title=data.title,
        personal_info=data.personal_info.model_dump() if data.personal_info else None,
        education=[e.model_dump() for e in data.education] if data.education else None,
        skills=[s.model_dump() for s in data.skills] if data.skills else None,
        projects=[p.model_dump() for p in data.projects] if data.projects else None,
        certifications=[c.model_dump() for c in data.certifications] if data.certifications else None,
        internships=[i.model_dump() for i in data.internships] if data.internships else None,
        achievements=[a.model_dump() for a in data.achievements] if data.achievements else None,
        experience=[e.model_dump() for e in data.experience] if data.experience else None,
        target_job_role=data.target_job_role,
        preferred_company=data.preferred_company,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/", response_model=List[ResumeResponse])
def get_all_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all resumes for the current user."""
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.updated_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific resume by ID."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int,
    data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.title = data.title
    resume.personal_info = data.personal_info.model_dump() if data.personal_info else resume.personal_info
    resume.education = [e.model_dump() for e in data.education] if data.education else resume.education
    resume.skills = [s.model_dump() for s in data.skills] if data.skills else resume.skills
    resume.projects = [p.model_dump() for p in data.projects] if data.projects else resume.projects
    resume.certifications = [c.model_dump() for c in data.certifications] if data.certifications else resume.certifications
    resume.internships = [i.model_dump() for i in data.internships] if data.internships else resume.internships
    resume.achievements = [a.model_dump() for a in data.achievements] if data.achievements else resume.achievements
    resume.experience = [e.model_dump() for e in data.experience] if data.experience else resume.experience
    resume.target_job_role = data.target_job_role or resume.target_job_role
    resume.preferred_company = data.preferred_company or resume.preferred_company

    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}
