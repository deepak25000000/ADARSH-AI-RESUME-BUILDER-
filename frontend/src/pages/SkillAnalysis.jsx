/**
 * Skill Gap Analysis — visual match, missing skills, recommendations.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '../services/api';
import { Card, Button, ScoreRing, EmptyState, Badge, useToast } from '../components/ui';
import { Target, Search, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export default function SkillAnalysis() {
    const toast = useToast();
    const [form, setForm] = useState({ job_role: '', job_description: '', user_skills: '' });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!form.job_description.trim() || !form.user_skills.trim()) { toast.warning('Enter job description and your skills'); return; }
        setLoading(true);
        try {
            const skills = form.user_skills.split(',').map(s => s.trim()).filter(Boolean);
            const r = await aiAPI.skillAnalysis({ job_role: form.job_role, job_description: form.job_description, user_skills: skills });
            setResult(r.data);
            toast.success('Analysis complete!');
        } catch (e) { toast.error('Analysis failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Skill Gap Analysis</h1>
                <p className="page-subtitle">Identify missing skills and get recommendations to bridge the gap</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Input */}
                <Card>
                    <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Analyze Your Skills</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <label className="input-label">Target Job Role</label>
                            <input className="input-field" placeholder="e.g. Full Stack Developer" value={form.job_role} onChange={e => setForm({ ...form, job_role: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Job Description</label>
                            <textarea className="input-field" placeholder="Paste the job description..." rows={6} value={form.job_description} onChange={e => setForm({ ...form, job_description: e.target.value })} />
                        </div>
                        <div>
                            <label className="input-label">Your Skills (comma-separated)</label>
                            <textarea className="input-field" placeholder="Python, React, SQL, Git, Docker..." rows={3} value={form.user_skills} onChange={e => setForm({ ...form, user_skills: e.target.value })} />
                        </div>
                        <Button icon={Search} loading={loading} onClick={handleAnalyze} style={{ width: '100%' }}>
                            {loading ? 'Analyzing...' : 'Analyze Skills'}
                        </Button>
                    </div>
                </Card>

                {/* Results */}
                <div>
                    {result ? (
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Card style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <ScoreRing score={result.match_percentage} size={140} strokeWidth={10} />
                                    <p style={{ fontWeight: 600, marginTop: '0.75rem' }}>Skill Match</p>
                                </div>
                            </Card>

                            {/* Required Skills */}
                            {result.required_skills?.length > 0 && (
                                <Card>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Required Skills</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {result.required_skills.map((s, i) => {
                                            const isMatch = result.user_skills?.some(u => u.toLowerCase() === s.toLowerCase());
                                            return (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.8125rem', background: isMatch ? 'var(--success-light)' : 'var(--bg-secondary)', color: isMatch ? 'var(--success)' : 'var(--text-secondary)' }}>
                                                    {isMatch ? <CheckCircle size={12} /> : <XCircle size={12} />} {s}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            )}

                            {/* Missing Skills */}
                            {result.missing_skills?.length > 0 && (
                                <Card>
                                    <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>Missing Skills</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {result.missing_skills.map((s, i) => <Badge key={i} variant="danger">{s}</Badge>)}
                                    </div>
                                </Card>
                            )}

                            {/* Recommendations */}
                            {result.recommendations?.length > 0 && (
                                <Card>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Lightbulb size={16} style={{ color: 'var(--primary)' }} />
                                        <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>Learning Recommendations</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {result.recommendations.map((r, i) => (
                                            <div key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--primary-light)' }}>
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    ) : (
                        <Card>
                            <EmptyState icon={Target} title="No analysis yet" description="Enter your skills and a job description to identify skill gaps." />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
