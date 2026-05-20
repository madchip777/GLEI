import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [tokenExpiry, setTokenExpiry] = useState(null);

    // /!\ Debug

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

    const getTimeLeft = () => {
        if (!tokenExpiry) return null;
        const now = new Date().getTime();
        const timeLeft = Math.max(0, tokenExpiry - now);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // /!\ Debug

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
                {tokenExpiry && (
                    <span style={{
                        fontSize: '0.85rem',
                        opacity: 0.8,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px'
                    }}>
            🔑           Token: {getTimeLeft()}
                    </span>
                )}
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