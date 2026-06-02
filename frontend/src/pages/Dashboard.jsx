import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {dashboardAPI, ticketAPI} from '../services/api';
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
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [userTickets, setUserTickets] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketsLoading, setTicketsLoading] = useState(false);
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

    /**
     * Fetch user tickets on mount
     */
    useEffect(() => {
        if (authLoading || !user) return;

        const fetchTickets = async () => {
            try {
                setTicketsLoading(true);
                const response = await ticketAPI.listTickets();
                setUserTickets(response.data.data.tickets || []);
            } catch (error) {
                console.error('Failed to load tickets: ', error);
            } finally {
                setTicketsLoading(false);
            }
        };

        fetchTickets();
    }, [authLoading, user])

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
                <div className="info-section">
                    <h2 style={{ marginBottom: '1.5rem' }}>Your Recent Tickets</h2>

                    {ticketsLoading ? (
                        <p className="loading-text">Loading tickets...</p>
                    ) : userTickets.length > 0 ? (
                        <div className="ticket-list">
                            {userTickets.slice(0, 5).map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="ticket-item"
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>
                                            #{ticket.id} - {ticket.title}
                                        </h4>
                                        <p style={{ margin: '0 0 0.75rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                                            {ticket.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span className={`status-badge status-${ticket.status}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`priority-badge priority-${ticket.priority}`}>
                                                {ticket.priority}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: '#95a5a6' }}>
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#7f8c8d' }}>No tickets yet. <a href="/tickets/new">Create one</a></p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;