import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedAccessToken = sessionStorage.getItem("access_token");
                const storedRefreshToken = sessionStorage.getItem("refresh_token");
                const storedUser = sessionStorage.getItem('user');

                console.log('Initializing auth:', {
                    storedAccessToken,
                    storedRefreshToken,
                    storedUser
                }); // Debug log

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

    // Login function
    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);

            if (response.data.success) {
                const { access_token, refresh_token, user } = response.data.data;

                console.log('Login successful:', {
                    access_token: access_token.substring(0, 15) + '...',
                    refresh_token: refresh_token.substring(0, 15) + '...',
                    user: user
                }); // Debug log

                setAccessToken(access_token);
                setRefreshToken(refresh_token);
                setUser(user);

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

    // Logout function
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            sessionStorage.clear();
        }
    };

    // Check if user has specific role
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

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

// Custom hook to use auth context
export const  useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};