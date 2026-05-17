import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = sessionStorage.getItem('auth_token');
                const storedUser = sessionStorage.getItem('user');

                console.log('Initializing auth:', { storedToken, storedUser }); // Debug log

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user');
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
                const { token, user } = response.data.data;

                console.log('Login successful:', { token, user }); // Debug log

                setToken(token);
                setUser(user);

                sessionStorage.setItem("auth_token", token);
                sessionStorage.setItem("user", JSON.stringify(user));

                console.log('Stored in sessionStorage:', {
                    token: sessionStorage.getItem('auth_token'),
                    user: sessionStorage.getItem('user')
                }); // Debug log

                return{ success: true };
            }
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
            setToken(null);
            setUser(null);
            sessionStorage.removeItem("auth_token");
            sessionStorage.removeItem("user");
        }
    };

    // Chack if user has specific role
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
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