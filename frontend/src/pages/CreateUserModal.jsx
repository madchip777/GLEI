import {useEffect, useState} from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { userAPI, hardwareAPI, softwareAPI } from "../services/api.js";
import '../styles/admin.css';

/**
 * CreateUSerModal Component
 *
 * Modal form for creating a new user account.
 * Admin can create users only.
 * Super admin can create admins and users.
 * Allows assigning hardware and software during creation.
 *
 * @param {Function} onClose - Called when modal is closed
 * @param {Function} onCreated - Called after successful creation
 * @component
 */
const CreateUserModal = ({ onClose, onCreated }) => {
    const { user: currentUser } = useAuth();

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [department, setDepartment] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedHardwareIds, setSelectedHardwareIds] = useState([]);
    const [selectedSoftwareIds, setSelectedSoftwareIds] = useState([]);

    // Available equipment
    const [availableHardware, setAvailableHardware] = useState([]);
    const [availableSoftware, setAvailableSoftware] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingEquipment, setLoadingEquipment] = useState(true);
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');

    /**
     * Load available hardware (in_pool) and software
     */
    useEffect(() => {
        const loadEquipment = async () => {
            try {
                const [hwResponse, swResponse] = await Promise.all([
                    hardwareAPI.list({ status: 'in_pool' }),
                    softwareAPI.list({ status: 'active' }),
                ]);
                setAvailableHardware(hwResponse.data.data.hardware);
                setAvailableSoftware(swResponse.data.data.software);
            } catch (error) {
                console.error('Failed to load equipment:', error);
            } finally {
                setLoadingEquipment(false);
            }
        };

        loadEquipment();
    }, []);

    /**
     * Toggle hardware selection
     */
    const toggleHardware = (id) => {
        setSelectedHardwareIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    /**
     * Toggle software selection
     */
    const toggleSoftware = (id) => {
        setSelectedSoftwareIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    /**
     * Submit create user form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setLoading(true);

        try {
            await userAPI.create({
                name,
                email,
                role,
                department: department || undefined,
                job_title: jobTitle || undefined,
                phone: phone || undefined,
                hardware_ids: selectedHardwareIds,
                software_ids: selectedSoftwareIds,
            });

            onCreated();
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setError(err.response?.data?.message || 'Failed to create user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Create New User</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Personal info */}
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="John Doe"
                            required
                            disabled={loading}
                        />
                        {errors.name && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{errors.name[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="john.doe@company.com"
                            required
                            disabled={loading}
                        />
                        {errors.email && <p style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{errors.email[0]}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role *</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="form-select"
                            disabled={loading}
                        >
                            <option value="user">User</option>
                            {currentUser?.role === 'super_admin' && (
                                <option value="admin">Admin</option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="form-input"
                            placeholder="IT, HR, Finance..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="form-input"
                            placeholder="Developer, Manager..."
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input"
                            placeholder="+33 6 12 34 56 78"
                            disabled={loading}
                        />
                    </div>

                    {/* Hardware assignment */}
                    <div className="form-group">
                        <label className="form-label">
                            Assign Hardware
                            <span style={{ fontWeight: 400, color: '#7f8c8d', marginLeft: '0.5rem' }}>
                                (available pool items)
                            </span>
                        </label>
                        {loadingEquipment ? (
                            <p style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Loading...</p>
                        ) : availableHardware.length === 0 ? (
                            <p style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>No hardware available in pool</p>
                        ) : (
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                padding: '0.5rem',
                            }}>
                                {availableHardware.map(hw => (
                                    <label key={hw.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.4rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedHardwareIds.includes(hw.id)}
                                            onChange={() => toggleHardware(hw.id)}
                                            disabled={loading}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>
                                            {hw.brand} {hw.model}
                                            <span style={{ color: '#7f8c8d', marginLeft: '0.5rem' }}>
                                                ({hw.category} — SN: {hw.serial_number})
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Software assignment */}
                    <div className="form-group">
                        <label className="form-label">
                            Assign Software
                            <span style={{ fontWeight: 400, color: '#7f8c8d', marginLeft: '0.5rem' }}>
                                (active licenses)
                            </span>
                        </label>
                        {loadingEquipment ? (
                            <p style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>Loading...</p>
                        ) : availableSoftware.length === 0 ? (
                            <p style={{ color: '#7f8c8d', fontSize: '0.85rem' }}>No software available</p>
                        ) : (
                            <div style={{
                                maxHeight: '150px',
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                padding: '0.5rem',
                            }}>
                                {availableSoftware.map(sw => (
                                    <label key={sw.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.4rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSoftwareIds.includes(sw.id)}
                                            onChange={() => toggleSoftware(sw.id)}
                                            disabled={loading}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>
                                            {sw.name}
                                            <span style={{ color: '#7f8c8d', marginLeft: '0.5rem' }}>
                                                ({sw.category} — v{sw.version || 'N/A'})
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-action secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-action primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserModal;