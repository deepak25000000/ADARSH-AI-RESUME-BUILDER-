/**
 * Portfolio Generator — template selection, live preview, download.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { resumeAPI, aiAPI, portfolioAPI } from '../services/api';
import { Card, Button, EmptyState, useToast } from '../components/ui';
import { Globe, Sparkles, Download, Trash2, Eye, Layout, Palette, Zap } from 'lucide-react';

const templates = [
    { id: 'modern', label: 'Modern', desc: 'Clean and professional', icon: Layout, color: '#4f46e5' },
    { id: 'minimal', label: 'Minimal', desc: 'Simple and elegant', icon: Zap, color: '#10b981' },
    { id: 'creative', label: 'Creative', desc: 'Bold and colorful', icon: Palette, color: '#f59e0b' },
];

export default function PortfolioPage() {
    const toast = useToast();
    const [resumes, setResumes] = useState([]);
    const [portfolios, setPortfolios] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [template, setTemplate] = useState('modern');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        resumeAPI.getAll().then(r => setResumes(r.data)).catch(() => { });
        portfolioAPI.getAll().then(r => setPortfolios(r.data)).catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!selectedResume) { toast.warning('Select a resume first'); return; }
        setLoading(true);
        try {
            const r = await aiAPI.generatePortfolio({ resume_id: parseInt(selectedResume), template });
            setGeneratedHtml(r.data.data?.generated_html || '');
            toast.success('Portfolio generated!');
            portfolioAPI.getAll().then(r => setPortfolios(r.data)).catch(() => { });
        } catch (e) { toast.error('Generation failed'); }
        finally { setLoading(false); }
    };

    const handleDownload = () => {
        if (!generatedHtml) return;
        const blob = new Blob([generatedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'portfolio.html'; a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded!');
    };

    const handleDelete = async (id) => {
        try {
            await portfolioAPI.delete(id);
            setPortfolios(prev => prev.filter(p => p.id !== id));
            toast.success('Deleted');
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Portfolio Generator</h1>
                <p className="page-subtitle">Auto-generate a stunning portfolio website from your resume data</p>
            </div>

            {/* Controls */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label className="input-label">Resume</label>
                        <select className="input-field" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                            <option value="">Select resume...</option>
                            {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Template</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {templates.map(t => (
                                <button key={t.id} onClick={() => setTemplate(t.id)}
                                    style={{
                                        flex: 1, padding: '0.5rem', borderRadius: 8, border: `2px solid ${template === t.id ? t.color : 'var(--border)'}`,
                                        background: template === t.id ? `${t.color}10` : 'transparent', cursor: 'pointer', textAlign: 'center',
                                        transition: 'all 0.15s',
                                    }}>
                                    <t.icon size={16} style={{ color: t.color, margin: '0 auto 0.25rem' }} />
                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)' }}>{t.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button icon={Sparkles} loading={loading} onClick={handleGenerate}>Generate</Button>
                    {generatedHtml && <Button variant="secondary" icon={Download} onClick={handleDownload}>Download</Button>}
                </div>
            </Card>

            {/* Preview */}
            {generatedHtml ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Eye size={16} style={{ color: 'var(--primary)' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Live Preview</span>
                        </div>
                        <iframe srcDoc={generatedHtml} style={{ width: '100%', height: 600, border: 'none' }} title="Portfolio Preview" />
                    </Card>
                </motion.div>
            ) : (
                <Card>
                    <EmptyState icon={Globe} title="No portfolio yet" description="Select a resume and template to generate your portfolio website." />
                </Card>
            )}

            {/* Previous Portfolios */}
            {portfolios.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Previous Portfolios</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                        {portfolios.map(p => (
                            <Card key={p.id} hover style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div onClick={() => setGeneratedHtml(p.generated_html || '')}>
                                        <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Template: {p.template} · {new Date(p.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
