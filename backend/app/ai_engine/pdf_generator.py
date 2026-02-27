"""
PDF Export functionality using ReportLab.
Generates professional PDF resumes from resume data.
"""

import io
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, mm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


def generate_resume_pdf(resume_data: Dict[str, Any]) -> bytes:
    """Generate a professional PDF resume. Returns PDF as bytes."""
    if not REPORTLAB_AVAILABLE:
        raise ImportError("ReportLab is required for PDF generation. Install with: pip install reportlab")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch,
                           leftMargin=0.6*inch, rightMargin=0.6*inch)

    styles = getSampleStyleSheet()
    primary = HexColor("#1e3a5f")
    accent = HexColor("#2563eb")

    # Custom styles
    name_style = ParagraphStyle('Name', parent=styles['Title'], fontSize=22, textColor=primary,
                                 spaceAfter=4, alignment=TA_CENTER, fontName='Helvetica-Bold')
    contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER,
                                    textColor=HexColor("#555555"), spaceAfter=12)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=13, textColor=primary,
                                    spaceBefore=14, spaceAfter=6, fontName='Helvetica-Bold',
                                    borderWidth=0, borderPadding=0)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14,
                                 spaceAfter=4, fontName='Helvetica')
    bullet_style = ParagraphStyle('Bullet', parent=body_style, leftIndent=15, bulletIndent=5,
                                   bulletFontSize=8)

    elements = []
    personal = resume_data.get("personal_info", {}) or {}
    name = personal.get("name", "Your Name")
    contact_parts = [p for p in [personal.get("email"), personal.get("phone"),
                                  personal.get("location"), personal.get("linkedin"),
                                  personal.get("github")] if p]

    elements.append(Paragraph(name, name_style))
    if contact_parts:
        elements.append(Paragraph(" | ".join(contact_parts), contact_style))
    elements.append(Spacer(1, 4))

    # Summary
    role = resume_data.get("target_job_role", "Professional")
    skills_flat = []
    for sg in (resume_data.get("skills") or []):
        if isinstance(sg, dict):
            skills_flat.extend(sg.get("items", []))
    top_skills = ", ".join(skills_flat[:5]) if skills_flat else "various technologies"
    summary = f"Results-driven {role} with expertise in {top_skills}. Committed to delivering high-quality solutions."
    elements.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
    elements.append(Paragraph(summary, body_style))

    # Education
    education = resume_data.get("education") or []
    if education:
        elements.append(Paragraph("EDUCATION", heading_style))
        for edu in education:
            if isinstance(edu, dict):
                text = f"<b>{edu.get('degree','')}</b> — {edu.get('institution','')} ({edu.get('year','')})"
                if edu.get("gpa"):
                    text += f" | GPA: {edu['gpa']}"
                elements.append(Paragraph(text, body_style))

    # Skills
    skills = resume_data.get("skills") or []
    if skills:
        elements.append(Paragraph("TECHNICAL SKILLS", heading_style))
        for sg in skills:
            if isinstance(sg, dict):
                cat = sg.get("category", "General")
                items = ", ".join(sg.get("items", []))
                elements.append(Paragraph(f"<b>{cat}:</b> {items}", body_style))

    # Experience
    exp = resume_data.get("experience") or []
    if exp:
        elements.append(Paragraph("EXPERIENCE", heading_style))
        for e in exp:
            if isinstance(e, dict):
                elements.append(Paragraph(f"<b>{e.get('role','')}</b> — {e.get('company','')} ({e.get('duration','')})", body_style))
                for b in (e.get("bullets") or []):
                    elements.append(Paragraph(f"• {b}", bullet_style))

    # Internships
    internships = resume_data.get("internships") or []
    if internships:
        elements.append(Paragraph("INTERNSHIPS", heading_style))
        for i in internships:
            if isinstance(i, dict):
                elements.append(Paragraph(f"<b>{i.get('role','')}</b> — {i.get('company','')} ({i.get('duration','')})", body_style))
                if i.get("description"):
                    elements.append(Paragraph(f"• {i['description']}", bullet_style))

    # Projects
    projects = resume_data.get("projects") or []
    if projects:
        elements.append(Paragraph("PROJECTS", heading_style))
        for p in projects:
            if isinstance(p, dict):
                techs = ", ".join(p.get("technologies", []))
                elements.append(Paragraph(f"<b>{p.get('name','')}</b>{' — ' + techs if techs else ''}", body_style))
                if p.get("description"):
                    elements.append(Paragraph(f"• {p['description']}", bullet_style))

    # Certifications
    certs = resume_data.get("certifications") or []
    if certs:
        elements.append(Paragraph("CERTIFICATIONS", heading_style))
        for c in certs:
            if isinstance(c, dict):
                elements.append(Paragraph(f"• {c.get('name','')} — {c.get('issuer','')} ({c.get('date','')})", body_style))

    # Achievements
    achievements = resume_data.get("achievements") or []
    if achievements:
        elements.append(Paragraph("ACHIEVEMENTS", heading_style))
        for a in achievements:
            if isinstance(a, dict):
                elements.append(Paragraph(f"• {a.get('title','')} — {a.get('description','')}", body_style))

    doc.build(elements)
    return buffer.getvalue()
