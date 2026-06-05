import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import '../styles/common.css';

/**
 * Settings Page
 *
 * Currently shows user profile info.
 * TODO: Add password change, 2FA management when admin account creation is built.
 *
 * @component
 */
const Settings = () => {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <div className="dashboard-container" style={{ maxWidth: '600px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '2rem' }}>Settings</h1>

                <div className="card">
                    <h2 style={{ color: '#34495e', marginBottom: '1rem', fontSize: '1.1rem' }}>
                        Profile
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Name</span>
                            <p style={{ color: '#2c3e50', margin: 0 }}>{user?.name}</p>
                        </div>
                        <div>
                            <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Email</span>
                            <p style={{ color: '#2c3e50', margin: 0 }}>{user?.email}</p>
                        </div>
                        <div>
                            <span style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Role</span>
                            <p style={{ color: '#2c3e50', margin: 0, textTransform: 'capitalize' }}>
                                {user?.role?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '1rem' }}>
                    <h2 style={{ color: '#34495e', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Two-Factor Authentication
                    </h2>
                    <p style={{ color: '#27ae60', fontSize: '0.9rem', margin: 0 }}>
                        ✓ 2FA is active on your account
                    </p>
                </div>
            </div>
        </>
    );
};

export default Settings;