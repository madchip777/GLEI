import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/admin.css';
import '../styles/common.css';

/**
 * UserProfile Page
 *
 * Shows full user profile including:
 * - Personal information
 * - Assigned hardware
 * - Assigned software
 * - Account status (2FA, password change)
 *
 * @component
 */
const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resetting, setResetting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await userAPI.get(id);
            setUser(response.data.data.user);
            setError('');
        } catch (err) {
            setError('Failed to load user profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!window.confirm(`Reset password for ${user.name}? A temporary password will be sent by email.`)) return;

        setResetting(true);
        try {
            await userAPI.resetPassword(id);
            setSuccessMessage('Password reset successfully. Email sent.');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            setError('Failed to reset password');
        } finally {
            setResetting(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="loading-text"><p>Loading profile...</p></div>
        </>
    );

    if (error && !user) return (
        <>
            <Navbar />
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/users')} className="btn btn-primary">
                    Back to Users
                </button>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="dashboard-container" style={{ maxWidth: '800px' }}>

                {/* Back button */}
                <button
                    onClick={() => navigate('/users')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        padding: 0,
                    }}
                >
                    ← Back to Users
                </button>

                {successMessage && (
                    <div style={{
                        background: '#d4edda',
                        border: '1px solid #c3e6cb',
                        color: '#155724',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                    }}>
                        ✓ {successMessage}
                    </div>
                )}

                {error && <div className="error-alert">{error}</div>}

                {/* Profile Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Avatar */}
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#2c3e50',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                flexShrink: 0,
                            }}>
                                {user.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>
                                    {user.name}
                                </h1>
                                <p style={{ margin: '0.25rem 0 0', color: '#7f8c8d' }}>
                                    {user.job_title || 'No job title'} {user.department ? `— ${user.department}` : ''}
                                </p>
                                <span className={`role-badge role-${user.role}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <button
                            className="btn-action warning"
                            onClick={handleResetPassword}
                            disabled={resetting}
                        >
                            {resetting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>

                    {/* Info grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #f0f0f0',
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Email</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{user.email}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Phone</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 500 }}>{user.phone || '—'}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>2FA Status</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: user.two_factor_enabled ? '#27ae60' : '#e74c3c' }}>
                                {user.two_factor_enabled ? '✓ Active' : '✗ Not configured'}
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>Password Status</p>
                            <p style={{ margin: '0.25rem 0 0', fontWeight: 500, color: user.force_password_change ? '#f39c12' : '#27ae60' }}>
                                {user.force_password_change ? '⚠ Temporary password' : '✓ Password set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hardware */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ color: '#2c3e50', fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>
                        Assigned Hardware ({user.hardware?.length || 0})
                    </h2>

                    {user.hardware?.length === 0 ? (
                        <p style={{ color: '#7f8c8d', margin: 0 }}>No hardware assigned.</p>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Brand / Model</th>
                                    <th>Serial Number</th>
                                    <th>Condition</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {user.hardware.map(hw => (
                                    <tr key={hw.id}>
                                        <td style={{ textTransform: 'capitalize' }}>
                                            {hw.category.replace('_', ' ')}
                                        </td>
                                        <td>{hw.brand} {hw.model}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{hw.serial_number}</td>
                                        <td><span className={`badge badge-${hw.condition}`}>{hw.condition}</span></td>
                                        <td><span className={`badge badge-${hw.status}`}>{hw.status.replace('_', ' ')}</span></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Software */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                    <h2 style={{ color: '#2c3e50', fontSize: '1.1rem', marginTop: 0, marginBottom: '1rem' }}>
                        Assigned Software ({user.software?.length || 0})
                    </h2>

                    {user.software?.length === 0 ? (
                        <p style={{ color: '#7f8c8d', margin: 0 }}>No software assigned.</p>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Version</th>
                                    <th>License Expiry</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {user.software.map(sw => (
                                    <tr key={sw.id}>
                                        <td>{sw.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>
                                            {sw.category.replace('_', ' ')}
                                        </td>
                                        <td>{sw.version || '—'}</td>
                                        <td>{sw.license_expiry
                                            ? new Date(sw.license_expiry).toLocaleDateString('fr-FR')
                                            : '—'}
                                        </td>
                                        <td><span className={`badge badge-${sw.status}`}>{sw.status}</span></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfile;