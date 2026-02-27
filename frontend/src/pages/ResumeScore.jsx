/**
 * Resume Score Analyzer — circular progress, keyword analysis, suggestions.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { resumeAPI, aiAPI } from '../services/api';
import { Card, Button, ScoreRing, EmptyState, Badge, useToast } from '../components/ui';
import { BarChart3, Search, CheckCircle, XCircle, Lightbulb, AlertTriangle } from 'lucide-react';

export default function ResumeScore() {
    const toast = useToast();
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [jd, setJd] = useState('');
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { resumeAPI.getAll().then(r => setResumes(r.data)).catch(() => { }); }, []);

    const handleAnalyze = async () => {
        if (!selectedResume || !jd.trim()) { toast.warning('Select a resume and enter a job description'); return; }
        setLoading(true);
        try {
            const r = await aiAPI.scoreResume({ resume_id: parseInt(selectedResume), job_description: jd });
            setScore(r.data);
            toast.success('Analysis complete!');
        } catch (e) { toast.error('Analysis failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Resume Score Analyzer</h1>
                <p className="page-subtitle">Analyze your resume against job descriptions using TF-IDF cosine similarity</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: Input */}
                <Card>
                    <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Analyze Your Resume</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <label className="input-label">Select Resume</label>
                            <select className="input-field" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                                <option value="">Choose a resume...</option>
                                {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Job Description</label>
                            <textarea className="input-field" placeholder="Paste the job description here..." rows={10} value={jd} onChange={e => setJd(e.target.value)} />
                        </div>
                        <Button icon={Search} loading={loading} onClick={handleAnalyze} style={{ width: '100%' }}>
                            {loading ? 'Analyzing...' : 'Analyze Score'}
                        </Button>
                    </div>
                </Card>

                {/* Right: Results */}
                <div>
                    {score ? (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Overall Score */}
                            <Card style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <ScoreRing score={score.overall_score} size={140} strokeWidth={10} />
                                    <p style={{ fontWeight: 600, marginTop: '0.75rem' }}>Overall Score</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                        {score.overall_score >= 75 ? 'Excellent match!' : score.overall_score >= 50 ? 'Good, needs improvement' : 'Needs significant work'}
                                    </p>
                                </div>
                            </Card>

                            {/* Sub Scores */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    ['Keyword Match', score.keyword_match_score, '#4f46e5'],
                                    ['Format', score.format_score, '#10b981'],
                                    ['Content', score.content_score, '#f59e0b'],
                                ].map(([label, val, color]) => (
                                    <Card key={label} style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{Math.round(val)}%</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</p>
                                    </Card>
                                ))}
                            </div>

                            {/* Missing Keywords */}
                            {score.missing_keywords?.length > 0 && (
                                <Card>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
                                        <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Missing Keywords</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {score.missing_keywords.map((k, i) => (
                                            <Badge key={i} variant="warning">{k}</Badge>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Suggestions */}
                            {score.suggestions?.length > 0 && (
                                <Card>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Lightbulb size={16} style={{ color: 'var(--success)' }} />
                                        <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Improvement Suggestions</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {score.suggestions.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                <CheckCircle size={14} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    ) : (
                        <Card>
                            <EmptyState
                                icon={BarChart3}
                                title="No analysis yet"
                                description="Select a resume and paste a job description to get your ATS compatibility score."
                            />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
