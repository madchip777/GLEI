import axios from 'axios';

// Base API configuration
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    handlers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (email, password) => api.post('/login', { email, password }),
    logout: () => api.post('/logout'),
    getCurrentUser: () => api.get('/user'),
};

// Dashboard API calls
export const dashboardAPI = {
    getUserDashboard: () => api.get('/dashboard'),
    getAdminDashboard: () => api.get('/admin/dashboard'),
    getSuperAdminDashboard: () => api.get('/super-admin/dashboard'),
    getAdminUsers: () => api.get('/admin/users'),
    getSuperAdminConfig: () => api.get('/super-admin/system-config'),
};

export default api;