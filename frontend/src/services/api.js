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
        if (token && token !== 'null' && token !== 'undefined') {
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

        // Log every 401 visibly
        if (error.response?.status === 401) {
            console.warn('=== 401 INTERCEPTED ===', {
                url: originalRequest?.url,
                retry: originalRequest?._retry,
                hasRefreshToken: !!sessionStorage.getItem('refresh_token'),
                isRefreshing,
            });
        }

        const publicRoutes = ['/2fa/setup', '/2fa/confirm', '/2fa/verify', '/password/forgot', '/password/reset', '/login'];
        if (publicRoutes.some(route => originalRequest?.url?.includes(route))) {
            return Promise.reject(error);
        }

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

                console.warn('=== ATTEMPTING REFRESH ===', {
                    hasRefreshToken: !!refreshToken,
                    refreshTokenPreview: refreshToken?.substring(0, 20),
                });

                // No refresh token available - logout
                if (!refreshToken) {
                    console.error('=== NO REFRESH TOKEN - LOGGING OUT ===');
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

                console.warn('=== REFRESH RESPONSE ===', {
                    success: response.data.success,
                    status: response.status,
                });

                if (response.data.success) {
                    const { access_token, user } = response.data.data;

                    // Update sessionStorage with new token
                    sessionStorage.setItem('access_token', access_token);
                    sessionStorage.setItem('user', JSON.stringify(user));

                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access_token}`;


                    console.warn('=== TOKEN REFRESHED SUCCESSFULLY ===');

                    // Process all queued requests with new token
                    processQueue(null, access_token);

                    return api(originalRequest);
                } else {
                    console.error('=== REFRESH RETURNED SUCCESS:FALSE ===', response.data);
                    throw new Error('Refresh returned success: false');
                }
            } catch(refreshError) {
                console.error('=== REFRESH FAILED ===', {
                    message: refreshError.message,
                    response: refreshError.response?.data,
                    status: refreshError.response?.status,
                });

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

/**
 * 2FA API calls
 */
export const twoFactorAPI = {
    /**
     * Get QR code for 2FA setup
     */
    getSetup: (setupToken) =>
        api.get('/2fa/setup', {
            headers: { 'X-Setup-Token': setupToken },
        }),

    /**
     * Confirm 2FA setup with first code
     */
    confirmSetup: (setupToken, code) =>
        api.post('/2fa/confirm',
            { code },
            { headers: { 'X-Setup-Token': setupToken } }
        ),

    /**
     * Verify 2FA  code on login
     */
    verify: (tempToken, code) =>
        api.post('/2fa/verify',
            {code},
            { headers: { 'X-Temp-Token': tempToken }}
            )
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

/**
 * Ticket API Endpoints
 *
 * Handles all ticket-related API calls:
 * - Create, read, list tickets
 * - Add massages and images
 * - Poll for new messages
 */
export const ticketAPI = {
    /**
     * Create a new ticket (in draft status)
     * @param {Object} data - Ticket data (title, description, category, priority)
     * @return {Promise} API response with created ticket
     */
    createTicket: (data) => api.post('/tickets', data),

    /**
     * Get list of user's tickets
     * @param {number} page - Page number for pagination
     * @returns {Promise} API response with ticket list
     */
    listTickets: (page = 1) => api.get(`/tickets?page=${page}`),

    /**
     * Get ticket details with messages and history
     * @param {number} id - Ticket ID
     * @returns {Promise} API response with full ticket data
     */
    getTicket: (id) => api.get(`/tickets/${id}`),

    /**
     * Submit a draft ticket (changes status to open)
     * @param {number} id - Ticket ID
     * @returns {Promise} API response
     */
    submitTicket: (id) => api.post(`/tickets/${id}/submit`),

    /**
     * Add a message to a ticket
     * @param {number} id -Ticket ID
     * @param {string} content - Message text
     * @returns {Promise} API response with created message
     */
    addMessage: (id, content) => api.post(`tickets/${id}/messages`, { content }),

    /**
     * Upload image to a message
     * @param {number} id - Ticket ID
     * @param {number} msgId - Message ID
     * @param {File} file - Image file to upload
     * @returns {Promise} API response with image data
     */
    uploadImage: (id, msgId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post(`tickets/${id}/messages/${msgId}/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },

    // Admin actions
    assign: (id, adminId) => api.post(`/tickets/${id}/assign`, { admin_id: adminId }),
    updateStatus: (id, status) => api.post(`/tickets/${id}/status`, { status }),
    updatePriority: (id, priority) => api.post(`/tickets/${id}/priority`, { priority }),
    join: (id) => api.post(`/tickets/${id}/join`),
};

/**
 * Password API Endpoints
 */
export const passwordAPI = {
    /**
     * Change password (authenticated user)
     */
    change: (currentPassword, newPassword, newPasswordConfirmation) =>
        api.post('/password/change', {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        }),

    /**
     * Request new passport reset link
     */
    forgot: (email) => api.post('/password/forgot', { email }),

    /**
     * Reset password using token from email
     */
    reset: (token, newPassword, newPasswordConfirmation) =>
        api.post('/password/reset', {
            token,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        }),
};

/**
 * User Management API
 */
export const userAPI = {
    /**
     * List all users
     */
    list: () => api.get('/users'),

    /**
     * Get single user with equipment
     */
    get: (id) => api.get(`/users/${id}`),

    /**
     * Get own profile
     */
    profile: () => api.get('/profile'),

    /**
     * Create new user
     */
    create: (data) => api.post('/users', data),

    /**
     * Reset user password (admin)
     */
    resetPassword: (id) => api.post(`/users/${id}/reset-password`),

    /**
     * Get admin and super_admin profile list
     */
    listAdmins: () => api.get('/admins'),
};

/**
 * Hardware Management API
 */
export const hardwareAPI = {
    list: (filters = {}) => api.get('/hardware', { params: filters }),
    get: (id) => api.get(`/hardware/${id}`),
    create: (data) => api.post('/hardware', data),
    update: (id, data) => api.put(`/hardware/${id}`, data),
    delete: (id) => api.delete(`/hardware/${id}`),
    assign: (id, userId) => api.post(`/hardware/${id}/assign`, { user_id: userId }),
    unassign: (id) => api.post(`/hardware/${id}/unassign`),
};

/**
 * Software Management API
 */
export const softwareAPI = {
    list: (filters = {}) => api.get('/software', { params: filters }),
    get: (id) => api.get(`/software/${id}`),
    create: (data) => api.post('/software', data),
    update: (id, data) => api.put(`/software/${id}`, data),
    delete: (id) => api.delete(`/software/${id}`),
    assign: (id, userId) => api.post(`/software/${id}/assign`, { user_id: userId }),
    unassign: (id, userId) => api.post(`/software/${id}/unassign`, { user_id: userId }),
};

export default api;