"""
Admin dashboard routes: analytics and system management.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.models import User, Resume, CoverLetter, Portfolio, ResumeScore
from app.schemas.schemas import AdminDashboardResponse, UserResponse
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get admin dashboard analytics."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_cover_letters = db.query(func.count(CoverLetter.id)).scalar() or 0
    total_portfolios = db.query(func.count(Portfolio.id)).scalar() or 0
    total_scores = db.query(func.count(ResumeScore.id)).scalar() or 0

    # Most requested job roles
    role_counts = (
        db.query(Resume.target_job_role, func.count(Resume.id).label("count"))
        .filter(Resume.target_job_role.isnot(None))
        .group_by(Resume.target_job_role)
        .order_by(func.count(Resume.id).desc())
        .limit(10)
        .all()
    )
    most_requested_roles = [
        {"role": role, "count": count} for role, count in role_counts
    ]

    # Recent users
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()

    return AdminDashboardResponse(
        total_users=total_users,
        total_resumes=total_resumes,
        total_cover_letters=total_cover_letters,
        total_portfolios=total_portfolios,
        total_scores=total_scores,
        most_requested_roles=most_requested_roles,
        recent_users=recent_users,
    )


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get all users (admin only)."""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully"}
