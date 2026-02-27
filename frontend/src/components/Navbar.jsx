/**
 * Navbar component with auth-aware navigation.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[rgba(15,23,42,0.85)] border-b border-indigo-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl font-bold gradient-text">AI Resume Builder</span>
                    </Link>

                    {user ? (
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/dashboard" className="text-slate-300 hover:text-indigo-400 transition font-medium">Dashboard</Link>
                            <Link to="/resume-builder" className="text-slate-300 hover:text-indigo-400 transition font-medium">Resume</Link>
                            <Link to="/cover-letter" className="text-slate-300 hover:text-indigo-400 transition font-medium">Cover Letter</Link>
                            <Link to="/score" className="text-slate-300 hover:text-indigo-400 transition font-medium">Score</Link>
                            <Link to="/portfolio" className="text-slate-300 hover:text-indigo-400 transition font-medium">Portfolio</Link>
                            <Link to="/skills" className="text-slate-300 hover:text-indigo-400 transition font-medium">Skills</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition font-medium">Admin</Link>
                            )}
                            <div className="flex items-center gap-3 ml-4">
                                <Link to="/profile" className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                                </Link>
                                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition text-sm font-medium">
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Login</Link>
                            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-300 text-2xl">
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && user && (
                    <div className="md:hidden pb-4 space-y-2">
                        {[
                            ['/dashboard', 'Dashboard'], ['/resume-builder', 'Resume'], ['/cover-letter', 'Cover Letter'],
                            ['/score', 'Score'], ['/portfolio', 'Portfolio'], ['/skills', 'Skills'], ['/profile', 'Profile']
                        ].map(([path, label]) => (
                            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                                className="block py-2 px-3 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition">
                                {label}
                            </Link>
                        ))}
                        <button onClick={handleLogout} className="block py-2 px-3 text-red-400 hover:bg-slate-800/50 rounded-lg transition w-full text-left">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
