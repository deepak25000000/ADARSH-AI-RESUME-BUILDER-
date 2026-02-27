/**
 * Axios API service layer for communicating with the FastAPI backend.
 * All API calls are routed through this module.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 responses
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

// ─── Auth ───
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getProfile: () => api.get('/api/auth/me'),
    updateProfile: (data) => api.put('/api/auth/me', data),
    changePassword: (data) => api.post('/api/auth/change-password', data),
    googleAuth: (data) => api.post('/api/auth/google', data),
};

// ─── Resumes ───
export const resumeAPI = {
    create: (data) => api.post('/api/resumes/', data),
    getAll: () => api.get('/api/resumes/'),
    getById: (id) => api.get(`/api/resumes/${id}`),
    update: (id, data) => api.put(`/api/resumes/${id}`, data),
    delete: (id) => api.delete(`/api/resumes/${id}`),
};

// ─── Cover Letters ───
export const coverLetterAPI = {
    create: (data) => api.post('/api/cover-letters/', data),
    getAll: () => api.get('/api/cover-letters/'),
    getById: (id) => api.get(`/api/cover-letters/${id}`),
    delete: (id) => api.delete(`/api/cover-letters/${id}`),
};

// ─── Portfolios ───
export const portfolioAPI = {
    create: (data) => api.post('/api/portfolios/', data),
    getAll: () => api.get('/api/portfolios/'),
    getById: (id) => api.get(`/api/portfolios/${id}`),
    delete: (id) => api.delete(`/api/portfolios/${id}`),
};

// ─── AI Features ───
export const aiAPI = {
    generateResume: (data) => api.post('/api/ai/generate-resume', data),
    generateCoverLetter: (data) => api.post('/api/ai/generate-cover-letter', data),
    scoreResume: (data) => api.post('/api/ai/score-resume', data),
    skillAnalysis: (data) => api.post('/api/ai/skill-analysis', data),
    generatePortfolio: (data) => api.post('/api/ai/generate-portfolio', data),
    downloadPDF: (id) => api.get(`/api/ai/download-pdf/${id}`, { responseType: 'blob' }),
};

// ─── Admin ───
export const adminAPI = {
    getDashboard: () => api.get('/api/admin/dashboard'),
    getUsers: () => api.get('/api/admin/users'),
    toggleUserActive: (id) => api.put(`/api/admin/users/${id}/toggle-active`),
};

export default api;
