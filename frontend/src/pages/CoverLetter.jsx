/**
 * Cover Letter Generator — tone selection, AI generation, history.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { coverLetterAPI, resumeAPI, aiAPI } from '../services/api';
import { Card, Button, EmptyState, useToast } from '../components/ui';
import { Mail, Sparkles, Clock, Copy, Trash2 } from 'lucide-react';

export default function CoverLetter() {
    const toast = useToast();
    const [resumes, setResumes] = useState([]);
    const [letters, setLetters] = useState([]);
    const [form, setForm] = useState({ title: '', company_name: '', job_title: '', job_description: '', tone: 'professional' });
    const [selectedResume, setSelectedResume] = useState('');
    const [generated, setGenerated] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        resumeAPI.getAll().then(r => setResumes(r.data)).catch(() => { });
        coverLetterAPI.getAll().then(r => setLetters(r.data)).catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!selectedResume) { toast.warning('Select a resume first'); return; }
        if (!form.company_name || !form.job_title) { toast.warning('Enter company name and job title'); return; }
        setLoading(true);
        try {
            const cl = await coverLetterAPI.create(form);
            const result = await aiAPI.generateCoverLetter({ cover_letter_id: cl.data.id, resume_id: parseInt(selectedResume) });
            setGenerated(result.data.data?.generated_content || '');
            setLetters(prev => [cl.data, ...prev]);
            toast.success('Cover letter generated!');
        } catch (e) { toast.error(e.response?.data?.detail || 'Generation failed'); }
        finally { setLoading(false); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generated);
        toast.success('Copied to clipboard!');
    };

    const handleDelete = async (id) => {
        try {
            await coverLetterAPI.delete(id);
            setLetters(prev => prev.filter(l => l.id !== id));
            toast.success('Deleted');
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Cover Letter Generator</h1>
                <p className="page-subtitle">Create personalized, company-specific cover letters with AI</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: Form */}
                <Card>
                    <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <label className="input-label">Cover Letter Title</label>
                            <input className="input-field" placeholder="e.g. Google SDE Application" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="input-label">Company Name *</label>
                                <input className="input-field" placeholder="Google" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Job Title *</label>
                                <input className="input-field" placeholder="Software Engineer" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Job Description (optional)</label>
                            <textarea className="input-field" placeholder="Paste job description..." rows={4} value={form.job_description} onChange={e => setForm({ ...form, job_description: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label className="input-label">Tone</label>
                                <select className="input-field" value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}>
                                    <option value="professional">Professional</option>
                                    <option value="formal">Formal</option>
                                    <option value="confident">Confident</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Resume *</label>
                                <select className="input-field" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                                    <option value="">Select resume...</option>
                                    {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <Button icon={Sparkles} loading={loading} onClick={handleGenerate} style={{ width: '100%' }}>
                            {loading ? 'Generating...' : 'Generate Cover Letter'}
                        </Button>
                    </div>
                </Card>

                {/* Right: Output + History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {generated ? (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Generated Cover Letter</h3>
                                    <Button variant="ghost" size="sm" icon={Copy} onClick={handleCopy}>Copy</Button>
                                </div>
                                <pre style={{ fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{generated}</pre>
                            </Card>
                        </motion.div>
                    ) : (
                        <Card>
                            <EmptyState icon={Mail} title="No cover letter yet" description="Fill in the details and generate a personalized cover letter." />
                        </Card>
                    )}

                    {letters.length > 0 && (
                        <Card>
                            <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>History</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {letters.slice(0, 5).map(l => (
                                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderRadius: 8, background: 'var(--bg-secondary)', cursor: 'pointer' }}
                                        onClick={() => setGenerated(l.generated_content || '')}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                            <div>
                                                <p style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{l.title || l.company_name}</p>
                                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{l.company_name} · {l.job_title}</p>
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
