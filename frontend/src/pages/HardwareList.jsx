import { useState, useEffect } from 'react';
import { hardwareAPI, userAPI } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/admin.css';
import '../styles/common.css';

/**
 * HardwareList Page
 *
 * Lists all hardware items with:
 * - Filter by status and category
 * - Create hardware item
 * - Edit hardware item
 * - Assign / unassign to user
 * - Delete (only if unassigned)
 *
 * @component
 */
const HardwareList = () => {
    const [hardware, setHardware] = useState([]);
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
    const [actionLoading, setActionLoading] = useState(false);

    // Form state
    const [form, setForm] = useState({
        category: 'laptop', brand: '', model: '',
        serial_number: '', purchase_date: '',
        condition: 'good', status: 'in_pool', notes: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [hwRes, usersRes] = await Promise.all([
                hardwareAPI.list(),
                userAPI.list(),
            ]);
            setHardware(hwRes.data.data.hardware);
            setUsers(usersRes.data.data.users);
            setError('');
        } catch (err) {
            setError('Failed to load hardware');
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
        setForm({
            category: 'laptop', brand: '', model: '',
            serial_number: '', purchase_date: '',
            condition: 'good', status: 'in_pool', notes: '',
        });
        setFormErrors({});
    };

    /**
     * Create or update hardware item
     */
    const handleSave = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setFormErrors({});

        try {
            if (editItem) {
                await hardwareAPI.update(editItem.id, form);
                showSuccess('Hardware updated successfully');
                setEditItem(null);
            } else {
                await hardwareAPI.create(form);
                showSuccess('Hardware created successfully');
                setShowCreateModal(false);
            }
            resetForm();
            fetchAll();
        } catch (err) {
            const errs = err.response?.data?.errors;
            if (errs) setFormErrors(errs);
            else setError(err.response?.data?.message || 'Failed to save hardware');
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Assign hardware to user
     */
    const handleAssign = async () => {
        if (!assignUserId) return;
        setActionLoading(true);
        try {
            await hardwareAPI.assign(assignItem.id, parseInt(assignUserId));
            showSuccess('Hardware assigned successfully');
            setAssignItem(null);
            setAssignUserId('');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign hardware');
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Unassign hardware
     */
    const handleUnassign = async (hw) => {
        if (!window.confirm(`Unassign ${hw.brand} ${hw.model} and return to pool?`)) return;
        try {
            await hardwareAPI.unassign(hw.id);
            showSuccess('Hardware returned to pool');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unassign hardware');
        }
    };

    /**
     * Delete hardware
     */
    const handleDelete = async (hw) => {
        if (!window.confirm(`Delete ${hw.brand} ${hw.model}? This cannot be undone.`)) return;
        try {
            await hardwareAPI.delete(hw.id);
            showSuccess('Hardware deleted');
            fetchAll();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete hardware');
        }
    };

    const filteredHardware = hardware.filter(hw => {
        const matchesStatus = !statusFilter || hw.status === statusFilter;
        const matchesCategory = !categoryFilter || hw.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });

    const FormFields = ({ disabled }) => (
        <>
            <div className="form-group">
                <label className="form-label">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        className="form-select" disabled={disabled}>
                    {['computer','laptop','monitor','peripheral','mobile_device','printer'].map(c => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Brand *</label>
                <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}
                       className="form-input" placeholder="Dell, Apple, HP..." required disabled={disabled} />
                {formErrors.brand && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{formErrors.brand[0]}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Model *</label>
                <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}
                       className="form-input" placeholder="XPS 15, MacBook Pro..." required disabled={disabled} />
                {formErrors.model && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{formErrors.model[0]}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Serial Number *</label>
                <input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })}
                       className="form-input" placeholder="SN123456" required disabled={disabled} />
                {formErrors.serial_number && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{formErrors.serial_number[0]}</p>}
            </div>
            <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                       className="form-input" disabled={disabled} />
            </div>
            <div className="form-group">
                <label className="form-label">Condition *</label>
                <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                        className="form-select" disabled={disabled}>
                    {['new','good','fair','poor'].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Status *</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                        className="form-select" disabled={disabled}>
                    {['active','in_repair','in_pool','retired'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
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
                    <h1>Hardware Management</h1>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                        + Add Hardware
                    </button>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    {[
                        { label: 'Total', count: hardware.length, filter: '' },
                        { label: 'Active', count: hardware.filter(h => h.status === 'active').length, filter: 'active' },
                        { label: 'In Pool', count: hardware.filter(h => h.status === 'in_pool').length, filter: 'in_pool' },
                        { label: 'In Repair', count: hardware.filter(h => h.status === 'in_repair').length, filter: 'in_repair' },
                        { label: 'Retired', count: hardware.filter(h => h.status === 'retired').length, filter: 'retired' },
                    ].map(({ label, count, filter }) => (
                        <div
                            key={label}
                            className="admin-stat-card"
                            style={{ cursor: 'pointer', border: statusFilter === filter && filter ? '2px solid #3498db' : '2px solid transparent' }}
                            onClick={() => setStatusFilter(statusFilter === filter ? '' : filter)}
                        >
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
                        {['computer','laptop','monitor','peripheral','mobile_device','printer'].map(c => (
                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-filter-select">
                        <option value="">All statuses</option>
                        {['active','in_pool','in_repair','retired'].map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="loading-text"><p>Loading hardware...</p></div>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Brand / Model</th>
                                <th>Serial Number</th>
                                <th>Condition</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredHardware.length === 0 ? (
                                <tr><td colSpan={7}><div className="admin-empty"><p>No hardware found.</p></div></td></tr>
                            ) : filteredHardware.map(hw => (
                                <tr key={hw.id}>
                                    <td style={{ textTransform: 'capitalize' }}>{hw.category.replace('_', ' ')}</td>
                                    <td><strong>{hw.brand}</strong> {hw.model}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{hw.serial_number}</td>
                                    <td><span className={`badge badge-${hw.condition}`}>{hw.condition}</span></td>
                                    <td><span className={`badge badge-${hw.status}`}>{hw.status.replace('_', ' ')}</span></td>
                                    <td>{hw.assigned_user ? hw.assigned_user.name : <span style={{ color: '#7f8c8d' }}>—</span>}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-action secondary" onClick={() => { setForm({ ...hw, purchase_date: hw.purchase_date?.slice(0,10) || '' }); setEditItem(hw); }}>
                                                Edit
                                            </button>
                                            {hw.assigned_user ? (
                                                <button className="btn-action warning" onClick={() => handleUnassign(hw)}>
                                                    Unassign
                                                </button>
                                            ) : hw.status !== 'retired' && (
                                                <button className="btn-action success" onClick={() => { setAssignItem(hw); setAssignUserId(''); }}>
                                                    Assign
                                                </button>
                                            )}
                                            {!hw.assigned_user && (
                                                <button className="btn-action danger" onClick={() => handleDelete(hw)}>
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
                            <h2>Add Hardware</h2>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <FormFields disabled={actionLoading} />
                            <div className="modal-footer">
                                <button type="button" className="btn-action secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-action primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Add Hardware'}
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
                            <h2>Edit Hardware</h2>
                            <button className="modal-close" onClick={() => setEditItem(null)}>×</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <FormFields disabled={actionLoading} />
                            <div className="modal-footer">
                                <button type="button" className="btn-action secondary" onClick={() => setEditItem(null)}>Cancel</button>
                                <button type="submit" className="btn-action primary" disabled={actionLoading}>
                                    {actionLoading ? 'Saving...' : 'Update Hardware'}
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
                            <h2>Assign Hardware</h2>
                            <button className="modal-close" onClick={() => setAssignItem(null)}>×</button>
                        </div>
                        <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
                            Assigning: <strong>{assignItem.brand} {assignItem.model}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Select User *</label>
                            <select
                                value={assignUserId}
                                onChange={e => setAssignUserId(e.target.value)}
                                className="form-select"
                                disabled={actionLoading}
                            >
                                <option value="">Choose a user...</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-action secondary" onClick={() => setAssignItem(null)}>Cancel</button>
                            <button
                                type="button"
                                className="btn-action primary"
                                onClick={handleAssign}
                                disabled={actionLoading || !assignUserId}
                            >
                                {actionLoading ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HardwareList;