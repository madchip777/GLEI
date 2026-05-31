import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/navbar.css'

/**
 * Navbar Component
 *
 * Top navigation bar with role-based link visibility.
 * Displays user info and provides logout functionality.
 *
 * @returns {React.JSX.Element|null}
 * @component
 */
const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [tokenExpiry, setTokenExpiry] = useState(null);

    /**
     * Calculate token expiry time (15 minutes from login)
     * Note: In production, decode JWT to get actual expiry
     */
    useEffect(() => {
        // Calculate token expiry (15 minutes from login)
        const accessToken = sessionStorage.getItem('access_token');
        if (accessToken) {
            // In production, you'd decode the JWT to get actual expiry
            // For now, we'll just track 15 minutes from page load
            const expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 minutes
            setTokenExpiry(expiryTime);
        }
    }, []);

    /**
     * Update countdown every second
     */
    useEffect(() => {
        if (!tokenExpiry) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = tokenExpiry - now;

            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [tokenExpiry]);

    /**
     * Calculate remaining time in MM:SS format
     *
     * @returns {string|null} Formatted time or null
     */
    const getTimeLeft = () => {
        if (!tokenExpiry) return null;
        const now = new Date().getTime();
        const timeLeft = Math.max(0, tokenExpiry - now);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    /**
     * Handle user logout
     * Clears session and redirects to login page
     */
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Don't show navbar if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navbar">
            {/* Left section: brand and navigation links */}
            <div className="navbar-left">
                <h3 style={{ margin: 0 }}>GLEI App</h3>

                <div className="navbar-links">
                    <Link to="/dashboard" className="navbar-link">
                        Dashboard
                    </Link>

                    {/* Tickets link - visible to all authenticated users */}
                    <Link to="/tickets" className="navbar-link">
                        🎫 Tickets
                    </Link>

                    {/* Admin link - visible to admin and super_admin */}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link to="/admin" className="navbar-link">
                            Admin
                        </Link>
                    )}

                    {/* Super Admin link - visible to super_admin only */}
                    {user?.role === 'super_admin' && (
                        <Link to="/super-admin" className="navbar-link">
                            Super Admin
                        </Link>
                    )}
                </div>
            </div>

            {/* Right section: USer info and logout */}
            <div className="navbar-right">
                {/* Token expiration countdown */}
                {tokenExpiry && (
                    <span className="navbar-token-timer">
                        Token: {getTimeLeft()}
                    </span>
                )}

                {/* User name and role */}
                <span className="navbar-user">
                    {user?.name} ({user?.role})
                </span>

                {/* Logout button */}
                <button onClick={handleLogout} className="navbar-logout-btn">
                    Déconnexion
                </button>
            </div>
        </nav>
    );
};

export default Navbar;