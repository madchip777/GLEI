import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { passwordAPI } from '../services/api.js';
import '../styles/auth.css';

/**
 * ResetPassword Page
 *
 * Handles password reset via token from email link.
 * Token is extracted from URL query parameter.
 * Validates password requirements client-side.
 *
 * @component
 */
const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    /**
     * Validate password requirements
     */
    const validatePassword = (password) => {
        const issues = [];
        if (password.length < 12) issues.push('At least 12 characters');
        if (!/[A-Z]/.test(password)) issues.push('At least one uppercase letter');
        if (!/[0-9]/.test(password)) issues.push('At least one number');
        if (!/[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/.test(password)) issues.push('At least one special character');
        return issues;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!token) {
            setError('Invalid reset link. Please request a new one.');
            return;
        }

        const passwordIssues = validatePassword(newPassword);
        if (passwordIssues.length > 0) {
            setErrors({ new_password: passwordIssues });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirm: ['Passwords do not match'] });
            return;
        }

        setLoading(true);

        try {
            await passwordAPI.reset(token, newPassword, confirmPassword);
            navigate('/login', {
                state: { message: 'Password reset successfully. You can now log in.' }
            });
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setError(err.response?.data?.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 className="auth-title">Invalid Link</h2>
                    <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                        This reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" style={{ color: '#3498db' }}>
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    const passwordStrength = validatePassword(newPassword);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Enter your new password below.
                </p>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-input"
                            placeholder="New password"
                            required
                            disabled={loading}
                        />

                        {/* Requirements checklist */}
                        {newPassword.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                {[
                                    { test: newPassword.length >= 12, label: 'At least 12 characters' },
                                    { test: /[A-Z]/.test(newPassword), label: 'At least one uppercase letter' },
                                    { test: /[0-9]/.test(newPassword), label: 'At least one number' },
                                    { test: /[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/.test(newPassword), label: 'At least one special character' },
                                ].map(({ test, label }) => (
                                    <p key={label} style={{ fontSize: '0.8rem', margin: '2px 0', color: test ? '#27ae60' : '#e74c3c' }}>
                                        {test ? '✓' : '✗'} {label}
                                    </p>
                                ))}
                            </div>
                        )}

                        {errors.new_password && errors.new_password.map((err, i) => (
                            <p key={i} style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{err}</p>
                        ))}
                    </div>

                    <div className="form-group-last">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Confirm new password"
                            required
                            disabled={loading}
                        />
                        {confirmPassword.length > 0 && (
                            <p style={{ fontSize: '0.8rem', margin: '4px 0', color: newPassword === confirmPassword ? '#27ae60' : '#e74c3c' }}>
                                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}
                        {errors.confirm && errors.confirm.map((err, i) => (
                            <p key={i} style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{err}</p>
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || passwordStrength.length > 0 || newPassword !== confirmPassword}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;