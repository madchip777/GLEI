import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const PrivateRoute = ({ children, roles }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    // CRITICAL: Wait for auth initialization to complete
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#2c3e50'
            }}>
                <p>Chargement...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !hasRole(roles)) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Accès refusé</h2>
                <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                <p>Rôle requis: {Array.isArray(roles) ? roles.join(', ') : roles}</p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;