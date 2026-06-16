import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userAPI } from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import CreateUserModal from "./CreateUserModal.jsx";
import '../styles/admin.css';
import '../styles/common.css';

/**
 * UserList PAge
 *
 * Lists all users visible to the current admin/super_admin.
 * Admin sees users only.
 * Super admin sees admins and users.
 *
 * Features:
 * - Search by name or email
 * - Filter by role
 * - Create user modal
 * - Reset password
 * - View user profile
 *
 * @component
 */
const UserList = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [resettingId, setResettingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    /**
     * Fetch users on mount
     */
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.list();
            setUsers(response.data.data.users);
            setError('');
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reset a user's password
     */
    const handleResetPassword = async (userId, userName) => {
        if (!window.confirm(`Reset password for ${userName}? A temporary password will be sent by email.`)) return;

        setResettingId(userId);
        try {
            await userAPI.resetPassword(userId);
            setSuccessMessage(`Password reset for ${userName}. Email sent.`);
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            setError('Failed to reset password');
        } finally {
            setResettingId(null);
        }
    };

    /**
     * Filter users by search and role
     */
    const filteredUsers = users.filter(u => {
        const matchesSearch = !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <>
            <Navbar />
            <div className="dashboard-container">

                {/* Header */}
                <div className="admin-header">
                    <h1>User Management</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Create User
                    </button>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="stat-number">{users.length}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-number">
                            {users.filter(u => u.two_factor_enabled).length}
                        </div>
                        <div className="stat-label">2FA Enabled</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-number">
                            {users.filter(u => u.force_password_change).length}
                        </div>
                        <div className="stat-label">Pending Password Change</div>
                    </div>
                </div>

                {/* Alerts */}
                {error && <div className="error-alert">{error}</div>}
                {successMessage && (
                    <div style={{
                        background: '#d4edda',
                        border: '1px solid #c3e6cb',
                        color: '#155724',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                    }}>
                        ✓ {successMessage}
                    </div>
                )}

                {/* Filters */}
                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-search"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="admin-filter-select"
                    >
                        <option value="">All roles</option>
                        <option value="user">User</option>
                        {currentUser?.role === 'super_admin' && (
                            <option value="admin">Admin</option>
                        )}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-text"><p>Loading users...</p></div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>2FA</th>
                                <th>Hardware</th>
                                <th>Software</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="admin-empty">
                                            <p>No users found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <strong>{u.name}</strong>
                                            {u.force_password_change && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.7rem',
                                                    background: '#fff3cd',
                                                    color: '#856404',
                                                    padding: '1px 6px',
                                                    borderRadius: '10px',
                                                }}>
                                                        Temp password
                                                    </span>
                                            )}
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                                <span className={`role-badge role-${u.role}`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                        </td>
                                        <td>{u.department || '—'}</td>
                                        <td>
                                            {u.two_factor_enabled
                                                ? <span style={{ color: '#27ae60' }}>✓ Active</span>
                                                : <span style={{ color: '#e74c3c' }}>✗ Not set</span>
                                            }
                                        </td>
                                        <td>{u.hardware_count}</td>
                                        <td>{u.software_count}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn-action primary"
                                                    onClick={() => navigate(`/users/${u.id}`)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="btn-action warning"
                                                    onClick={() => handleResetPassword(u.id, u.name)}
                                                    disabled={resettingId === u.id}
                                                >
                                                    {resettingId === u.id ? 'Resetting...' : 'Reset Password'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <CreateUserModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchUsers();
                        setSuccessMessage('User created successfully. Credentials sent by email.');
                        setTimeout(() => setSuccessMessage(''), 4000);
                    }}
                />
            )}
        </>
    );
};

export default UserList;