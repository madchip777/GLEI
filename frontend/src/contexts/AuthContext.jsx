import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages user session, tokens (access & refresh), and role-based access.
 *
 * State stored in sessionStorage for security (cleared on browser close).
 */
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 *
 * Wraps the application to provide authentication context.
 * Handles token management, login/logout, and session persistence.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Initialize authentication state from sessionStorage
     * Runs once on mount to restore session after page refresh
     */
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedAccessToken = sessionStorage.getItem("access_token");
                const storedRefreshToken = sessionStorage.getItem("refresh_token");
                const storedUser = sessionStorage.getItem('user');

                console.log('Initializing auth:', {
                    hasAccessToken: !!storedAccessToken,
                    hasRefreshToken: !!storedRefreshToken,
                    hasUser: !!storedUser
                });

                if (storedAccessToken && storedRefreshToken && storedUser) {
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                sessionStorage.clear();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Login user with email and password
     *
     * Authenticates user and stores tokens in both states and sessionStorage.
     * Returns access token, refresh token, and user info.
     *
     * @param {string} email - USer email address
     * @param {string} password - User password
     * @returns {Promise<{success: boolean, massage?: string}>}
     */
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);

            if (response.data.success) {
                const { access_token, refresh_token, user } = response.data.data;

                console.log('Login successful:', {
                    access_token: access_token.substring(0, 15) + '...',
                    refresh_token: refresh_token.substring(0, 15) + '...',
                    user: user
                });

                // Update state
                setAccessToken(access_token);
                setRefreshToken(refresh_token);
                setUser(user);

                // Persist to sessionStorage (cleared on browser close)
                sessionStorage.setItem('access_token', access_token);
                sessionStorage.setItem('refresh_token', refresh_token);
                sessionStorage.setItem("user", JSON.stringify(user));

                console.log('🔍 Stored in sessionStorage:', {
                    access_token: sessionStorage.getItem('access_token'),
                    refresh_token: sessionStorage.getItem('refresh_token'),
                    user: sessionStorage.getItem('user')
                });

                return { success: true };
            }

            return {
                success: false,
                message: response.data.message || 'Login failed',
            };

        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login error',
            };
        }
    };

    /**
     * Logout user
     *
     * Revokes tokens on backend and clears local session.
     * Always clears local data even if API call fails.
     */
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear everything regardless of API call success
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            sessionStorage.clear();
        }
    };

    /**
     * Chack if user has specific role(s)
     *
     * @param {string|string[]} roles - Role or array of roles to check
     * @returns {boolean} True if user has one of the specified roles
     */
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    /**
     * Context value provided to children
     * Includes auth state and methods.
     */
    const value = {
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        isAuthenticated: !!accessToken || !!sessionStorage.getItem('access_token'),
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Must be used within AuthProvider.
 *
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 *
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export const  useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};