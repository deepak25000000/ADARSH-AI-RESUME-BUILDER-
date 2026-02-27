/**
 * Auth Context — manages user state, login, logout, registration, Google auth.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authAPI.getProfile()
                .then((res) => setUser(res.data))
                .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        localStorage.setItem('token', res.data.access_token);
        const profile = await authAPI.getProfile();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
        return profile.data;
    };

    const googleLogin = async (credential) => {
        const res = await authAPI.googleAuth({ credential });
        localStorage.setItem('token', res.data.access_token);
        const profile = await authAPI.getProfile();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
        return profile.data;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

    return (
        <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
