/**
 * Auth Context — manages user state, login, logout, registration, Google auth.
 * Sessions persist in localStorage. Only explicit logout clears auth state.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Initialize user from localStorage synchronously to prevent flash
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    // On mount: verify token silently in background — NEVER clear user on failure
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && user) {
            // Token exists, user already loaded from localStorage — just verify in background
            authAPI.getProfile()
                .then((res) => {
                    // Update with fresh profile data
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    // Silently fail — keep cached user, don't logout
                    // User will only be logged out when they explicitly click logout
                    // or when a new login attempt is made
                    console.warn('Profile verification failed, keeping cached session');
                })
                .finally(() => setLoading(false));
        } else if (token && !user) {
            // Token but no cached user — try to fetch
            authAPI.getProfile()
                .then((res) => {
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch(() => {
                    // Token is invalid and no cached user — clear token
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = useCallback(async (email, password) => {
        const res = await authAPI.login({ email, password });
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        // Fetch profile
        const profile = await authAPI.getProfile();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
        return profile.data;
    }, []);

    const googleLogin = useCallback(async (credential) => {
        const res = await authAPI.googleAuth({ credential });
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        // Fetch profile
        const profile = await authAPI.getProfile();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
        return profile.data;
    }, []);

    const register = useCallback(async (data) => {
        const res = await authAPI.register(data);
        return res.data;
    }, []);

    const registerAndLogin = useCallback(async (data) => {
        await authAPI.register(data);
        // Auto-login after registration
        const loginRes = await authAPI.login({ email: data.email, password: data.password });
        const token = loginRes.data.access_token;
        localStorage.setItem('token', token);
        const profile = await authAPI.getProfile();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
        return profile.data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const updateUser = useCallback((data) => {
        setUser((prev) => {
            const updated = { ...prev, ...data };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

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
