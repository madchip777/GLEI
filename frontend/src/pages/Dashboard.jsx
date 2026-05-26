import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';
import '../styles/common.css';

/**
 * Dashboard Component
 *
 * Main user dashboard displaying user information and tickets.
 * Accessible to all authenticated users regardless of role.
 *
 * @returns {React.JSX.Element}
 * @component
 */
const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Fetch dashboard data from API
     * Waits for auth initialization to complete
     */
    useEffect(() => {
        // Don't fetch if auth is still loading
        if (authLoading) return;

        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getUserDashboard();
                setDashboardData(response.data.data);
            } catch (err) {
                setError('Erreur lors du chargement du tableau de bord');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [authLoading]);

    // Show loading state
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
                <h1 className="dashboard-title">
                    Tableau de bord - {user?.name}
                </h1>

                {/* User Information Section */}
                <div className="info-section">
                    <h2 className="card-header">Informations utilisateur</h2>
                    <div className="info-item">
                        <span className="info-label">Nom:</span> {dashboardData?.user?.name}
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email:</span> {dashboardData?.user?.email}
                    </div>
                    <div className="info-item">
                        <span className="info-label">Rôle:</span>{' '}
                        <span className="badge badge-primary">
                            {dashboardData?.user?.role}
                        </span>
                    </div>
                </div>

                {/* Tickets Section */}
                <div className="tickets-section">
                    <h2 className="card-header">Mes tickets</h2>

                    {dashboardData?.my_tickets?.length > 0 ? (
                        <div className="grid-gap">
                            {dashboardData.my_tickets.map((ticket) => (
                                <div key={ticket.id} className="list-item">
                                    <div>
                                        <p className="list-item-title">
                                            #{ticket.id} - {ticket.title}
                                        </p>
                                    </div>
                                    <span className={`badge ${
                                        ticket.status === 'ouvert' ? 'badge-danger' : 'badge-warning'
                                    }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="tickets-empty">Aucun ticket pour le moment</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;