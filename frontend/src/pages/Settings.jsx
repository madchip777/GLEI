import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/admin.css';
import '../styles/common.css';

/**
 * Settings Page
 *
 * Shows current user's profile and assigned equipment.
 * Accessible to all authenticated users.
 *
 * @component
 */
const Settings = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await userAPI.profile();
            setProfile(response.data.data.user);
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div className="loading-text"><p>Loading profile...</p></div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="dashboard-container" style={{ maxWidth: '700px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '2rem' }}>Settings</h1>

                {error && <div className="error-alert">{error}</div>}

                {/* Profile card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ color: '#34495e', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        Profile
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { label: 'Name', value: profile?.name },
                            { label: 'Email', value: profile?.email },
                            { label: 'Role', value: profile?.role?.replace('_', ' ') },
                            { label: 'Department', value: profile?.department || '—' },
                            { label: 'Job Title', value: profile?.job_title || '—' },
                            { label: 'Phone', value: profile?.phone || '—' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>{label}</p>
                                <p style={{ margin: '0.25rem 0 0', fontWeight: 500, textTransform: 'capitalize' }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ color: '#34495e', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        Security
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem' }}>Two-Factor Authentication</span>
                            <span style={{ color: '#27ae60', fontWeight: 500 }}>✓ Active</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem' }}>Password Status</span>
                            <span style={{ color: '#27ae60', fontWeight: 500 }}>✓ Set</span>
                        </div>
                    </div>
                </div>

                {/* Hardware card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{ color: '#34495e', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        My Hardware ({profile?.hardware?.length || 0})
                    </h2>
                    {profile?.hardware?.length === 0 ? (
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
                                </tr>
                                </thead>
                                <tbody>
                                {profile?.hardware?.map(hw => (
                                    <tr key={hw.id}>
                                        <td style={{ textTransform: 'capitalize' }}>{hw.category.replace('_', ' ')}</td>
                                        <td>{hw.brand} {hw.model}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{hw.serial_number}</td>
                                        <td><span className={`badge badge-${hw.condition}`}>{hw.condition}</span></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Software card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                    <h2 style={{ color: '#34495e', marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                        My Software ({profile?.software?.length || 0})
                    </h2>
                    {profile?.software?.length === 0 ? (
                        <p style={{ color: '#7f8c8d', margin: 0 }}>No software assigned.</p>
                    ) : (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Version</th>
                                    <th>Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {profile?.software?.map(sw => (
                                    <tr key={sw.id}>
                                        <td>{sw.name}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{sw.category.replace('_', ' ')}</td>
                                        <td>{sw.version || '—'}</td>
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

export default Settings;