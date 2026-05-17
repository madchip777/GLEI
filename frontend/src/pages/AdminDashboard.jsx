import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { dashboardAPI } from '../services/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
                    🛡️ Tableau de bord Administrateur
                </h1>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                }}>
                    <div style={{
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Total Utilisateurs
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.stats?.total_users || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Tickets Actifs
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.stats?.active_tickets || 0}
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#f39c12',
                        color: 'white',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>
                            Incidents en Attente
                        </h3>
                        <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
                            {dashboardData?.stats?.pending_incidents || 0}
                        </p>
                    </div>
                </div>

                {/* Users Table */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1.5rem' }}>
                        Gestion des utilisateurs
                    </h2>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Nom</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#7f8c8d' }}>Rôle</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                <td style={{ padding: '1rem' }}>{u.id}</td>
                                <td style={{ padding: '1rem' }}>{u.name}</td>
                                <td style={{ padding: '1rem' }}>
                    <span style={{
                        backgroundColor: u.role === 'admin' ? '#e74c3c' : '#3498db',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                    }}>
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