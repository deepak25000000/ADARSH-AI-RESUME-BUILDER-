/**
 * Login page — clean, minimal design with Google Sign-In.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Button, useToast } from '../components/ui';
import { LogIn, Sun, Moon } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const toast = useToast();
    const { dark, toggle } = useTheme();
    const navigate = useNavigate();

    // Use ref to always have the latest googleLogin function in the callback
    const googleLoginRef = useRef(googleLogin);
    const navigateRef = useRef(navigate);
    const toastRef = useRef(toast);
    useEffect(() => { googleLoginRef.current = googleLogin; }, [googleLogin]);
    useEffect(() => { navigateRef.current = navigate; }, [navigate]);
    useEffect(() => { toastRef.current = toast; }, [toast]);

    const handleGoogleResponse = useCallback(async (response) => {
        try {
            await googleLoginRef.current(response.credential);
            toastRef.current.success('Signed in with Google!');
            navigateRef.current('/dashboard');
        } catch (err) {
            // Error is shown, but don't clear auth state — that's handled by the interceptor
            const el = document.getElementById('login-error');
            if (el) el.textContent = err.response?.data?.detail || 'Google sign-in failed';
        }
    }, []);

    // Load Google Sign-In script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
        script.onload = () => {
            if (!window.google) return;
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                callback: handleGoogleResponse,
            });
            const btnEl = document.getElementById('google-signin-btn');
            if (btnEl) {
                window.google.accounts.id.renderButton(btnEl, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signin_with',
                    shape: 'rectangular',
                });
            }
        };
        return () => {
            try { document.body.removeChild(script); } catch { }
        };
    }, [handleGoogleResponse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--bg-secondary)' }}>
            <button onClick={toggle} className="btn btn-ghost btn-icon" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, margin: '0 auto 1rem',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700,
                    }}>AI</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Sign in to your account</p>
                </div>

                {error && (
                    <div id="login-error" style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <div id="google-signin-btn" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}></div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label className="input-label">Email</label>
                        <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="input-label">Password</label>
                        <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button icon={LogIn} loading={loading} type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
                </p>
            </div>
        </div>
    );
}
