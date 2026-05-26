import axios from 'axios';

/**
 * API Client Configuration
 *
 * Axios instance configured for Laravel backend API.
 * Includes automatic token injection and refresh handling.
 *
 * Base URL: http://localhost:8000/api
 */
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/**
 * Token Refresh State
 *
 * isRefreshing: Prevents multiple simultaneous refresh attempts
 * failedQueue: Stores requests waiting for token refresh
 */
let isRefreshing = false;
let failedQueue = [];

/**
 * Process Queued Requests
 *
 * Resolves or rejects all requests waiting for token refresh.
 * Called after refresh succeeds or fails.
 *
 * @param {Error|null} error - Error if refresh failed.
 * @param {string|null} token - New access token if refresh succeeded
 */
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

/**
 * Request Interceptor
 *
 * Automatically adds access token to all outgoing requests.
 * Retrieves token from sessionStorage on each request.
 */
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

/**
 * Response Interceptor
 *
 * Handles 401 errors by attempting token refresh.
 * Implements queuing system to prevent multiple refresh calls.
 *
 * Flow:
 * 1. Request fails with 401
 * 2. Check if refresh already in progress
 * 3. If yes: queue this request
 * 4. If no: attempts refresh with refresh token
 * 5. On success: retry original request + all queued requests
 * 6. On failure: logout user
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors (expired token)
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If refresh already in progress, queue this request
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

                // No refresh token available - logout
                if (!refreshToken) {
                    sessionStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                /**
                 * Call refresh endpoint
                 * Uses vanilla axios to avoid interceptors
                 */
                const response = await axios.post('http://localhost:8000/api/refresh', {
                    refresh_token: refreshToken,
                });

                if (response.data.success) {
                    const { access_token, user } = response.data.data;

                    // Update sessionStorage with new token
                    sessionStorage.setItem('access_token', access_token);
                    sessionStorage.setItem('user', JSON.stringify(user));

                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                    console.log('Token refreshed successfully');

                    // Process all queued requests with new token
                    processQueue(null, access_token);

                    return api(originalRequest);
                }
            } catch(refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Reject all queued requests
                processQueue(refreshError, null);

                sessionStorage.clear();
                window.location.href = '/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        // Not a 401 or already retried - reject as-is
        return Promise.reject(error);
    }
);

/**
 * Authentication API Endpoints
 *
 * Handles user authentication flows:
 * - login: Authenticate and get tokens
 * - logout: Revoke tokens
 * - refresh: Get new access token using refresh token
 * - getCurrentUSer: Get authenticated user info
 */
export const authAPI = {
    /**
     * Login user
     * @param {string} email - USer email
     * @param {string} password - User password
     * @returns {Promise} API response with tokens and user data
     */
    login: (email, password) => api.post('/login', { email, password }),

    /**
     * Logout user (revoke all tokens)
     * @returns {Promise} API response
     */
    logout: () => api.post('/logout'),

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} API response with new access token
     */
    refresh: (refreshToken) => api.post('/refresh', {refresh_token: refreshToken}),

    /**
     * Get current authenticated user
     * @returns {Promise} API response with user data
     */
    getCurrentUser: () => api.get('/user'),
};

// Dashboard API calls
export const dashboardAPI = {
    /**
     * Get user dashboard data
     * Accessible to all authenticated users
     */
    getUserDashboard: () => api.get('/dashboard'),

    /**
     * Get admin dashboard data
     * Accessible to admin and super_admin
     */
    getAdminDashboard: () => api.get('/admin/dashboard'),

    /**
     * Get super admin dashboard data
     * Accessible to super_admin only
     */
    getSuperAdminDashboard: () => api.get('/super-admin/dashboard'),

    /**
     * Get user list
     * Accessible to admin and super_admin
     */
    getAdminUsers: () => api.get('/admin/users'),

    /**
     * Get system configuration
     * Accessible to super_admin only
     */
    getSuperAdminConfig: () => api.get('/super-admin/system-config'),
};

export default api;