import axios from 'axios';

// Base API configuration
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('access_token');
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
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(error => {
                        return Promise.reject(error);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = sessionStorage.getItem('refresh_token');

                console.log('🔄 Attempting token refresh with:', {
                    refreshToken: refreshToken?.substring(0, 20) + '...',
                    hasRefreshToken: !!refreshToken
                });

                if (!refreshToken) {
                    // No refresh token -> logout
                    sessionStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const response = await axios.post('http://localhost:8000/api/refresh', {
                    refresh_token: refreshToken,
                });

                if (response.data.success) {
                    const { access_token, user } = response.data.data;

                    sessionStorage.setItem('access_token', access_token);
                    sessionStorage.setItem('user', JSON.stringify(user));

                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                    console.log('Token refreshed successfully');

                    processQueue(null, access_token);

                    return api(originalRequest);
                }
            } catch(refreshError) {
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError, null);

                sessionStorage.clear();
                window.location.href = '/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (email, password) => api.post('/login', { email, password }),
    logout: () => api.post('/logout'),
    refresh: (refreshToken) => api.post('/refresh', {refresh_token: refreshToken}),
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