/**
 * Dashboard — Stripe/Notion-style stats, activity timeline, quick actions.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { resumeAPI, coverLetterAPI, portfolioAPI } from '../services/api';
import { Card, ScoreRing, SkeletonCard, EmptyState } from '../components/ui';
import { FileText, Mail, Globe, BarChart3, Target, ArrowRight, Plus, Clock, TrendingUp } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [r, c, p] = await Promise.all([
                    resumeAPI.getAll(), coverLetterAPI.getAll(), portfolioAPI.getAll(),
                ]);
                setStats({ resumes: r.data.length, coverLetters: c.data.length, portfolios: p.data.length });
                setResumes(r.data.slice(0, 5));
            } catch (e) { setStats({ resumes: 0, coverLetters: 0, portfolios: 0 }); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const quickActions = [
        { icon: FileText, label: 'New Resume', desc: 'Build an ATS-optimized resume', to: '/resume-builder', color: '#4f46e5' },
        { icon: BarChart3, label: 'Score Resume', desc: 'Analyze against a job description', to: '/score', color: '#10b981' },
        { icon: Mail, label: 'Cover Letter', desc: 'Generate a personalized letter', to: '/cover-letter', color: '#0ea5e9' },
        { icon: Globe, label: 'Portfolio', desc: 'Create your portfolio website', to: '/portfolio', color: '#f59e0b' },
        { icon: Target, label: 'Skill Analysis', desc: 'Find and bridge skill gaps', to: '/skills', color: '#8b5cf6' },
    ];

    return (
        <div className="page-container">
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
                {/* Header */}
                <motion.div variants={fadeUp} className="page-header">
                    <h1 className="page-title">Welcome back, {user?.full_name?.split(' ')[0] || 'User'} 👋</h1>
                    <p className="page-subtitle">Here's what's happening with your career toolkit.</p>
                </motion.div>

                {/* Stat Cards */}
                <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {loading ? (
                        <>
                            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                        </>
                    ) : (
                        <>
                            {[
                                { icon: FileText, label: 'Resumes', value: stats?.resumes || 0, color: '#4f46e5', bg: '#eef2ff' },
                                { icon: Mail, label: 'Cover Letters', value: stats?.coverLetters || 0, color: '#0ea5e9', bg: '#e0f2fe' },
                                { icon: Globe, label: 'Portfolios', value: stats?.portfolios || 0, color: '#f59e0b', bg: '#fef3c7' },
                                { icon: TrendingUp, label: 'Total Generated', value: (stats?.resumes || 0) + (stats?.coverLetters || 0) + (stats?.portfolios || 0), color: '#10b981', bg: '#d1fae5' },
                            ].map(s => (
                                <Card key={s.label} hover>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</p>
                                            <p style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>{s.value}</p>
                                        </div>
                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <s.icon size={20} style={{ color: s.color }} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={fadeUp}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                        {quickActions.map(a => (
                            <Link key={a.label} to={a.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card hover style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${a.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <a.icon size={18} style={{ color: a.color }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.label}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{a.desc}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Resumes */}
                <motion.div variants={fadeUp}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Resumes</h2>
                        <Link to="/resume-builder" className="btn btn-ghost btn-sm"><Plus size={14} /> New</Link>
                    </div>
                    {resumes.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {resumes.map(r => (
                                <Link key={r.id} to={`/resume-builder?id=${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Card hover style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FileText size={18} style={{ color: 'var(--primary)' }} />
                                                <div>
                                                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.title}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.target_job_role || 'No target role'}</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.updated_at).toLocaleDateString()}</span>
                                                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : !loading && (
                        <Card>
                            <EmptyState
                                icon={FileText}
                                title="No resumes yet"
                                description="Create your first AI-powered resume to get started."
                                action={<Link to="/resume-builder" className="btn btn-primary btn-sm"><Plus size={14} /> Create Resume</Link>}
                            />
                        </Card>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
