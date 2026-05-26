import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/auth.css'

/**
 * Login Component
 *
 * Handles user authentification wih email and password.
 * Supports three user roles: user, admin and super_admin.
 * Automatically redirects authenticated users to dashboard.
 *
 * @returns {React.JSX.Element}
 * @component
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    /**
     * Redirects to dashboard if user is already authenticated
     */
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    /**
     * Handle login form submission
     *
     * @param {Event} e - Form submission event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message || 'Identifiants incorrects');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">
                    Connexion
                </h2>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                            placeholder="admin@company.com"
                        />
                    </div>

                    <div className="form-group-last">
                        <label className="form-label">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                            placeholder="mot de passe"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                {/* Test accounts for development/ demo */}
                <div className="test-accounts">
                    <p className="test-accounts-title">
                        Comptes de test:
                    </p>
                    <p className="test-account-item">
                        👤 User: user@company.com / password123
                    </p>
                    <p className="test-account-item">
                        🛡️ Admin: admin@company.com / password123
                    </p>
                    <p className="test-account-item">
                        ⚡ Super Admin: superadmin@company.com / password123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;