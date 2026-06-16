import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext.jsx";
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';
import '../styles/common.css';

/**
 * SuperAdminDashboard Component
 *
 * Super administrator dashboard with system-wide statistics and configuration.
 * Accessible to users with 'super_admin' role only.
 * Displays:
 * - System health metrics
 * - Admin and user counts
 * - System configuration settings
 *
 * @component
 */
const SuperAdminDashboard = () => {
    const { loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [systemConfig, setSystemConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Fetch super admin dashboard data and system configuration
     * Makes parallel API calls for better performance
     */
    useEffect(() => {
        // Wait for auth initialization
        if (authLoading) return;

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
    }, [authLoading]);

    // Loading state
    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="loading-text">
                    <p>Chargement...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="error-container">
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <h1 className="dashboard-subtitle">
                    Tableau de bord Super Administrateur
                </h1>

                {/* System Statistics Cards Grid */}
                <div className="stats-grid">
                    {/* Total Admins Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#9b59b6' }}>
                        <h3 className="stat-card-title">Total Admins</h3>
                        <p className="stat-card-value">
                            {dashboardData?.system_stats?.total_admins || 0}
                        </p>
                    </div>

                    {/* Total Users Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#1abc9c' }}>
                        <h3 className="stat-card-title">Total Utilisateurs</h3>
                        <p className="stat-card-value">
                            {dashboardData?.system_stats?.total_users || 0}
                        </p>
                    </div>

                    {/* System Health Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#27ae60' }}>
                        <h3 className="stat-card-title">Santé Système</h3>
                        <p className="stat-card-value">
                            {dashboardData?.system_stats?.system_health || 'OK'}
                        </p>
                    </div>

                    {/* System Uptime Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#34495e' }}>
                        <h3 className="stat-card-title">Uptime</h3>
                        <p className="stat-card-value">
                            {dashboardData?.system_stats?.uptime || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* System Configuration Section */}
                <div className="card">
                    <h2 className="card-header">Configuration Système</h2>

                    <div className="grid-gap">
                        {systemConfig?.settings && Object.entries(systemConfig.settings).map(([key, value]) => (
                            <div key={key} className="settings-item">
                                <span className="settings-key">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </span>
                                <span className="settings-value">
                                    {typeof value === 'boolean'
                                        ? (value ? 'Activé' : 'Désactivé')
                                        : value
                                    }
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