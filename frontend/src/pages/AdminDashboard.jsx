import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';
import '../styles/common.css'

/**
 * AdminDashboard Component
 *
 * Administrator dashboard with system statistics and user management.
 * Accessible to users with 'admin' or 'super_admin' roles only.
 * Displays:
 * - System statistics (users, tickets, incidents)
 * - User management table
 *
 * @returns {React.JSX.Element}
 * @component
 */
const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Fetch admin dashboard data and user list
     * Makes parallel API calls for better performance
     */
    useEffect(() => {
        // Wait for auth initialization
        if (authLoading) return;

        const fetchData = async () => {
            try {
                const [dashboardResponse, usersResponse] = await Promise.all([
                    dashboardAPI.getAdminDashboard(),
                    dashboardAPI.getAdminUsers(),
                ]);

                setDashboardData(dashboardResponse.data.data);
                setUsers(usersResponse.data.data.users);
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
    if ( authLoading || loading) {
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
                    Tableau de bord Administrateur
                </h1>

                {/* Statistics Cards Grid */}
                <div className="stats-grid">
                    {/* Total Users Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#3498db' }}>
                        <h3 className="stat-card-title">
                            Total Utilisateurs
                        </h3>
                        <p className="stat-card-value">
                            {dashboardData?.stats?.total_users || 0}
                        </p>
                    </div>

                    {/* Active Tickets Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#e74c3c' }}>
                        <h3 className="stat-card-title">Tickets Actifs</h3>
                        <p className="stat-card-value">
                            {dashboardData?.stats?.active_tickets || 0}
                        </p>
                    </div>

                    {/* Pending Incidents Stat */}
                    <div className="stat-card" style={{ backgroundColor: '#f39c12' }}>
                        <h3 className="stat-card-title">Incidents en Attente</h3>
                        <p className="stat-card-value">
                            {dashboardData?.stats?.pending_incidents || 0}
                        </p>
                    </div>
                </div>

                {/* Users Management section */}
                <div className="card">
                    <h2 className="card-header">Gestion des utilisateurs</h2>

                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Rôle</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>
                                        <span className={`badge ${
                                            u.role === 'admin' ? 'badge-danger' : 'badge-primary'
                                        }`}>
                                            {u.role}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;