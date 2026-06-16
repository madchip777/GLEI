import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ticketAPI } from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import '../styles/tickets.css';
import '../styles/common.css';

/**
 * Tickets List Page
 *
 * Displays user's tickets in a list.
 * Shows status, priority, category, and creation date.
 * Links to ticket detail view.
 *
 * @component
 */
const Tickets = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState(null);

    /**
     * Fetch user's tickets
     */
    useEffect(() => {
        if (authLoading) return;

        const fetchTickets = async () => {
            try {
                const response = await ticketAPI.listTickets(1);
                setTickets(response.data.data.tickets);
                setPagination(response.data.data.pagination);
            } catch (err) {
                setError('Failed to load tickets');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [authLoading]);

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        });
    };

    /**
     * Format category for display
     */
    const formatCategory = (category) => {
        return category
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Loading state
    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="loading-text">
                    <p>Loading tickets...</p>
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
                <h1 className='dashboard-title'>
                    My Tickets
                </h1>

                {/* Action buttons */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate("/tickets/new")}
                        className="btn btn-primary"
                        style={{ maxWidth: '200px' }}
                    >
                        Create New Ticket
                    </button>
                </div>

                {/* Tickets list */}
                {tickets.length > 0 ? (
                    <div className="ticket-list">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="ticket-item"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                            >
                                <div className="ticket-item-header">
                                    <p className="ticket-item-title">
                                        #{ticket.id} - {ticket.title}
                                    </p>
                                    <div className="ticket-item-meta">
                                        <span className={`status-badge status-${ticket.status}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className={`priority-badge priority-${ticket.priority}`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="ticket-item-category">
                                            {formatCategory(ticket.category || 'general')}
                                        </span>
                                        <span className="ticket-item-date">
                                            {formatDate(ticket.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', color: '#bdc3c7' }}>
                                    →
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">No tickets yet</h3>
                        <p className="empty-state-text">
                            Create your first ticket to get help with an issue
                        </p>
                        <button
                            onClick={() => navigate('/tickets/new')}
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem', maxWidth: '200px' }}
                        >
                            Create Ticket
                        </button>
                    </div>
                )}

                {/* Pagination info */}
                {pagination && (
                    <div style={{
                        marginTop: '2rem',
                        textAlign: 'center',
                        color: '#7f8c8d',
                        fontSize: '0.9rem',
                    }}>
                        Showing {tickets.length} of {pagination.total} tickets
                    </div>
                )}
            </div>
        </>
    );
};

export default Tickets;