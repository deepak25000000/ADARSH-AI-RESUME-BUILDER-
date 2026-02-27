/**
 * Resume Builder — multi-step form with stepper, live preview, AI generation.
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeAPI, aiAPI } from '../services/api';
import { Card, Button, EmptyState, Spinner, useToast } from '../components/ui';
import { User, GraduationCap, Code, Briefcase, Award, FolderOpen, ChevronLeft, ChevronRight, Sparkles, Download, Save, Check } from 'lucide-react';

const STEPS = [
    { icon: User, label: 'Personal' },
    { icon: GraduationCap, label: 'Education' },
    { icon: Code, label: 'Skills' },
    { icon: Briefcase, label: 'Experience' },
    { icon: FolderOpen, label: 'Projects' },
    { icon: Award, label: 'More' },
];

const blank = {
    title: 'My Resume', target_job_role: '', preferred_company: '',
    personal_info: { name: '', email: '', phone: '', linkedin: '', github: '', location: '' },
    education: [{ degree: '', institution: '', year: '', gpa: '' }],
    skills: [{ category: '', items: [] }],
    experience: [{ company: '', role: '', duration: '', bullets: [] }],
    projects: [{ name: '', description: '', technologies: [], link: '' }],
    internships: [{ company: '', role: '', duration: '', description: '' }],
    certifications: [{ name: '', issuer: '', date: '' }],
    achievements: [{ title: '', description: '' }],
};

// ─── Stable components defined OUTSIDE the main component ───
function Field({ label, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="input-label">{label}</label>
            <input className="input-field" {...props} />
        </div>
    );
}

function TextArea({ label, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="input-label">{label}</label>
            <textarea className="input-field" {...props} />
        </div>
    );
}

function SectionHeader({ title, onAdd, addLabel = '+ Add' }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{title}</h3>
            {onAdd && <button onClick={onAdd} className="btn btn-ghost btn-sm">{addLabel}</button>}
        </div>
    );
}

function Preview({ form }) {
    const p = form.personal_info || {};
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', lineHeight: 1.5, color: '#1e293b', padding: '1.5rem', background: 'white', borderRadius: 8, minHeight: 400, border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px solid #4f46e5', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{p.name || 'Your Name'}</h2>
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2 }}>
                    {[p.email, p.phone, p.location].filter(Boolean).join(' • ')}
                </p>
                {(p.linkedin || p.github) && (
                    <p style={{ fontSize: '0.6875rem', color: '#4f46e5', marginTop: 2 }}>
                        {[p.linkedin, p.github].filter(Boolean).join(' | ')}
                    </p>
                )}
            </div>

            {form.education?.some(e => e.degree) && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 2, marginBottom: 4 }}>EDUCATION</h3>
                    {form.education.filter(e => e.degree).map((e, i) => (
                        <div key={i}><strong>{e.degree}</strong> — {e.institution} ({e.year}) {e.gpa && <span style={{ color: '#64748b' }}>| GPA: {e.gpa}</span>}</div>
                    ))}
                </div>
            )}

            {form.skills?.some(s => s.category) && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 2, marginBottom: 4 }}>SKILLS</h3>
                    {form.skills.filter(s => s.category).map((s, i) => (
                        <div key={i}><strong>{s.category}:</strong> {Array.isArray(s.items) ? s.items.join(', ') : s.items}</div>
                    ))}
                </div>
            )}

            {form.experience?.some(e => e.company) && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 2, marginBottom: 4 }}>EXPERIENCE</h3>
                    {form.experience.filter(e => e.company).map((e, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                            <strong>{e.role}</strong> — {e.company} <span style={{ color: '#64748b' }}>({e.duration})</span>
                            {(Array.isArray(e.bullets) ? e.bullets : (e.bullets || '').split('\n')).filter(Boolean).map((b, j) => (
                                <div key={j} style={{ paddingLeft: '1rem' }}>• {b}</div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {form.projects?.some(p => p.name) && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 2, marginBottom: 4 }}>PROJECTS</h3>
                    {form.projects.filter(p => p.name).map((p, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                            <strong>{p.name}</strong> {p.technologies?.length > 0 && <span style={{ color: '#64748b' }}>| {Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</span>}
                            {p.description && <div style={{ paddingLeft: '1rem' }}>• {p.description}</div>}
                        </div>
                    ))}
                </div>
            )}

            {form.certifications?.some(c => c.name) && (
                <div>
                    <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', borderBottom: '1px solid #e2e8f0', paddingBottom: 2, marginBottom: 4 }}>CERTIFICATIONS</h3>
                    {form.certifications.filter(c => c.name).map((c, i) => (
                        <div key={i}>• {c.name} — {c.issuer} ({c.date})</div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Step Content Components (stable, outside main component) ───

function StepPersonal({ form, setForm, updatePersonal }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <Field label="Resume Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Field label="Target Job Role" value={form.target_job_role} onChange={e => setForm(f => ({ ...f, target_job_role: e.target.value }))} />
                <Field label="Preferred Company" value={form.preferred_company} onChange={e => setForm(f => ({ ...f, preferred_company: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name', 'Full Name'], ['email', 'Email'], ['phone', 'Phone'], ['location', 'Location'], ['linkedin', 'LinkedIn URL'], ['github', 'GitHub URL']].map(([k, l]) => (
                    <Field key={k} label={l} value={form.personal_info?.[k] || ''} onChange={e => updatePersonal(k, e.target.value)} />
                ))}
            </div>
        </div>
    );
}

function StepEducation({ form, updateArr, addItem, removeItem }) {
    return (
        <div>
            <SectionHeader title="Education" onAdd={() => addItem('education', { degree: '', institution: '', year: '', gpa: '' })} />
            {form.education?.map((edu, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.5fr 0.5fr', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'end' }}>
                    <Field label="Degree" value={edu.degree} onChange={e => updateArr('education', i, 'degree', e.target.value)} />
                    <Field label="Institution" value={edu.institution} onChange={e => updateArr('education', i, 'institution', e.target.value)} />
                    <Field label="Year" value={edu.year} onChange={e => updateArr('education', i, 'year', e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                        <Field label="GPA" value={edu.gpa} onChange={e => updateArr('education', i, 'gpa', e.target.value)} />
                        {form.education.length > 1 && <button onClick={() => removeItem('education', i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginBottom: 2 }}>✕</button>}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StepSkills({ form, updateArr, addItem, removeItem }) {
    return (
        <div>
            <SectionHeader title="Technical Skills" onAdd={() => addItem('skills', { category: '', items: [] })} />
            {form.skills?.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.3fr 1fr auto', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'end' }}>
                    <Field label="Category" value={s.category} onChange={e => updateArr('skills', i, 'category', e.target.value)} placeholder="e.g. Languages" />
                    <Field label="Skills (comma-separated)" value={Array.isArray(s.items) ? s.items.join(', ') : s.items} onChange={e => updateArr('skills', i, 'items', e.target.value)} placeholder="Python, JavaScript, SQL" />
                    {form.skills.length > 1 && <button onClick={() => removeItem('skills', i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>✕</button>}
                </div>
            ))}
        </div>
    );
}

function StepExperience({ form, updateArr, addItem, removeItem }) {
    return (
        <div>
            <SectionHeader title="Experience & Internships" />
            <p className="input-label" style={{ marginBottom: '0.75rem' }}>Work Experience</p>
            {form.experience?.map((e, i) => (
                <Card key={i} style={{ marginBottom: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Field label="Company" value={e.company} onChange={ev => updateArr('experience', i, 'company', ev.target.value)} />
                        <Field label="Role" value={e.role} onChange={ev => updateArr('experience', i, 'role', ev.target.value)} />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                            <Field label="Duration" value={e.duration} onChange={ev => updateArr('experience', i, 'duration', ev.target.value)} />
                            {form.experience.length > 1 && <button onClick={() => removeItem('experience', i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginBottom: 2 }}>✕</button>}
                        </div>
                    </div>
                    <TextArea label="Bullet Points (one per line)" rows={3} value={Array.isArray(e.bullets) ? e.bullets.join('\n') : e.bullets || ''} onChange={ev => updateArr('experience', i, 'bullets', ev.target.value)} />
                </Card>
            ))}
            <button onClick={() => addItem('experience', { company: '', role: '', duration: '', bullets: [] })} className="btn btn-ghost btn-sm">+ Add Experience</button>

            <p className="input-label" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Internships</p>
            {form.internships?.map((intern, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                    <Field label="Company" value={intern.company} onChange={e => updateArr('internships', i, 'company', e.target.value)} />
                    <Field label="Role" value={intern.role} onChange={e => updateArr('internships', i, 'role', e.target.value)} />
                    <Field label="Duration" value={intern.duration} onChange={e => updateArr('internships', i, 'duration', e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                        <Field label="Description" value={intern.description} onChange={e => updateArr('internships', i, 'description', e.target.value)} />
                        {form.internships.length > 1 && <button onClick={() => removeItem('internships', i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginBottom: 2 }}>✕</button>}
                    </div>
                </div>
            ))}
            <button onClick={() => addItem('internships', { company: '', role: '', duration: '', description: '' })} className="btn btn-ghost btn-sm">+ Add Internship</button>
        </div>
    );
}

function StepProjects({ form, updateArr, addItem, removeItem }) {
    return (
        <div>
            <SectionHeader title="Projects" onAdd={() => addItem('projects', { name: '', description: '', technologies: [], link: '' })} />
            {form.projects?.map((p, i) => (
                <Card key={i} style={{ marginBottom: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Field label="Project Name" value={p.name} onChange={e => updateArr('projects', i, 'name', e.target.value)} />
                        <Field label="Technologies (comma-separated)" value={Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || ''} onChange={e => updateArr('projects', i, 'technologies', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <Field label="Link" value={p.link} onChange={e => updateArr('projects', i, 'link', e.target.value)} />
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                            <Field label="Description" value={p.description} onChange={e => updateArr('projects', i, 'description', e.target.value)} />
                            {form.projects.length > 1 && <button onClick={() => removeItem('projects', i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', marginBottom: 2 }}>✕</button>}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function StepMore({ form, updateArr, addItem }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
                <SectionHeader title="Certifications" onAdd={() => addItem('certifications', { name: '', issuer: '', date: '' })} />
                {form.certifications?.map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Field label="Name" value={c.name} onChange={e => updateArr('certifications', i, 'name', e.target.value)} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <Field label="Issuer" value={c.issuer} onChange={e => updateArr('certifications', i, 'issuer', e.target.value)} />
                            <Field label="Date" value={c.date} onChange={e => updateArr('certifications', i, 'date', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <SectionHeader title="Achievements" onAdd={() => addItem('achievements', { title: '', description: '' })} />
                {form.achievements?.map((a, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Field label="Title" value={a.title} onChange={e => updateArr('achievements', i, 'title', e.target.value)} />
                        <Field label="Description" value={a.description} onChange={e => updateArr('achievements', i, 'description', e.target.value)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Component ───

export default function ResumeBuilder() {
    const toast = useToast();
    const [step, setStep] = useState(0);
    const [resumes, setResumes] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [form, setForm] = useState({ ...blank });
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [jd, setJd] = useState('');

    useEffect(() => {
        resumeAPI.getAll().then(r => setResumes(r.data)).catch(() => { });
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) loadResume(id);
    }, []);

    const loadResume = async (id) => {
        try {
            const r = await resumeAPI.getById(id);
            const d = r.data;
            setForm({
                ...blank, ...d,
                personal_info: d.personal_info || blank.personal_info,
                education: d.education?.length ? d.education : blank.education,
                skills: d.skills?.length ? d.skills : blank.skills,
                experience: d.experience?.length ? d.experience : blank.experience,
                projects: d.projects?.length ? d.projects : blank.projects,
                internships: d.internships?.length ? d.internships : blank.internships,
                certifications: d.certifications?.length ? d.certifications : blank.certifications,
                achievements: d.achievements?.length ? d.achievements : blank.achievements,
            });
            setActiveId(d.id);
            setGeneratedContent(d.generated_content || '');
        } catch { toast.error('Failed to load resume'); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                skills: form.skills.map(s => ({ ...s, items: Array.isArray(s.items) ? s.items : s.items.split(',').map(i => i.trim()).filter(Boolean) })),
                projects: form.projects.map(p => ({ ...p, technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies || '').split(',').map(i => i.trim()).filter(Boolean) })),
                experience: form.experience.map(e => ({ ...e, bullets: Array.isArray(e.bullets) ? e.bullets : (e.bullets || '').split('\n').filter(Boolean) })),
            };
            if (activeId) {
                await resumeAPI.update(activeId, payload);
                toast.success('Resume updated!');
            } else {
                const r = await resumeAPI.create(payload);
                setActiveId(r.data.id);
                setResumes(prev => [r.data, ...prev]);
                toast.success('Resume created!');
            }
        } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleGenerate = async () => {
        if (!activeId) { toast.warning('Save your resume first'); return; }
        setGenerating(true);
        try {
            const r = await aiAPI.generateResume({ resume_id: activeId, job_description: jd || null });
            setGeneratedContent(r.data.data?.generated_content || '');
            toast.success('Resume generated with AI!');
        } catch (e) { toast.error('Generation failed'); }
        finally { setGenerating(false); }
    };

    const handleDownloadPDF = async () => {
        if (!activeId) return;
        try {
            const r = await aiAPI.downloadPDF(activeId);
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const a = document.createElement('a'); a.href = url;
            a.download = `${form.personal_info?.name || 'resume'}_resume.pdf`;
            a.click(); window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded!');
        } catch { toast.error('PDF download failed'); }
    };

    const updatePersonal = (k, v) => setForm(f => ({ ...f, personal_info: { ...f.personal_info, [k]: v } }));
    const updateArr = (sec, idx, k, v) => setForm(f => { const a = [...(f[sec] || [])]; a[idx] = { ...a[idx], [k]: v }; return { ...f, [sec]: a }; });
    const addItem = (sec, tpl) => setForm(f => ({ ...f, [sec]: [...(f[sec] || []), tpl] }));
    const removeItem = (sec, idx) => setForm(f => ({ ...f, [sec]: f[sec].filter((_, i) => i !== idx) }));

    // Render step content using stable components
    const renderStep = () => {
        switch (step) {
            case 0: return <StepPersonal form={form} setForm={setForm} updatePersonal={updatePersonal} />;
            case 1: return <StepEducation form={form} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />;
            case 2: return <StepSkills form={form} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />;
            case 3: return <StepExperience form={form} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />;
            case 4: return <StepProjects form={form} updateArr={updateArr} addItem={addItem} removeItem={removeItem} />;
            case 5: return <StepMore form={form} updateArr={updateArr} addItem={addItem} />;
            default: return null;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">Resume Builder</h1>
                    <p className="page-subtitle">Build a professional ATS-optimized resume</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {resumes.length > 0 && (
                        <select className="input-field" style={{ width: 'auto', minWidth: 160 }} value={activeId || ''} onChange={e => e.target.value ? loadResume(e.target.value) : (setActiveId(null), setForm({ ...blank }), setGeneratedContent(''))}>
                            <option value="">+ New Resume</option>
                            {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                        </select>
                    )}
                    <Button icon={Save} loading={saving} onClick={handleSave}>{activeId ? 'Update' : 'Save'}</Button>
                </div>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {STEPS.map((s, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                        <div className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
                            <div className="step-circle">
                                {i < step ? <Check size={14} /> : <s.icon size={14} />}
                            </div>
                            <span className="step-label">{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'completed' : ''}`} />}
                    </div>
                ))}
            </div>

            {/* Content: Split view */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: Form */}
                <Card>
                    {renderStep()}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <Button variant="secondary" icon={ChevronLeft} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                            Back
                        </Button>
                        {step < STEPS.length - 1 ? (
                            <Button icon={ChevronRight} onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}>
                                Next
                            </Button>
                        ) : (
                            <Button icon={Save} loading={saving} onClick={handleSave}>
                                {activeId ? 'Update Resume' : 'Save Resume'}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Right: Live Preview */}
                <div style={{ position: 'sticky', top: 72 }}>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Live Preview</span>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                {activeId && <Button variant="ghost" size="sm" icon={Download} onClick={handleDownloadPDF}>PDF</Button>}
                            </div>
                        </div>
                        <div style={{ maxHeight: 'calc(100vh - 220px)', overflow: 'auto', padding: '0.5rem' }}>
                            <Preview form={form} />
                        </div>
                    </Card>

                    {/* AI Generation */}
                    {activeId && (
                        <Card style={{ marginTop: '0.75rem' }}>
                            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>AI Generation</h4>
                            <textarea className="input-field" placeholder="Paste job description for AI optimization (optional)" rows={3} value={jd} onChange={e => setJd(e.target.value)} style={{ marginBottom: '0.5rem' }} />
                            <Button icon={Sparkles} loading={generating} onClick={handleGenerate} className="w-full" style={{ width: '100%' }}>
                                {generating ? 'Generating...' : 'Generate with AI'}
                            </Button>
                        </Card>
                    )}
                    {generatedContent && (
                        <Card style={{ marginTop: '0.75rem' }}>
                            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>AI Generated Content</h4>
                            <pre style={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>{generatedContent}</pre>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
