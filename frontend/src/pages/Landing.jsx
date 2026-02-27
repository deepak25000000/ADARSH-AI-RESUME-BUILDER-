/**
 * Landing page — premium hero, features, social proof, CTA.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';
import { FileText, Mail, BarChart3, Globe, Target, Download, ArrowRight, CheckCircle, Sun, Moon } from 'lucide-react';
import Footer from '../components/layout/Footer';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
    const { user } = useAuth();
    const { dark, toggle } = useTheme();

    const features = [
        { icon: FileText, title: 'ATS-Optimized Resume', desc: 'AI generates resumes that pass Applicant Tracking Systems with optimized keywords and action verbs.', color: '#4f46e5' },
        { icon: Mail, title: 'Smart Cover Letters', desc: 'Company-specific, personalized cover letters with tone selection — formal, confident, or professional.', color: '#0ea5e9' },
        { icon: BarChart3, title: 'Resume Scoring', desc: 'TF-IDF cosine similarity analysis compares your resume with job descriptions and suggests improvements.', color: '#10b981' },
        { icon: Globe, title: 'Portfolio Generator', desc: 'Auto-generate a stunning portfolio website from your resume data. Choose from 3 premium templates.', color: '#f59e0b' },
        { icon: Target, title: 'Skill Gap Analysis', desc: 'NLP extracts required skills from job descriptions and identifies exactly what you need to learn.', color: '#8b5cf6' },
        { icon: Download, title: 'PDF Export', desc: 'Download your polished resume as a professional PDF, ready for submission to any company.', color: '#ec4899' },
    ];

    const stats = [
        { value: '10K+', label: 'Resumes Generated' },
        { value: '95%', label: 'ATS Pass Rate' },
        { value: '50+', label: 'Templates & Styles' },
        { value: '4.9★', label: 'User Rating' },
    ];

    return (
        <div style={{ background: 'var(--bg)' }}>
            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                background: 'var(--bg)', borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(8px)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.75rem',
                        }}>AI</div>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Resume Builder</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button onClick={toggle} className="btn btn-ghost btn-icon">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard <ArrowRight size={14} /></Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ paddingTop: '8rem', paddingBottom: '5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                    width: 600, height: 600, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <motion.div initial="hidden" animate="show" variants={stagger} style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
                    <motion.div variants={fadeUp} style={{ display: 'inline-block', padding: '0.25rem 0.875rem', borderRadius: 9999, border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        ✨ Powered by AI & NLP
                    </motion.div>
                    <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                        Build Your Career with{' '}
                        <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            AI-Powered
                        </span>{' '}
                        Resumes
                    </motion.h1>
                    <motion.p variants={fadeUp} style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 2rem' }}>
                        Create ATS-optimized resumes, tailored cover letters, portfolio websites, and get intelligent skill gap analysis — all in one platform.
                    </motion.p>
                    <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
                            Start Building Free <ArrowRight size={16} />
                        </Link>
                        <a href="#features" className="btn btn-secondary btn-lg">See Features</a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats row */}
            <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                    {stats.map(s => (
                        <div key={s.label}>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{s.value}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{ padding: '5rem 1.5rem' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Features</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need to Land Your Dream Job</h2>
                    </div>
                    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {features.map(f => (
                            <motion.div key={f.title} variants={fadeUp} className="card" style={{ cursor: 'default' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                                }}>
                                    <f.icon size={20} style={{ color: f.color }} />
                                </div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-secondary)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>How It Works</p>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>Three Simple Steps</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {[
                            { step: '1', title: 'Enter Your Details', desc: 'Fill in your education, skills, projects, and experience.' },
                            { step: '2', title: 'AI Generates Content', desc: 'Our AI creates ATS-optimized resume content and cover letters.' },
                            { step: '3', title: 'Download & Apply', desc: 'Download professional PDFs and portfolio websites instantly.' },
                        ].map(s => (
                            <div key={s.step}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 1rem',
                                    background: 'var(--primary)', color: 'white', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem',
                                }}>{s.step}</div>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{s.title}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '5rem 1.5rem' }}>
                <div style={{
                    maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '3rem 2rem',
                    borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
                }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to Build Your Future?</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>Join thousands of students using AI to create standout resumes and portfolios.</p>
                    <Link to={user ? '/dashboard' : '/register'} className="btn btn-lg" style={{ background: 'white', color: '#4f46e5', fontWeight: 600 }}>
                        Get Started Free <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
