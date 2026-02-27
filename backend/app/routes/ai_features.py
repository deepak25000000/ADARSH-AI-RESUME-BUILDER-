"""
AI Feature routes: resume generation, cover letter, scoring, skill analysis, portfolio, PDF export.
These endpoints tie the AI engine to the API layer.
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Resume, CoverLetter, Portfolio, ResumeScore, SkillAnalysis
from app.schemas.schemas import (
    AIResumeGenerateRequest, AICoverLetterGenerateRequest, AIPortfolioGenerateRequest,
    AIGenerationResponse, ResumeScoreRequest, ResumeScoreResponse,
    SkillAnalysisRequest, SkillAnalysisResponse
)
from app.utils.auth import get_current_user
from app.ai_engine.resume_generator import generate_resume_with_ai
from app.ai_engine.cover_letter_generator import generate_cover_letter
from app.ai_engine.resume_scorer import analyze_resume_score
from app.ai_engine.skill_analyzer import analyze_skill_gap
from app.ai_engine.portfolio_generator import generate_portfolio
from app.ai_engine.pdf_generator import generate_resume_pdf

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


@router.post("/generate-resume", response_model=AIGenerationResponse)
def ai_generate_resume(
    req: AIResumeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an ATS-optimized resume using AI."""
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = {
        "personal_info": resume.personal_info,
        "education": resume.education,
        "skills": resume.skills,
        "projects": resume.projects,
        "experience": resume.experience,
        "internships": resume.internships,
        "certifications": resume.certifications,
        "achievements": resume.achievements,
        "target_job_role": resume.target_job_role,
    }

    result = generate_resume_with_ai(resume_data, req.job_description)

    if result.get("success"):
        resume.generated_content = result["generated_content"]
        db.commit()

    return AIGenerationResponse(success=result["success"], message="Resume generated successfully", data=result)


@router.post("/generate-cover-letter", response_model=AIGenerationResponse)
def ai_generate_cover_letter(
    req: AICoverLetterGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized cover letter."""
    cl = db.query(CoverLetter).filter(CoverLetter.id == req.cover_letter_id, CoverLetter.user_id == current_user.id).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")

    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = {
        "personal_info": resume.personal_info,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "education": resume.education,
        "internships": resume.internships,
    }

    result = generate_cover_letter(resume_data, cl.company_name, cl.job_title, cl.job_description, cl.tone)

    if result.get("success"):
        cl.generated_content = result["generated_content"]
        db.commit()

    return AIGenerationResponse(success=result["success"], message="Cover letter generated", data=result)


@router.post("/score-resume", response_model=ResumeScoreResponse)
def ai_score_resume(
    req: ResumeScoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Score a resume against a job description."""
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = {
        "personal_info": resume.personal_info,
        "education": resume.education,
        "skills": resume.skills,
        "projects": resume.projects,
        "experience": resume.experience,
        "internships": resume.internships,
        "certifications": resume.certifications,
        "achievements": resume.achievements,
        "generated_content": resume.generated_content,
        "target_job_role": resume.target_job_role,
    }

    result = analyze_resume_score(resume_data, req.job_description)

    score = ResumeScore(
        user_id=current_user.id,
        resume_id=resume.id,
        overall_score=result["overall_score"],
        keyword_match_score=result["keyword_match_score"],
        format_score=result["format_score"],
        content_score=result["content_score"],
        missing_keywords=result["missing_keywords"],
        suggestions=result["suggestions"],
        detailed_analysis=result["detailed_analysis"],
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return score


@router.post("/skill-analysis", response_model=SkillAnalysisResponse)
def ai_skill_analysis(
    req: SkillAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze skill gaps between user skills and job requirements."""
    result = analyze_skill_gap(req.job_description, req.user_skills, req.job_role)

    analysis = SkillAnalysis(
        user_id=current_user.id,
        job_role=result["job_role"],
        required_skills=result["required_skills"],
        user_skills=result["user_skills"],
        missing_skills=result["missing_skills"],
        match_percentage=result["match_percentage"],
        recommendations=result["recommendations"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.post("/generate-portfolio", response_model=AIGenerationResponse)
def ai_generate_portfolio(
    req: AIPortfolioGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a portfolio website from resume data."""
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = {
        "personal_info": resume.personal_info,
        "skills": resume.skills,
        "projects": resume.projects,
        "experience": resume.experience,
        "internships": resume.internships,
        "education": resume.education,
        "certifications": resume.certifications,
        "target_job_role": resume.target_job_role,
    }

    result = generate_portfolio(resume_data, req.template)

    if result.get("success"):
        portfolio = Portfolio(
            user_id=current_user.id,
            title=f"{(resume.personal_info or {}).get('name', 'My')} Portfolio",
            template=req.template,
            generated_html=result["generated_html"],
            generated_css=result.get("generated_css", ""),
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        result["portfolio_id"] = portfolio.id

    return AIGenerationResponse(success=True, message="Portfolio generated", data=result)


@router.get("/download-pdf/{resume_id}")
def download_resume_pdf(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download resume as PDF."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_data = {
        "personal_info": resume.personal_info,
        "education": resume.education,
        "skills": resume.skills,
        "projects": resume.projects,
        "experience": resume.experience,
        "internships": resume.internships,
        "certifications": resume.certifications,
        "achievements": resume.achievements,
        "target_job_role": resume.target_job_role,
    }

    try:
        pdf_bytes = generate_resume_pdf(resume_data)
        name = (resume.personal_info or {}).get("name", "resume").replace(" ", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={name}_resume.pdf"}
        )
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))
