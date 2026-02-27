/**
 * Admin Dashboard — analytics, user management.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, PageLoader, useToast } from '../components/ui';
import { Users, FileText, Mail, Globe, BarChart3, Shield, UserCheck, UserX } from 'lucide-react';

export default function AdminDashboard() {
    const toast = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'admin') { navigate('/dashboard'); return; }
        const load = async () => {
            try {
                const [d, u] = await Promise.all([adminAPI.getDashboard(), adminAPI.getUsers()]);
                setData(d.data);
                setUsers(u.data);
            } catch (e) { toast.error('Failed to load admin data'); }
            finally { setLoading(false); }
        };
        load();
    }, [user, navigate]);

    const toggleUser = async (id) => {
        try {
            await adminAPI.toggleUserActive(id);
            setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
            toast.success('User status updated');
        } catch { toast.error('Failed'); }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Platform analytics and user management</p>
            </div>

            {data && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                        {[
                            { icon: Users, label: 'Users', value: data.total_users, color: '#0ea5e9', bg: '#e0f2fe' },
                            { icon: FileText, label: 'Resumes', value: data.total_resumes, color: '#4f46e5', bg: '#eef2ff' },
                            { icon: Mail, label: 'Cover Letters', value: data.total_cover_letters, color: '#8b5cf6', bg: '#f3e8ff' },
                            { icon: Globe, label: 'Portfolios', value: data.total_portfolios, color: '#f59e0b', bg: '#fef3c7' },
                            { icon: BarChart3, label: 'Scores', value: data.total_scores, color: '#10b981', bg: '#d1fae5' },
                        ].map(s => (
                            <Card key={s.label}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <s.icon size={18} style={{ color: s.color }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Users Table */}
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Shield size={16} style={{ color: 'var(--primary)' }} />
                            <h3 style={{ fontWeight: 600 }}>All Users ({users.length})</h3>
                        </div>
                        <div style={{ overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Name', 'Email', 'Role', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{u.full_name}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>
                                                <Badge variant={u.role === 'admin' ? 'warning' : 'primary'}>{u.role}</Badge>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>
                                                <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>
                                                <Button variant="ghost" size="sm" icon={u.is_active ? UserX : UserCheck} onClick={() => toggleUser(u.id)}>
                                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
