"""
AI Cover Letter Generator.
Uses HuggingFace Inference API (FREE) with fallback to rule-based generation.
Generates personalized, company-specific cover letters with tone selection.
"""

import os
import requests
from typing import Dict, Any, Optional

# HuggingFace Inference API endpoint
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"

TONE_INSTRUCTIONS = {
    "formal": "Use a very formal and respectful tone. Be traditional and courteous.",
    "confident": "Use a confident and assertive tone. Highlight strengths boldly.",
    "professional": "Use a balanced professional tone. Be polished yet approachable.",
}


def get_hf_headers() -> Optional[Dict[str, str]]:
    """Get HuggingFace API headers if API key is available."""
    api_key = os.getenv("HUGGINGFACE_API_KEY", "")
    if api_key and api_key != "your-huggingface-api-key-here":
        return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    return None


def query_huggingface(prompt: str, max_tokens: int = 1000) -> Optional[str]:
    """Send a prompt to HuggingFace Inference API."""
    headers = get_hf_headers()
    if not headers:
        return None

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


def generate_cover_letter(
    resume_data: Dict[str, Any],
    company_name: str,
    job_title: str,
    job_description: Optional[str] = None,
    tone: str = "professional",
) -> Dict[str, Any]:
    """Generate a personalized cover letter."""
    personal = resume_data.get("personal_info", {})
    if not isinstance(personal, dict):
        personal = {}
    name = personal.get("name", "Candidate")
    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["professional"])

    prompt = f"""Write a cover letter for {name} applying to {company_name} for the {job_title} position.

Candidate Details:
- Skills: {resume_data.get('skills', [])}
- Experience: {resume_data.get('experience', [])}
- Projects: {resume_data.get('projects', [])}
- Education: {resume_data.get('education', [])}

{f'Job Description: {job_description}' if job_description else ''}

Tone: {tone_instruction}

Requirements:
1. Personalize for {company_name}
2. Match skills to job requirements
3. Show enthusiasm for the role
4. Keep it concise (3-4 paragraphs)
5. Include a strong opening and closing
"""

    # Try HuggingFace API
    ai_result = query_huggingface(prompt)
    if ai_result:
        return {
            "success": True,
            "generated_content": ai_result.strip(),
            "method": "huggingface",
        }

    # Fallback to rule-based
    return _generate_rule_based(resume_data, company_name, job_title, job_description, tone)


def _generate_rule_based(
    resume_data: Dict[str, Any],
    company_name: str,
    job_title: str,
    job_description: Optional[str],
    tone: str,
) -> Dict[str, Any]:
    """Generate cover letter using rule-based approach."""
    personal = resume_data.get("personal_info", {})
    if not isinstance(personal, dict):
        personal = {}
    name = personal.get("name", "Your Name")
    email = personal.get("email", "your.email@example.com")
    phone = personal.get("phone", "")

    # Extract skills
    skills_flat = []
    for skill_group in (resume_data.get("skills") or []):
        if isinstance(skill_group, dict):
            skills_flat.extend(skill_group.get("items", []))
    top_skills = ", ".join(skills_flat[:5]) if skills_flat else "relevant technical skills"

    # Extract recent experience
    experience = resume_data.get("experience") or resume_data.get("internships") or []
    if experience and isinstance(experience[0], dict):
        recent_exp = f"my experience as {experience[0].get('role', 'a professional')} at {experience[0].get('company', 'a leading company')}"
    else:
        recent_exp = "my academic projects and technical training"

    # Get education
    education = resume_data.get("education") or []
    edu_text = ""
    if education and isinstance(education[0], dict):
        edu_text = f"{education[0].get('degree', '')} from {education[0].get('institution', '')}"

    # Tone-based content
    if tone == "formal":
        greeting = "Dear Hiring Manager,"
        opening = f"I respectfully submit my application for the position of {job_title} at {company_name}."
        closing = "I would be deeply grateful for the opportunity to contribute to your esteemed organization."
        sign_off = "Yours sincerely,"
    elif tone == "confident":
        greeting = "Dear Hiring Team,"
        opening = f"I'm excited to apply for the {job_title} role at {company_name}, and I'm confident I'm the right fit."
        closing = "I'm eager to bring my skills and passion to your team and make an immediate impact."
        sign_off = "Best regards,"
    else:
        greeting = "Dear Hiring Manager,"
        opening = f"I am writing to express my interest in the {job_title} position at {company_name}."
        closing = "I look forward to the opportunity to discuss how I can contribute to your team's success."
        sign_off = "Sincerely,"

    letter = f"""{name}
{email}
{f'{phone}' if phone else ''}

{greeting}

{opening} With {recent_exp} and proficiency in {top_skills}, I am well-positioned to contribute meaningfully to your team.

{f'Having completed my {edu_text}, I have' if edu_text else 'I have'} developed a strong foundation in the skills required for this role. My technical projects have given me hands-on experience in building real-world solutions, and I am eager to apply this knowledge in a professional setting at {company_name}.

Throughout my academic and professional journey, I have demonstrated strong problem-solving abilities, attention to detail, and a commitment to delivering high-quality work. I am particularly drawn to {company_name}'s innovative approach and would welcome the chance to be part of your team.

{closing}

{sign_off}
{name}"""

    return {
        "success": True,
        "generated_content": letter,
        "method": "rule_based",
    }
