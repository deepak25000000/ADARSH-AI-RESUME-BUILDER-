/**
 * Auth Context — manages user state, login, logout, registration, Google auth.
 * Persists session in localStorage and verifies JWT token on app load.
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticating = useRef(false);

    // On app load: restore user from localStorage and verify token with backend
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            // Restore user immediately to prevent redirect flash
            try { setUser(JSON.parse(savedUser)); } catch { }
            // Verify token with backend in background
            authAPI.getProfile()
                .then((res) => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    // Only clear if not currently in an auth flow (prevents race condition)
                    if (!isAuthenticating.current) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                })
                .finally(() => setLoading(false));
        } else if (token) {
            // Token exists but no saved user — verify and fetch
            authAPI.getProfile()
                .then((res) => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    if (!isAuthenticating.current) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        isAuthenticating.current = true;
        try {
            const res = await authAPI.login({ email, password });
            const token = res.data.access_token;
            localStorage.setItem('token', token);
            // Fetch full profile after storing token
            const profile = await authAPI.getProfile();
            setUser(profile.data);
            localStorage.setItem('user', JSON.stringify(profile.data));
            return profile.data;
        } finally {
            isAuthenticating.current = false;
        }
    }, []);

    const googleLogin = useCallback(async (credential) => {
        isAuthenticating.current = true;
        try {
            const res = await authAPI.googleAuth({ credential });
            const token = res.data.access_token;
            localStorage.setItem('token', token);
            // Fetch full profile after storing token
            const profile = await authAPI.getProfile();
            setUser(profile.data);
            localStorage.setItem('user', JSON.stringify(profile.data));
            return profile.data;
        } finally {
            isAuthenticating.current = false;
        }
    }, []);

    const register = useCallback(async (data) => {
        const res = await authAPI.register(data);
        return res.data;
    }, []);

    const registerAndLogin = useCallback(async (data) => {
        isAuthenticating.current = true;
        try {
            await authAPI.register(data);
            // Auto-login after successful registration
            const loginRes = await authAPI.login({ email: data.email, password: data.password });
            const token = loginRes.data.access_token;
            localStorage.setItem('token', token);
            const profile = await authAPI.getProfile();
            setUser(profile.data);
            localStorage.setItem('user', JSON.stringify(profile.data));
            return profile.data;
        } finally {
            isAuthenticating.current = false;
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const updateUser = useCallback((data) => setUser((prev) => ({ ...prev, ...data })), []);

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, register, registerAndLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
