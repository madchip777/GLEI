import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';

const SuperAdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [systemConfig, setSystemConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardResponse, configResponse] = await Promise.all([
                    dashboardAPI.getSuperAdminDashboard(),
                    dashboardAPI.getSuperAdminConfig(),
                ]);

                setDashboardData(dashboardResponse.data.data);
                setSystemConfig(configResponse.data.data);
            } catch (err) {
                setError('Erreur lors du chargement des données');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Chargement...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '2rem' }}>
                    ⚡ Tableau de bord Super Administrateur
                </h1>

                {/* System Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <div style={{
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Total Admins
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.system_stats?.total_admins || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#1abc9c',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Total Utilisateurs
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.system_stats?.total_users || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#27ae60',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Santé Système
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.system_stats?.system_health || 'OK'}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#34495e',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Uptime
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.system_stats?.uptime || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* System Configuration */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1.5rem' }}>
                        Configuration Système
                    </h2>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {systemConfig?.settings && Object.entries(systemConfig.settings).map(([key, value]) => (
                            <div
                                key={key}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                }}
                            >
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {key.replace(/_/g, ' ').toUpperCase()}
                </span>
                                <span style={{ color: '#7f8c8d' }}>
                  {typeof value === 'boolean' ? (value ? '✅ Activé' : '❌ Désactivé') : value}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SuperAdminDashboard;