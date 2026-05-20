import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        console.log('🔍 Dashboard Debug:', {
            authLoading,
            sessionStorage: {
                access_token: sessionStorage.getItem('access_token'),
                refresh_token: sessionStorage.getItem('refresh_token'),
                user: sessionStorage.getItem('user')
            }
        });

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

    if (authLoading || loading) {
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
                    Tableau de bord - {user?.name}
                </h1>

                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    marginBottom: '2rem',
                }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1rem' }}>
                        Informations utilisateur
                    </h2>
                    <p><strong>Nom:</strong> {dashboardData?.user?.name}</p>
                    <p><strong>Email:</strong> {dashboardData?.user?.email}</p>
                    <p><strong>Rôle:</strong> <span style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                    }}>{dashboardData?.user?.role}</span></p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1rem' }}>
                        Mes tickets
                    </h2>

                    {dashboardData?.my_tickets?.length > 0 ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {dashboardData.my_tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '1rem',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>
                                            #{ticket.id} - {ticket.title}
                                        </p>
                                    </div>
                                    <span style={{
                                        backgroundColor: ticket.status === 'ouvert' ? '#e74c3c' : '#f39c12',
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                    }}>
                    {ticket.status}
                  </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#7f8c8d' }}>Aucun ticket pour le moment</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;