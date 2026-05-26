import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/common.css'

/**
 * PrivateRoute Component
 *
 * Protects routes requiring authentication and/or specific roles.
 * Handles loading state, authentication check, and role-based access.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected component to render
 * @param {string|string[]} props.roles - Required role(s) to access route
 * @component
 */
const PrivateRoute = ({ children, roles }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    /**
     * Show loading state  while checking authentication
     * Prevents flash of login page during auth initialization
     */
    if (loading) {
        return (
            <div className="loading-container">
                <p>Chargement...</p>
            </div>
        );
    }

    /**
     * Redirect to login if not authenticated
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !hasRole(roles)) {
        return (
            <div className="access-denied">
                <h2>Accès refusé</h2>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <p>Rôle requis: {Array.isArray(roles) ? roles.join(', ') : roles}</p>
            </div>
        );
    }

    // User is authenticated and has role
    return children;
};

export default PrivateRoute;