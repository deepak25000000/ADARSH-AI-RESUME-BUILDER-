/**
 * Footer component for public pages.
 */
export default function Footer() {
    return (
        <footer style={{
            background: 'var(--sidebar-bg)',
            color: 'var(--sidebar-text)',
            padding: '3rem 1.5rem 2rem',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.75rem',
                        }}>AI</div>
                        <span style={{ fontWeight: 600, color: 'white' }}>Resume Builder</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, opacity: 0.7 }}>
                        AI-powered resume and portfolio builder for students and professionals.
                    </p>
                </div>
                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Product</h4>
                    {['Resume Builder', 'Cover Letter', 'Portfolio', 'Skill Analysis'].map(item => (
                        <p key={item} style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '0.375rem' }}>{item}</p>
                    ))}
                </div>
                <div>
                    <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Tech Stack</h4>
                    {['React.js', 'FastAPI', 'PostgreSQL', 'HuggingFace AI'].map(item => (
                        <p key={item} style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '0.375rem' }}>{item}</p>
                    ))}
                </div>
            </div>
            <div style={{ maxWidth: 1200, margin: '2rem auto 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', opacity: 0.5 }}>
                © {new Date().getFullYear()} AI Resume & Portfolio Builder — AIML Project
            </div>
        </footer>
    );
}
