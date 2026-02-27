"""
Cover Letter routes: create, list, get, delete.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, CoverLetter
from app.schemas.schemas import CoverLetterCreate, CoverLetterResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/cover-letters", tags=["Cover Letters"])


@router.post("/", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
def create_cover_letter(
    data: CoverLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new cover letter entry."""
    cover_letter = CoverLetter(
        user_id=current_user.id,
        title=data.title,
        company_name=data.company_name,
        job_title=data.job_title,
        job_description=data.job_description,
        tone=data.tone,
    )
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)
    return cover_letter


@router.get("/", response_model=List[CoverLetterResponse])
def get_all_cover_letters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all cover letters for the current user."""
    return db.query(CoverLetter).filter(
        CoverLetter.user_id == current_user.id
    ).order_by(CoverLetter.updated_at.desc()).all()


@router.get("/{cover_letter_id}", response_model=CoverLetterResponse)
def get_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific cover letter."""
    cl = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id, CoverLetter.user_id == current_user.id
    ).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return cl


@router.delete("/{cover_letter_id}")
def delete_cover_letter(
    cover_letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a cover letter."""
    cl = db.query(CoverLetter).filter(
        CoverLetter.id == cover_letter_id, CoverLetter.user_id == current_user.id
    ).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    db.delete(cl)
    db.commit()
    return {"message": "Cover letter deleted successfully"}
