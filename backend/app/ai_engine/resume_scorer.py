"""
Resume Score Analyzer.
Uses TF-IDF and cosine similarity to compare resumes with job descriptions.
Provides percentage score, missing keywords, and improvement suggestions.
"""

import re
import math
from typing import Dict, Any, List, Optional
from collections import Counter


def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercase words, removing punctuation."""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s\+\#]', ' ', text)
    words = text.split()
    # Remove common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
        'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
        'she', 'it', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
        'not', 'no', 'nor', 'as', 'if', 'then', 'else', 'when', 'up', 'out',
        'about', 'into', 'over', 'after', 'before', 'between', 'under',
        'again', 'further', 'than', 'once', 'here', 'there', 'all', 'each',
        'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
        'only', 'own', 'same', 'so', 'very', 'just', 'because', 'also',
    }
    return [w for w in words if w not in stop_words and len(w) > 1]


def compute_tf(tokens: List[str]) -> Dict[str, float]:
    """Compute Term Frequency."""
    count = Counter(tokens)
    total = len(tokens) if tokens else 1
    return {word: freq / total for word, freq in count.items()}


def compute_idf(doc1_tokens: List[str], doc2_tokens: List[str]) -> Dict[str, float]:
    """Compute Inverse Document Frequency for two documents."""
    all_words = set(doc1_tokens) | set(doc2_tokens)
    idf = {}
    docs = [set(doc1_tokens), set(doc2_tokens)]
    n_docs = len(docs)
    for word in all_words:
        df = sum(1 for doc in docs if word in doc)
        idf[word] = math.log((n_docs + 1) / (df + 1)) + 1
    return idf


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Compute cosine similarity between two TF-IDF vectors."""
    all_terms = set(vec1.keys()) | set(vec2.keys())
    dot_product = sum(vec1.get(t, 0) * vec2.get(t, 0) for t in all_terms)
    mag1 = math.sqrt(sum(v ** 2 for v in vec1.values())) or 1
    mag2 = math.sqrt(sum(v ** 2 for v in vec2.values())) or 1
    return dot_product / (mag1 * mag2)


def extract_resume_text(resume_data: Dict[str, Any]) -> str:
    """Extract all text from resume data into a single string."""
    parts = []

    personal = resume_data.get("personal_info", {})
    if isinstance(personal, dict):
        parts.append(personal.get("name", ""))

    for section in ["education", "skills", "projects", "experience", "internships", "certifications", "achievements"]:
        items = resume_data.get(section) or []
        for item in items:
            if isinstance(item, dict):
                for value in item.values():
                    if isinstance(value, str):
                        parts.append(value)
                    elif isinstance(value, list):
                        parts.extend([str(v) for v in value])

    if resume_data.get("target_job_role"):
        parts.append(resume_data["target_job_role"])
    if resume_data.get("generated_content"):
        parts.append(resume_data["generated_content"])

    return " ".join(parts)


def analyze_resume_score(
    resume_data: Dict[str, Any],
    job_description: str,
) -> Dict[str, Any]:
    """
    Analyze resume against job description using TF-IDF cosine similarity.
    Returns overall score, missing keywords, and suggestions.
    """
    resume_text = extract_resume_text(resume_data)
    resume_tokens = tokenize(resume_text)
    jd_tokens = tokenize(job_description)

    if not resume_tokens or not jd_tokens:
        return {
            "overall_score": 0.0,
            "keyword_match_score": 0.0,
            "format_score": 50.0,
            "content_score": 0.0,
            "missing_keywords": [],
            "suggestions": ["Please provide more details in your resume."],
            "detailed_analysis": "Insufficient data to analyze.",
        }

    # Compute TF-IDF vectors
    idf = compute_idf(resume_tokens, jd_tokens)
    resume_tf = compute_tf(resume_tokens)
    jd_tf = compute_tf(jd_tokens)

    resume_tfidf = {word: tf * idf.get(word, 1) for word, tf in resume_tf.items()}
    jd_tfidf = {word: tf * idf.get(word, 1) for word, tf in jd_tf.items()}

    # Cosine similarity score
    similarity = cosine_similarity(resume_tfidf, jd_tfidf)
    keyword_score = round(similarity * 100, 1)

    # Find missing keywords (important JD terms not in resume)
    jd_important = sorted(jd_tf.items(), key=lambda x: x[1], reverse=True)[:30]
    resume_word_set = set(resume_tokens)
    missing_keywords = [word for word, _ in jd_important if word not in resume_word_set][:15]

    # Format score (based on resume completeness)
    sections_present = 0
    total_sections = 7
    for section in ["education", "skills", "projects", "experience", "internships", "certifications", "achievements"]:
        if resume_data.get(section):
            sections_present += 1
    format_score = round((sections_present / total_sections) * 100, 1)

    # Content score (based on detail level)
    content_score = min(100, round(len(resume_tokens) / 2, 1))

    # Overall weighted score
    overall_score = round(
        keyword_score * 0.50 +
        format_score * 0.25 +
        content_score * 0.25,
        1
    )
    overall_score = min(100, overall_score)

    # Generate suggestions
    suggestions = []
    if keyword_score < 50:
        suggestions.append("Add more relevant keywords from the job description to your resume.")
    if missing_keywords:
        suggestions.append(f"Consider adding these keywords: {', '.join(missing_keywords[:5])}")
    if format_score < 70:
        suggestions.append("Add more sections to your resume (projects, certifications, achievements).")
    if content_score < 50:
        suggestions.append("Add more detail and bullet points to your experience and projects.")
    if not resume_data.get("experience") and not resume_data.get("internships"):
        suggestions.append("Add work experience or internships to strengthen your resume.")
    if not suggestions:
        suggestions.append("Great resume! Consider tailoring it further for each specific job application.")

    detailed_analysis = f"""Resume Score Analysis
{'=' * 40}
Overall Score: {overall_score}%
Keyword Match: {keyword_score}%
Format Score: {format_score}%
Content Depth: {content_score}%

Missing Keywords: {', '.join(missing_keywords[:10]) if missing_keywords else 'None - good coverage!'}

Suggestions:
{chr(10).join(f'  • {s}' for s in suggestions)}
"""

    return {
        "overall_score": overall_score,
        "keyword_match_score": keyword_score,
        "format_score": format_score,
        "content_score": content_score,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions,
        "detailed_analysis": detailed_analysis,
    }
