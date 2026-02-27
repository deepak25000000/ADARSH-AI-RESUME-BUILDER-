/**
 * Reusable UI Components: Button, Card, Modal, Loader, Skeleton, Toast, Badge, EmptyState
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

/* ─── Button ─── */
export function Button({ children, variant = 'primary', size = 'md', icon: Icon, loading, className = '', ...props }) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    return (
        <button className={`btn btn-${variant} ${sizeClass} ${className}`} disabled={loading || props.disabled} {...props}>
            {loading ? <Spinner size={16} /> : Icon && <Icon size={16} />}
            {children}
        </button>
    );
}

/* ─── Card ─── */
export function Card({ children, className = '', hover = false, ...props }) {
    return (
        <motion.div
            className={`card ${className}`}
            whileHover={hover ? { y: -2, boxShadow: 'var(--shadow-md)' } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/* ─── Spinner ─── */
export function Spinner({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
    );
}

/* ─── Page Loader ─── */
export function PageLoader() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <Spinner size={32} />
        </div>
    );
}

/* ─── Skeleton ─── */
export function Skeleton({ width = '100%', height = '1rem', rounded = false, className = '' }) {
    return (
        <div className={`skeleton ${className}`}
            style={{ width, height, borderRadius: rounded ? '50%' : '6px' }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton height="0.75rem" width="40%" />
            <Skeleton height="2rem" width="60%" />
            <Skeleton height="0.75rem" width="80%" />
        </div>
    );
}

/* ─── Modal ─── */
export function Modal({ open, onClose, title, children, footer }) {
    if (!open) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '85vh', overflow: 'auto' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
                        <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={18} /></button>
                    </div>
                    {children}
                    {footer && <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>{footer}</div>}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

/* ─── Badge ─── */
export function Badge({ children, variant = 'primary', className = '' }) {
    return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}

/* ─── Empty State ─── */
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="empty-state">
            {Icon && <Icon size={48} className="empty-state-icon" />}
            <p className="empty-state-title">{title}</p>
            <p className="empty-state-desc">{description}</p>
            {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
        </div>
    );
}

/* ─── Score Ring ─── */
export function ScoreRing({ score, size = 120, strokeWidth = 8, color }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const c = color || (score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)');

    return (
        <div className="score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth={strokeWidth}
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </svg>
            <div className="score-ring-label">
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: c }}>{Math.round(score)}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
        </div>
    );
}

/* ─── Toast System ─── */
const ToastContext = createContext(null);

const TOAST_ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};
const TOAST_COLORS = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--primary)',
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                <AnimatePresence>
                    {toasts.map((t) => {
                        const Icon = TOAST_ICONS[t.type];
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                                className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', minWidth: 280 }}
                            >
                                <Icon size={18} style={{ color: TOAST_COLORS[t.type], flexShrink: 0 }} />
                                <span style={{ fontSize: '0.875rem' }}>{t.message}</span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be inside ToastProvider');
    return ctx;
};
