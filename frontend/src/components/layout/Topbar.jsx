/**
 * Topbar — search, dark mode toggle, user avatar.
 */
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Topbar() {
    const { user } = useAuth();
    const { dark, toggle } = useTheme();

    return (
        <header style={{
            height: 56,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
        }}>
            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                    placeholder="Search..."
                    className="input-field"
                    style={{ paddingLeft: '2rem', height: 36, fontSize: '0.8125rem' }}
                />
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={toggle} className="btn btn-ghost btn-icon" title="Toggle theme">
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="btn btn-ghost btn-icon" title="Notifications">
                    <Bell size={18} />
                </button>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)', marginLeft: '0.5rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 600, fontSize: '0.8125rem',
                    }}>
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{user?.full_name?.split(' ')[0] || 'User'}</span>
                </Link>
            </div>
        </header>
    );
}
