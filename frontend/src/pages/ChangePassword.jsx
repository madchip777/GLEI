import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { passwordAPI } from '../services/api.js';
import '../styles/auth.css';

/**
 * ChangePassword Page
 *
 * Shown when force_password_change is true.
 * User cannot navigate away until password is changed.
 *
 * Password requirements:
 * - Minimum 12 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 * - Cannot reuse current password
 *
 * @component
 */
const ChangePassword = () => {
    const navigate = useNavigate();
    const { user, completeLogin, accessToken, refreshToken } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    /**
     * Validate password requirements client-side
     */
    const validatePassword = (password) => {
        const issues = [];
        if (password.length < 12) issues.push('At least 12 characters');
        if (!/[A-Z]/.test(password)) issues.push('At least one uppercase letter');
        if (!/[0-9]/.test(password)) issues.push('At least one number');
        if (!/[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/.test(password)) issues.push('At least one special character');
        return issues;
    };

    /**
     * Handle password change form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        // Client-side validation
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
            const response = await passwordAPI.change(
                currentPassword,
                newPassword,
                confirmPassword
            );

            if (response.data.success) {
                // Update user in context with force_password_change = false
                const updatedUser = response.data.data.user;

                const result = completeLogin(updatedUser, accessToken, refreshToken);
                if (result.success) {
                    navigate('/dashboard');
                } else {
                    setError(result.message)
                }

            }
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setError(err.response?.data?.message || 'Failed to change password.');
            }
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = validatePassword(newPassword);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <h2 className="auth-title">Change Password</h2>

                {user?.force_password_change && (
                    <div style={{
                        background: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        color: '#856404',
                    }}>
                        You must change your password before continuing.
                    </div>
                )}

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Current password */}
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="form-input"
                            placeholder="Your current password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* New password */}
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

                        {/* Password requirements checklist */}
                        {newPassword.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                {[
                                    { test: newPassword.length >= 12, label: 'At least 12 characters' },
                                    { test: /[A-Z]/.test(newPassword), label: 'At least one uppercase letter' },
                                    { test: /[0-9]/.test(newPassword), label: 'At least one number' },
                                    { test: /[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/.test(newPassword), label: 'At least one special character' },
                                ].map(({ test, label }) => (
                                    <p key={label} style={{
                                        fontSize: '0.8rem',
                                        margin: '2px 0',
                                        color: test ? '#27ae60' : '#e74c3c',
                                    }}>
                                        {test ? 'V' : 'X'} {label}
                                    </p>
                                ))}
                            </div>
                        )}

                        {errors.new_password && errors.new_password.map((err, i) => (
                            <p key={i} style={{ color: '#e74c3c', fontSize: '0.8rem', margin: '2px 0' }}>{err}</p>
                        ))}
                    </div>

                    {/* Confirm password */}
                    <div className="form-group-last">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Confirm new password"
                            required
                            disabled={loading}
                        />
                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '4px' }}>
                                Passwords do not match
                            </p>
                        )}
                        {confirmPassword.length > 0 && newPassword === confirmPassword && (
                            <p style={{ color: '#27ae60', fontSize: '0.8rem', marginTop: '4px' }}>
                                ✓ Passwords match
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
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;