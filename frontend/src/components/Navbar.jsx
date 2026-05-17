import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav style={{
            backgroundColor: '#2c3e50',
            padding: '1rem 2rem',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>GLEI App</h3>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
                        Dashboard
                    </Link>

                    {user?.role === 'admin' || user?.role === 'super_admin' ? (
                        <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
                            Admin
                        </Link>
                    ) : null}

                    {user?.role === 'super_admin' ? (
                        <Link to="/super-admin" style={{ color: 'white', textDecoration: 'none' }}>
                            Super Admin
                        </Link>
                    ) : null}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span>
          {user?.name} ({user?.role})
        </span>
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
};

export default Navbar;