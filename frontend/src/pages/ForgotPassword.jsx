import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordAPI } from '../services/api.js';
import '../styles/auth.css';

/**
 * ForgotPassword Page
 *
 * Self-service password reset request.
 * User enters email, receives reset link via email.
 * Always shows success to prevent email enumeration.
 *
 * @component
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await passwordAPI.forgot(email);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                    <h2 className="auth-title">Check your email</h2>
                    <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                        If an account exists for <strong>{email}</strong>,
                        a password reset link has been sent. Check your inbox.
                    </p>
                    <p style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        The link expires in 60 minutes.
                    </p>
                    <Link to="/login" style={{ color: '#3498db', textDecoration: 'none' }}>
                        ← Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Forgot Password</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enter your email address and we'll send you a reset link.
                </p>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;