import { Link, useNavigate } from 'react-router-dom';
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
                        Tickets
                    </Link>

                    {/* Settings link - visible to all authenticated users */}
                    <Link to="/settings" className="navbar-link">
                        Settings
                    </Link>

                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <>
                            <Link to="/users" className="navbar-link">Users</Link>
                            <Link to="/hardware" className="navbar-link">Hardware</Link>
                            <Link to="/software" className="navbar-link">Software</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Right section: USer info and logout */}
            <div className="navbar-right">
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