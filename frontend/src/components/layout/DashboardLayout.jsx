/**
 * Dashboard Layout — sidebar + topbar wrapper for authenticated pages.
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                <Topbar />
                <main style={{ flex: 1, background: 'var(--bg-secondary)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
