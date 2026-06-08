import { useState, useEffect } from 'react';
import { softwareAPI, userAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/admin.css';
import '../styles/common.css';

/**
 * SoftwareList Page
 *
 * Lists all software licenses with:
 * - Filter by status and category
 * - Create software license
 * - Edit software license
 * - Assign / unassign to user
 * - Delete (only if not assigned)
 *
 * @component
 */
const SoftwareList = () => {
    const [software, setSoftware] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [assignItem, setAssignItem] = useState(null);
    const [assignUserId, setAssignUserId] = useState('');
    const [unassignItem, setUnassignItem] = useState(null);
    const [unassignUserId, setUnassignUserId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [form, setForm] = useState({
        name: '', category: 'os', version: '',
        license_key: '', license_expiry: '',
        status: 'active', notes: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [swRes, usersRes] = await Promise.all([
                softwareAPI.list(),
                userAPI.list(),
            ]);
            setSoftware(swRes.data.data.software);
            setUsers(usersRes.data.data.users);
            setError('');
        } catch (err) {
            setError('Failed to load software');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 4000);
    };

    const resetForm = () => {
        setForm({ name: '', category: 'os', version: '', license_key: '', license_expiry: '', status: 'active', notes: '' });
        setFormErrors({});
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setFormErrors({});

        try {
            if (editItem) {
                await softwareAPI.update(editItem.id, form);
                showSuccess('Software updated successfully');
                setEditItem(null);
            } else {
                await softwareAPI.create(form);
                showSuccess('Software created successfully');
                setShowCreateModal(false);
            }
            resetForm();
            fetchAll();
        } catch (err) {
            const errs = err.response?.data?.errors;
            if (errs) setFormErrors(errs);
            else setError(err.response?.data?.message || 'Failed to save software');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!assignUserId) return;
        setActionLoading(true);
        try {
            await softwareAPI.assign(assignItem.id, parseInt(assignUserId));
            showSuccess('Software assigned successfully');
            setAssignItem(null);
            setAssignUserId('');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign software');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassign = async () => {
        if (!unassignUserId) return;
        setActionLoading(true);
        try {
            await softwareAPI.unassign(unassignItem.id, parseInt(unassignUserId));
            showSuccess('Software unassigned successfully');
            setUnassignItem(null);
            setUnassignUserId('');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unassign software');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (sw) => {
        if (!window.confirm(`Delete ${sw.name}? This cannot be undone.`)) return;
        try {
            await softwareAPI.delete(sw.id);
            showSuccess('Software deleted');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete software');
        }
    };

    const filteredSoftware = software.filter(sw => {
        const matchesStatus = !statusFilter || sw.status === statusFilter;
        const matchesCategory = !categoryFilter || sw.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });

    const FormFields = ({ disabled }) => (
        <>
            <div className="form-group">
                <label className="form-label">Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                       className="form-input" placeholder="Microsoft Office 365" required disabled={disabled} />
                {formErrors.name && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{formErrors.name[0]}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        className="form-select" disabled={disabled}>
                    {['os','office_suite','antivirus','business'].map(c => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Version</label>
                <input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })}
                       className="form-input" placeholder="2024" disabled={disabled} />
            </div>
            <div className="form-group">
                <label className="form-label">License Key</label>
                <input value={form.license_key} onChange={e => setForm({ ...form, license_key: e.target.value })}
                       className="form-input" placeholder="XXXXX-XXXXX-XXXXX" disabled={disabled} />
            </div>
            <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input type="date" value={form.license_expiry} onChange={e => setForm({ ...form, license_expiry: e.target.value })}
                       className="form-input" disabled={disabled} />
            </div>
            <div className="form-group">
                <label className="form-label">Status *</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className="form-select" disabled={disabled}>
                    {['active','expired','retired'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                          className="form-input" rows={2} disabled={disabled} />
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="admin-header">
                    <h1>Software Management</h1>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                        + Add Software
                    </button>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    {[
                        { label: 'Total', count: software.length },
                        { label: 'Active', count: software.filter(s => s.status === 'active').length },
                        { label: 'Expired', count: software.filter(s => s.status === 'expired').length },
                        { label: 'Retired', count: software.filter(s => s.status === 'retired').length },
                    ].map(({ label, count }) => (
                        <div key={label} className="admin-stat-card">
                            <div className="stat-number">{count}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    ))}
                </div>

                {error && <div className="error-alert">{error}</div>}
                {successMessage && (
                    <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                        ✓ {successMessage}
                    </div>
                )}

                {/* Filters */}
                <div className="admin-filters">
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="admin-filter-select">
                        <option value="">All categories</option>
                        {['os','office_suite','antivirus','business'].map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-select">
                        <option value="">All statuses</option>
                        {['active','expired','retired'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-text"><p>Loading software...</p></div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Version</th>
                                <th>License Expiry</th>
                                <th>Status</th>
                                <th>Assigned Users</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredSoftware.length === 0 ? (
                                <tr><td colSpan={7}><div className="admin-empty"><p>No software found.</p></div></td></tr>
                            ) : filteredSoftware.map(sw => (
                                <tr key={sw.id}>
                                    <td><strong>{sw.name}</strong></td>
                                    <td style={{ textTransform: 'capitalize' }}>{sw.category.replace('_', ' ')}</td>
                                    <td>{sw.version || '—'}</td>
                                    <td>{sw.license_expiry
                                        ? new Date(sw.license_expiry).toLocaleDateString('fr-FR')
                                        : '—'}
                                    </td>
                                    <td><span className={`badge badge-${sw.status}`}>{sw.status}</span></td>
                                    <td>
                                        {sw.users?.length > 0
                                            ? sw.users.map(u => u.name).join(', ')
                                            : <span style={{ color: '#7f8c8d' }}>—</span>
                                        }
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-action secondary"
                                                    onClick={() => { setForm({ ...sw, license_expiry: sw.license_expiry?.slice(0,10) || '' }); setEditItem(sw); }}>
                                                Edit
                                            </button>
                                            {sw.status !== 'retired' && (
                                                <button className="btn-action success"
                                                        onClick={() => { setAssignItem(sw); setAssignUserId(''); }}>
                                                    Assign
                                                </button>
                                            )}
                                            {sw.users?.length > 0 && (
                                                <button className="btn-action warning"
                                                        onClick={() => { setUnassignItem(sw); setUnassignUserId(''); }}>
                                                    Unassign
                                                </button>
                                            )}
                                            {sw.users?.length === 0 && (
                                                <button className="btn-action danger" onClick={() => handleDelete(sw)}>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Add Software</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <FormFields disabled={actionLoading} />
                            <div className="modal-footer">
                                <button type="button" className="btn-action secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-action primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Add Software'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editItem && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditItem(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Edit Software</h2>
                            <button className="modal-close" onClick={() => setEditItem(null)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <FormFields disabled={actionLoading} />
                            <div className="modal-footer">
                                <button type="button" className="btn-action secondary" onClick={() => setEditItem(null)}>Cancel</button>
                                <button type="submit" className="btn-action primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Update Software'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {assignItem && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignItem(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Assign Software</h2>
                            <button className="modal-close" onClick={() => setAssignItem(null)}>×</button>
                        </div>
                        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
                            Assigning: <strong>{assignItem.name}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Select User *</label>
                            <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)}
                                    className="form-select" disabled={actionLoading}>
                                <option value="">Choose a user...</option>
                                {users.filter(u => !assignItem.users?.find(au => au.id === u.id)).map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-action secondary" onClick={() => setAssignItem(null)}>Cancel</button>
                            <button type="button" className="btn-action primary" onClick={handleAssign}
                                    disabled={actionLoading || !assignUserId}>
                                {actionLoading ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unassign Modal */}
            {unassignItem && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setUnassignItem(null)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Unassign Software</h2>
                            <button className="modal-close" onClick={() => setUnassignItem(null)}>×</button>
                        </div>
                        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
                            Unassigning: <strong>{unassignItem.name}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Select User to Unassign *</label>
                            <select value={unassignUserId} onChange={e => setUnassignUserId(e.target.value)}
                                    className="form-select" disabled={actionLoading}>
                                <option value="">Choose a user...</option>
                                {unassignItem.users?.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-action secondary" onClick={() => setUnassignItem(null)}>Cancel</button>
                            <button type="button" className="btn-action warning" onClick={handleUnassign}
                                    disabled={actionLoading || !unassignUserId}>
                                {actionLoading ? 'Unassigning...' : 'Unassign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SoftwareList;