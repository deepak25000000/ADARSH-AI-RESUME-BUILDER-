"""
Skill Gap Analysis Engine.
Extracts required skills from job descriptions using NLP,
compares with user skills, and recommends missing skills.
"""

import re
from typing import Dict, Any, List, Optional

# Comprehensive skill dictionary for extraction
TECH_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
    "swift", "kotlin", "php", "scala", "r", "matlab", "perl", "dart", "lua",
    # Web Frameworks
    "react", "reactjs", "angular", "vue", "vuejs", "nextjs", "django", "flask",
    "fastapi", "express", "nodejs", "spring", "rails", "laravel", "svelte",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "dynamodb",
    "cassandra", "sqlite", "oracle", "firebase", "supabase",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform",
    "ansible", "ci/cd", "linux", "git", "github", "gitlab",
    # AI/ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "nlp", "computer vision", "opencv", "scikit-learn", "pandas", "numpy",
    "neural networks", "transformers", "huggingface", "openai",
    # Data
    "data analysis", "data science", "big data", "hadoop", "spark", "tableau",
    "power bi", "etl", "data engineering", "data visualization",
    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",
    # Tools & Concepts
    "agile", "scrum", "rest api", "graphql", "microservices", "api",
    "html", "css", "tailwind", "bootstrap", "sass", "webpack",
    "testing", "junit", "pytest", "selenium", "cypress",
    "security", "blockchain", "iot", "embedded systems",
}


def extract_skills_from_text(text: str) -> List[str]:
    """Extract technical skills from text using pattern matching."""
    text_lower = text.lower()
    found_skills = []

    for skill in TECH_SKILLS:
        # Use word boundary matching for accuracy
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.append(skill)

    # Also extract capitalized skill mentions (e.g., AWS, GCP, SQL)
    words = re.findall(r'\b[A-Z][A-Za-z\+\#]+\b', text)
    for word in words:
        if word.lower() in TECH_SKILLS and word.lower() not in found_skills:
            found_skills.append(word.lower())

    return sorted(set(found_skills))


def normalize_skill(skill: str) -> str:
    """Normalize skill name for comparison."""
    skill = skill.lower().strip()
    # Common aliases
    aliases = {
        "js": "javascript",
        "ts": "typescript",
        "py": "python",
        "react.js": "react",
        "reactjs": "react",
        "node.js": "nodejs",
        "vue.js": "vue",
        "vuejs": "vue",
        "next.js": "nextjs",
        "c sharp": "c#",
        "cpp": "c++",
        "postgres": "postgresql",
        "mongo": "mongodb",
        "k8s": "kubernetes",
        "ml": "machine learning",
        "dl": "deep learning",
        "ai": "artificial intelligence",
    }
    return aliases.get(skill, skill)


def analyze_skill_gap(
    job_description: str,
    user_skills: List[str],
    job_role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Perform skill gap analysis between job description and user skills.
    Returns required skills, missing skills, match percentage, and recommendations.
    """
    # Extract required skills from job description
    required_skills = extract_skills_from_text(job_description)

    # Normalize user skills
    normalized_user_skills = [normalize_skill(s) for s in user_skills]
    user_skill_set = set(normalized_user_skills)

    # Find matching and missing skills
    matching_skills = [s for s in required_skills if normalize_skill(s) in user_skill_set]
    missing_skills = [s for s in required_skills if normalize_skill(s) not in user_skill_set]

    # Calculate match percentage
    if required_skills:
        match_percentage = round((len(matching_skills) / len(required_skills)) * 100, 1)
    else:
        match_percentage = 100.0 if user_skills else 0.0

    # Generate recommendations
    recommendations = []
    if missing_skills:
        # Prioritize missing skills
        high_priority = missing_skills[:5]
        recommendations.append(f"Focus on learning: {', '.join(high_priority)}")

        # Suggest learning resources
        for skill in high_priority[:3]:
            recommendations.append(f"📚 Learn {skill}: Try online courses on Coursera, Udemy, or official documentation")

    if match_percentage >= 80:
        recommendations.append("✅ Strong skill match! Focus on showcasing these skills with concrete projects.")
    elif match_percentage >= 50:
        recommendations.append("⚡ Good foundation! Bridge the gap by working on projects using the missing skills.")
    else:
        recommendations.append("🎯 Significant skill gap detected. Consider building projects with the required technologies.")

    if not required_skills:
        recommendations.append("No specific technical skills were detected in the job description. "
                               "Try providing a more detailed job description.")

    return {
        "job_role": job_role or "General",
        "required_skills": required_skills,
        "user_skills": user_skills,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
        "recommendations": recommendations,
    }
