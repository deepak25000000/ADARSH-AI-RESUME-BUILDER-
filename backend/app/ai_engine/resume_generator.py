"""
AI Resume Generator Engine.
Uses HuggingFace Inference API (FREE) with fallback to rule-based generation.
Generates ATS-friendly resumes with optimized keywords and action verbs.
"""

import os
import json
import requests
from typing import Dict, Any, Optional, List

# HuggingFace Inference API endpoint (free tier, no expiry)
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

# Professional action verbs for resume bullet points
ACTION_VERBS = {
    "technical": ["Developed", "Engineered", "Implemented", "Architected", "Designed",
                  "Built", "Deployed", "Automated", "Optimized", "Integrated",
                  "Programmed", "Configured", "Debugged", "Refactored", "Maintained"],
    "leadership": ["Led", "Directed", "Managed", "Coordinated", "Supervised",
                   "Mentored", "Guided", "Spearheaded", "Orchestrated", "Oversaw"],
    "analytical": ["Analyzed", "Evaluated", "Assessed", "Researched", "Investigated",
                   "Identified", "Diagnosed", "Measured", "Quantified", "Forecasted"],
    "communication": ["Presented", "Communicated", "Collaborated", "Documented",
                      "Published", "Authored", "Facilitated", "Negotiated", "Persuaded"],
    "achievement": ["Achieved", "Delivered", "Exceeded", "Improved", "Increased",
                    "Reduced", "Streamlined", "Accelerated", "Transformed", "Pioneered"],
}


def get_hf_headers() -> Optional[Dict[str, str]]:
    """Get HuggingFace API headers if API key is available."""
    api_key = os.getenv("HUGGINGFACE_API_KEY", "")
    if api_key and api_key != "your-huggingface-api-key-here":
        return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    return None


def query_huggingface(prompt: str, max_tokens: int = 1500) -> Optional[str]:
    """Send a prompt to HuggingFace Inference API and return the response."""
    headers = get_hf_headers()
    if not headers:
        return None

    # Format as instruction for Mistral
    formatted_prompt = f"<s>[INST] {prompt} [/INST]"

    payload = {
        "inputs": formatted_prompt,
        "parameters": {
            "max_new_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False,
        }
    }

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "")
        return None
    except Exception:
        return None


def enhance_bullet_point(bullet: str) -> str:
    """Enhance a bullet point with action verbs and professional language."""
    bullet = bullet.strip()
    if not bullet:
        return bullet

    first_word = bullet.split()[0] if bullet.split() else ""
    all_verbs = [v for verbs in ACTION_VERBS.values() for v in verbs]

    if first_word not in all_verbs:
        lower_bullet = bullet.lower()
        if any(w in lower_bullet for w in ["code", "program", "develop", "build", "software", "app"]):
            bullet = f"Developed {bullet[0].lower()}{bullet[1:]}"
        elif any(w in lower_bullet for w in ["team", "lead", "manage", "group"]):
            bullet = f"Led {bullet[0].lower()}{bullet[1:]}"
        elif any(w in lower_bullet for w in ["research", "study", "analyze", "data"]):
            bullet = f"Analyzed {bullet[0].lower()}{bullet[1:]}"
        else:
            bullet = f"Achieved {bullet[0].lower()}{bullet[1:]}"

    return bullet


def generate_resume_with_ai(resume_data: Dict[str, Any], job_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate an ATS-friendly resume using HuggingFace AI or rule-based approach.
    """
    personal = resume_data.get("personal_info", {})
    name = personal.get("name", "Candidate") if isinstance(personal, dict) else "Candidate"

    prompt = f"""Generate a professional, ATS-friendly resume for {name}.

Resume Data:
- Education: {resume_data.get('education', [])}
- Skills: {resume_data.get('skills', [])}
- Projects: {resume_data.get('projects', [])}
- Experience: {resume_data.get('experience', [])}
- Internships: {resume_data.get('internships', [])}
- Certifications: {resume_data.get('certifications', [])}
- Achievements: {resume_data.get('achievements', [])}
- Target Role: {resume_data.get('target_job_role', 'Software Engineer')}
"""
    if job_description:
        prompt += f"\nOptimize for this job description:\n{job_description}\n"

    prompt += """
Requirements:
1. Use strong action verbs (Developed, Led, Achieved, Implemented)
2. Include quantifiable results where possible
3. Optimize keywords for ATS systems
4. Use professional formatting with clear sections
5. Sections: PROFESSIONAL SUMMARY, EDUCATION, SKILLS, EXPERIENCE, PROJECTS, CERTIFICATIONS, ACHIEVEMENTS
"""

    # Try HuggingFace API first
    ai_result = query_huggingface(prompt)
    if ai_result:
        return {
            "success": True,
            "generated_content": ai_result.strip(),
            "method": "huggingface",
            "keywords_optimized": True,
        }

    # Fallback to rule-based
    return _generate_rule_based(resume_data, job_description)


def _generate_rule_based(resume_data: Dict[str, Any], job_description: Optional[str]) -> Dict[str, Any]:
    """Generate resume content using rule-based approach."""
    personal = resume_data.get("personal_info", {})
    if not isinstance(personal, dict):
        personal = {}
    name = personal.get("name", "Your Name")
    email = personal.get("email", "")
    phone = personal.get("phone", "")
    linkedin = personal.get("linkedin", "")
    github = personal.get("github", "")
    location = personal.get("location", "")

    lines = []
    lines.append(f"{'=' * 60}")
    lines.append(f"{name.upper()}")
    contact_parts = [p for p in [email, phone, location, linkedin, github] if p]
    lines.append(" | ".join(contact_parts))
    lines.append(f"{'=' * 60}")

    # Professional Summary
    target_role = resume_data.get("target_job_role", "Software Professional")
    skills_flat = []
    for skill_group in (resume_data.get("skills") or []):
        if isinstance(skill_group, dict):
            skills_flat.extend(skill_group.get("items", []))
    top_skills = ", ".join(skills_flat[:5]) if skills_flat else "various technologies"

    lines.append(f"\nPROFESSIONAL SUMMARY")
    lines.append("-" * 40)
    lines.append(f"Results-driven {target_role} with expertise in {top_skills}. "
                 f"Proven track record of delivering high-quality solutions and contributing to team success. "
                 f"Seeking opportunities to leverage technical skills and drive innovation.")

    # Education
    education = resume_data.get("education") or []
    if education:
        lines.append(f"\nEDUCATION")
        lines.append("-" * 40)
        for edu in education:
            if isinstance(edu, dict):
                lines.append(f"  {edu.get('degree', '')} — {edu.get('institution', '')} ({edu.get('year', '')})")
                if edu.get("gpa"):
                    lines.append(f"  GPA: {edu['gpa']}")

    # Skills
    skills = resume_data.get("skills") or []
    if skills:
        lines.append(f"\nTECHNICAL SKILLS")
        lines.append("-" * 40)
        for sg in skills:
            if isinstance(sg, dict):
                lines.append(f"  {sg.get('category', 'General')}: {', '.join(sg.get('items', []))}")

    # Experience
    experience = resume_data.get("experience") or []
    if experience:
        lines.append(f"\nPROFESSIONAL EXPERIENCE")
        lines.append("-" * 40)
        for exp in experience:
            if isinstance(exp, dict):
                lines.append(f"  {exp.get('role', '')} — {exp.get('company', '')} ({exp.get('duration', '')})")
                for bullet in (exp.get("bullets") or []):
                    lines.append(f"    • {enhance_bullet_point(bullet)}")

    # Internships
    internships = resume_data.get("internships") or []
    if internships:
        lines.append(f"\nINTERNSHIPS")
        lines.append("-" * 40)
        for intern in internships:
            if isinstance(intern, dict):
                lines.append(f"  {intern.get('role', '')} — {intern.get('company', '')} ({intern.get('duration', '')})")
                if intern.get("description"):
                    lines.append(f"    • {enhance_bullet_point(intern['description'])}")

    # Projects
    projects = resume_data.get("projects") or []
    if projects:
        lines.append(f"\nPROJECTS")
        lines.append("-" * 40)
        for proj in projects:
            if isinstance(proj, dict):
                lines.append(f"  {proj.get('name', '')}")
                if proj.get("description"):
                    lines.append(f"    • {enhance_bullet_point(proj['description'])}")
                techs = proj.get("technologies", [])
                if techs:
                    lines.append(f"    Technologies: {', '.join(techs)}")

    # Certifications
    certs = resume_data.get("certifications") or []
    if certs:
        lines.append(f"\nCERTIFICATIONS")
        lines.append("-" * 40)
        for cert in certs:
            if isinstance(cert, dict):
                lines.append(f"  • {cert.get('name', '')} — {cert.get('issuer', '')} ({cert.get('date', '')})")

    # Achievements
    achievements = resume_data.get("achievements") or []
    if achievements:
        lines.append(f"\nACHIEVEMENTS")
        lines.append("-" * 40)
        for ach in achievements:
            if isinstance(ach, dict):
                lines.append(f"  • {ach.get('title', '')} — {ach.get('description', '')}")

    return {
        "success": True,
        "generated_content": "\n".join(lines),
        "method": "rule_based",
        "keywords_optimized": job_description is not None,
    }
