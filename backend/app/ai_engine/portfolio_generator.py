"""
AI Portfolio Website Generator.
Auto-generates professional HTML/CSS portfolio from resume data.
"""

from typing import Dict, Any


def generate_portfolio(resume_data: Dict[str, Any], template: str = "modern") -> Dict[str, Any]:
    """Generate complete HTML/CSS portfolio website."""
    personal = resume_data.get("personal_info", {}) or {}
    name = personal.get("name", "Your Name")
    email = personal.get("email", "")
    phone = personal.get("phone", "")
    linkedin = personal.get("linkedin", "")
    github = personal.get("github", "")
    role = resume_data.get("target_job_role", "Software Developer")

    colors = _get_colors(template)
    skills_html = _build_skills(resume_data.get("skills") or [])
    projects_html = _build_projects(resume_data.get("projects") or [])
    exp_html = _build_experience(resume_data.get("experience") or [], resume_data.get("internships") or [])
    edu_html = _build_education(resume_data.get("education") or [])

    html = _build_html(name, email, phone, linkedin, github, role, colors, skills_html, projects_html, exp_html, edu_html)

    return {"success": True, "generated_html": html, "generated_css": "", "template": template}


def _get_colors(template):
    t = {
        "modern": {"bg":"#f8fafc","text":"#1e293b","primary":"#6366f1","card":"#fff","tag":"#eef2ff","nav":"rgba(255,255,255,0.9)","hero":"linear-gradient(135deg,#667eea,#764ba2)","hero_t":"#fff"},
        "minimal": {"bg":"#fff","text":"#333","primary":"#111","card":"#fafafa","tag":"#f0f0f0","nav":"rgba(255,255,255,0.95)","hero":"#111","hero_t":"#fff"},
        "creative": {"bg":"#0f172a","text":"#e2e8f0","primary":"#38bdf8","card":"#1e293b","tag":"#0c4a6e","nav":"rgba(15,23,42,0.9)","hero":"linear-gradient(135deg,#0ea5e9,#8b5cf6,#ec4899)","hero_t":"#fff"},
    }
    return t.get(template, t["modern"])


def _build_skills(skills):
    h = ""
    for s in skills:
        if isinstance(s, dict):
            tags = "".join(f'<span class="tag">{i}</span>' for i in s.get("items", []))
            h += f'<div class="skill-card"><h3>{s.get("category","")}</h3><div class="tags">{tags}</div></div>'
    return h or '<p style="text-align:center;opacity:.6">Add skills to display here</p>'


def _build_projects(projects):
    h = ""
    for p in projects:
        if isinstance(p, dict):
            techs = ", ".join(p.get("technologies", []))
            h += f'<div class="project-card"><h3>{p.get("name","")}</h3><p>{p.get("description","")}</p><span class="tech">{techs}</span></div>'
    return h or '<p style="text-align:center;opacity:.6">Add projects to display here</p>'


def _build_experience(exp, intern):
    h = ""
    for e in exp + intern:
        if isinstance(e, dict):
            bullets = "".join(f"<li>{b}</li>" for b in (e.get("bullets") or []))
            ul = f"<ul>{bullets}</ul>" if bullets else ""
            h += f'<div class="tl-item"><h3>{e.get("role","")}</h3><div class="co">{e.get("company","")}</div><div class="dur">{e.get("duration","")}</div><p>{e.get("description","")}</p>{ul}</div>'
    return h or '<p style="text-align:center;opacity:.6">Add experience to display here</p>'


def _build_education(edu):
    h = ""
    for e in edu:
        if isinstance(e, dict):
            gpa = f"<p>GPA: {e['gpa']}</p>" if e.get("gpa") else ""
            h += f'<div class="tl-item"><h3>{e.get("degree","")}</h3><div class="co">{e.get("institution","")}</div><div class="dur">{e.get("year","")}</div>{gpa}</div>'
    return h or '<p style="text-align:center;opacity:.6">Add education to display here</p>'


def _build_html(name, email, phone, linkedin, github, role, c, skills, projects, exp, edu):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{name} - Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',sans-serif;background:{c['bg']};color:{c['text']};line-height:1.7}}
nav{{position:fixed;top:0;width:100%;z-index:100;background:{c['nav']};backdrop-filter:blur(10px);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 20px rgba(0,0,0,.1)}}
nav .logo{{font-size:1.5rem;font-weight:700;color:{c['primary']}}}
nav ul{{list-style:none;display:flex;gap:2rem}}
nav a{{text-decoration:none;color:{c['text']};font-weight:500;transition:color .3s}}
nav a:hover{{color:{c['primary']}}}
.hero{{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:{c['hero']};padding:6rem 2rem}}
.hero h1{{font-size:3.5rem;font-weight:700;color:{c['hero_t']};margin-bottom:1rem}}
.hero p{{font-size:1.3rem;color:{c['hero_t']};opacity:.85;max-width:600px;margin:0 auto}}
.hero .cta{{display:inline-block;margin-top:2rem;padding:.8rem 2rem;background:{c['primary']};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;transition:transform .3s}}
.hero .cta:hover{{transform:translateY(-2px)}}
section{{padding:5rem 2rem;max-width:1100px;margin:0 auto}}
section h2{{font-size:2.2rem;font-weight:700;margin-bottom:2rem;color:{c['primary']};text-align:center}}
.skills-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem}}
.skill-card{{background:{c['card']};border-radius:12px;padding:1.5rem;box-shadow:0 4px 15px rgba(0,0,0,.08);transition:transform .3s}}
.skill-card:hover{{transform:translateY(-5px)}}
.skill-card h3{{color:{c['primary']};margin-bottom:.8rem}}
.tags{{display:flex;flex-wrap:wrap;gap:.5rem}}
.tag{{background:{c['tag']};color:{c['primary']};padding:.3rem .8rem;border-radius:20px;font-size:.85rem;font-weight:500}}
.projects-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:2rem}}
.project-card{{background:{c['card']};border-radius:12px;padding:2rem;box-shadow:0 4px 15px rgba(0,0,0,.08);transition:transform .3s;border-left:4px solid {c['primary']}}}
.project-card:hover{{transform:translateY(-5px)}}
.project-card h3{{margin-bottom:.5rem}}
.project-card p{{opacity:.8;margin-bottom:1rem}}
.tech{{font-size:.85rem;color:{c['primary']};font-weight:500}}
.tl-item{{padding:1.5rem 2rem;margin-bottom:1.5rem;background:{c['card']};border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,.08);border-left:4px solid {c['primary']}}}
.tl-item h3{{color:{c['primary']}}}
.co{{font-weight:600;opacity:.9}}
.dur{{font-size:.85rem;opacity:.6}}
.contact{{text-align:center;padding:4rem 2rem;background:{c['hero']};color:{c['hero_t']}}}
.contact-links{{display:flex;justify-content:center;gap:2rem;margin-top:2rem;flex-wrap:wrap}}
.contact-links a{{color:{c['hero_t']};text-decoration:none;padding:.6rem 1.5rem;border:2px solid {c['hero_t']};border-radius:8px;transition:all .3s}}
.contact-links a:hover{{background:{c['hero_t']};color:#333}}
footer{{text-align:center;padding:2rem;opacity:.6;font-size:.85rem}}
@media(max-width:768px){{.hero h1{{font-size:2.2rem}}nav ul{{gap:1rem}}section{{padding:3rem 1rem}}}}
</style>
</head>
<body>
<nav><div class="logo">{name.split()[0]}</div><ul><li><a href="#about">About</a></li><li><a href="#skills">Skills</a></li><li><a href="#projects">Projects</a></li><li><a href="#experience">Experience</a></li><li><a href="#contact">Contact</a></li></ul></nav>
<section class="hero" id="about"><div><h1>{name}</h1><p>{role} passionate about building innovative solutions</p><a href="#contact" class="cta">Get In Touch</a></div></section>
<section id="skills"><h2>Skills</h2><div class="skills-grid">{skills}</div></section>
<section id="projects"><h2>Projects</h2><div class="projects-grid">{projects}</div></section>
<section id="experience"><h2>Experience</h2><div class="timeline">{exp}</div></section>
<section id="education"><h2>Education</h2><div class="timeline">{edu}</div></section>
<section class="contact" id="contact"><h2 style="color:inherit">Let's Connect</h2><p>Feel free to reach out!</p><div class="contact-links">{'<a href="mailto:'+email+'">Email</a>' if email else ''}{'<a href="'+linkedin+'" target="_blank">LinkedIn</a>' if linkedin else ''}{'<a href="'+github+'" target="_blank">GitHub</a>' if github else ''}{'<a href="tel:'+phone+'">Phone</a>' if phone else ''}</div></section>
<footer><p>&copy; 2024 {name}. Built with AI Resume Builder.</p></footer>
<script>
document.querySelectorAll('a[href^="#"]').forEach(a=>{{a.addEventListener('click',function(e){{e.preventDefault();document.querySelector(this.getAttribute('href')).scrollIntoView({{behavior:'smooth'}})}});}});
</script>
</body></html>"""
