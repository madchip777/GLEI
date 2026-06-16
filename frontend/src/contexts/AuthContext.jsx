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
 * Manages user session, token (access and refresh), and role-based access.
 * Tokens stored in sessionStorage (cleared on browser close).
 * Login is split: credentials -> 2FA -> completeLogin()
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
     * Complete login after successful 2FA verification
     * Called by Login.jsx after 2FA confirm or verify succeeds
     *
     * @param {Object} userData - User object from API
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token
     * @returns {{success: boolean, message?: string}}
     */
    const completeLogin = (userData, accessToken, refreshToken) => {
        try {
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setUser(userData);

            sessionStorage.setItem("access_token", accessToken);
            sessionStorage.setItem("refresh_token", refreshToken);
            sessionStorage.setItem("user", JSON.stringify(userData));

            return { success: true };
        } catch (error) {
            console.error('Failed to store session:', error);
            // Clear any partial state
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            sessionStorage.clear();

            return {
                success: false,
                message: 'Failed to initialize session. Please try again.',
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
     * Check if user has specific role(s)
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
        completeLogin,
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
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};