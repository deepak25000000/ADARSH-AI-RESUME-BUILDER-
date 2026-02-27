/**
 * Profile page — account settings, password change.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Card, Button, Badge, useToast } from '../components/ui';
import { Save, Lock, User, Mail, Phone } from 'lucide-react';

export default function Profile() {
    const toast = useToast();
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', bio: user?.bio || '' });
    const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
    const [saving, setSaving] = useState(false);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const r = await authAPI.updateProfile(form);
            updateUser(r.data);
            toast.success('Profile updated!');
        } catch (e) { toast.error(e.response?.data?.detail || 'Update failed'); }
        finally { setSaving(false); }
    };

    const handlePassword = async () => {
        if (pwForm.new_password.length < 6) { toast.warning('Min 6 characters'); return; }
        try {
            await authAPI.changePassword(pwForm);
            toast.success('Password changed!');
            setPwForm({ old_password: '', new_password: '' });
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
    };

    return (
        <div className="page-container" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">Profile Settings</h1>
                <p className="page-subtitle">Manage your account details and security</p>
            </div>

            {/* User info card */}
            <Card style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '1.25rem',
                    }}>{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
                    <div>
                        <h2 style={{ fontWeight: 600 }}>{user?.full_name}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
                            <Badge variant={user?.role === 'admin' ? 'warning' : 'primary'}>{user?.role}</Badge>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label className="input-label">Full Name</label>
                        <input className="input-field" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Phone</label>
                        <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">Bio</label>
                        <textarea className="input-field" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
                    </div>
                    <Button icon={Save} loading={saving} onClick={handleUpdate}>Save Changes</Button>
                </div>
            </Card>

            {/* Password */}
            <Card>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} /> Change Password
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                        <label className="input-label">Current Password</label>
                        <input type="password" className="input-field" value={pwForm.old_password} onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} />
                    </div>
                    <div>
                        <label className="input-label">New Password</label>
                        <input type="password" className="input-field" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} />
                    </div>
                    <Button variant="secondary" onClick={handlePassword}>Change Password</Button>
                </div>
            </Card>
        </div>
    );
}
