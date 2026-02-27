/**
 * Register page — clean form with Google Sign-In.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Button, useToast } from '../components/ui';
import { UserPlus, Sun, Moon } from 'lucide-react';

export default function Register() {
    const [form, setForm] = useState({ email: '', username: '', full_name: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const toast = useToast();
    const { dark, toggle } = useTheme();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Load Google Sign-In script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = () => initGoogle();
        return () => { document.body.removeChild(script); };
    }, []);

    const initGoogle = () => {
        if (!window.google) return;
        window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleResponse,
        });
        const btnEl = document.getElementById('google-signup-btn');
        if (btnEl) {
            window.google.accounts.id.renderButton(btnEl, {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'signup_with',
                shape: 'rectangular',
            });
        }
    };

    const handleGoogleResponse = async (response) => {
        setLoading(true);
        setError('');
        try {
            await googleLogin(response.credential);
            toast.success('Signed up with Google!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Google sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(form);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-secondary)' }}>
            <button onClick={toggle} className="btn btn-ghost btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="card" style={{ width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700,
                    }}>AI</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Start building AI-powered resumes</p>
                </div>

                {error && (
                    <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Google Sign-Up Button */}
                <div id="google-signup-btn" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}></div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label className="input-label">Full Name *</label>
                        <input name="full_name" className="input-field" placeholder="John Doe" value={form.full_name} onChange={handleChange} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label className="input-label">Username *</label>
                            <input name="username" className="input-field" placeholder="johndoe" value={form.username} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Phone</label>
                            <input name="phone" className="input-field" placeholder="+91 98765" value={form.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Email *</label>
                        <input type="email" name="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="input-label">Password *</label>
                        <input type="password" name="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                    </div>
                    <Button icon={UserPlus} loading={loading} type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
