/**
 * Sidebar navigation — collapsible, icon-based with active state.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, FileText, Mail, BarChart3, Globe, Target,
    User, Settings, LogOut, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/resume-builder', icon: FileText, label: 'Resume Builder' },
    { to: '/cover-letter', icon: Mail, label: 'Cover Letter' },
    { to: '/score', icon: BarChart3, label: 'Resume Score' },
    { to: '/portfolio', icon: Globe, label: 'Portfolio' },
    { to: '/skills', icon: Target, label: 'Skill Analysis' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside
            style={{
                width: collapsed ? 72 : 240,
                background: 'var(--sidebar-bg)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'sticky',
                top: 0,
                transition: 'width 0.2s ease',
                zIndex: 40,
                overflow: 'hidden',
                flexShrink: 0,
            }}
        >
            {/* Brand */}
            <div style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                }}>AI</div>
                {!collapsed && <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'white', whiteSpace: 'nowrap' }}>Resume Builder</span>}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem', overflow: 'auto' }}>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
                            borderRadius: 8,
                            color: isActive ? 'white' : 'var(--sidebar-text)',
                            background: isActive ? 'var(--sidebar-active)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 500 : 400,
                            transition: 'all 0.15s',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        })}
                    >
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                    </NavLink>
                ))}

                {user?.role === 'admin' && (
                    <NavLink
                        to="/admin"
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: collapsed ? '0.625rem' : '0.625rem 0.875rem',
                            borderRadius: 8, color: isActive ? 'white' : '#fbbf24',
                            background: isActive ? 'var(--sidebar-active)' : 'transparent',
                            textDecoration: 'none', fontSize: '0.875rem',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        })}
                    >
                        <Shield size={18} /> {!collapsed && 'Admin Panel'}
                    </NavLink>
                )}
            </nav>

            {/* Bottom */}
            <div style={{ padding: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <NavLink
                    to="/profile"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: 8, color: 'var(--sidebar-text)', textDecoration: 'none', fontSize: '0.875rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    <User size={18} /> {!collapsed && 'Profile'}
                </NavLink>
                <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: 8, color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    <LogOut size={18} /> {!collapsed && 'Logout'}
                </button>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', marginTop: '0.25rem', color: 'var(--sidebar-text)', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </aside>
    );
}
