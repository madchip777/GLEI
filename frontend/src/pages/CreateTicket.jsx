import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ticketAPI } from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import '../styles/tickets.css';
import '../styles/common.css';

/**
 * Create Ticket Page
 *
 * Form for users to create a new support ticket.
 * Ticket is created in 'draft' status.
 * USer can fill in details before submitting.
 *
 * @component
 */
const CreateTicket = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'it_issue',
        priority: 'medium',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    /**
     * Handle form input changes
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setValidationErrors({});
        setLoading(true);

        try {
            // Create ticket
            const response = await ticketAPI.createTicket(formData);

            navigate(`/tickets/${response.data.data.ticket.id}`);
        } catch (error) {
            if (error.response?.data?.errors) {
                setError(error.response.data.errors);
            } else {
                setError('Failed to create ticket. Please try again.')
            }
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="ticket-form">
                    <h2 className="ticket-form-title">Create New Ticket</h2>

                    {error && <div className="error-alert">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="ticket-form-group">
                            <label className="form-label">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Brief summary of your issue"
                                className="form-input-text"
                                maxLength={255}
                                required
                            />
                            {validationErrors.title && (
                                <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    {validationErrors.title[0]}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="ticket-form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide details about your issue..."
                                className="form-textarea"
                                maxLength={5000}
                                required
                            />
                            <p style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                                {formData.description.length} / 5000 characters
                            </p>
                            {validationErrors.description && (
                                <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                    {validationErrors.description[0]}
                                </p>
                            )}
                        </div>

                        {/* Category */}
                        <div className="ticket-form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-input-select"
                            >
                                <option value="it_issue">IT Issue</option>
                                <option value="security_incident">Security Incident</option>
                                <option value="access_request">Access Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="ticket-form-group-last">
                            <label className="form-label">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="form-input-select"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="form-button-group">
                            <button
                                type="button"
                                onClick={() => navigate('/tickets')}
                                className="form-button form-button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="form-button form-button-primary"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span> Creating...
                                    </>
                                ) : (
                                    'Create Ticket (Draft)'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Help text */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        color: '#7f8c8d',
                        borderLeft: '3px solid #3498db',
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                            💡 <strong>Tip:</strong> Your ticket will be saved as a draft.
                        </p>
                        <p style={{ margin: 0 }}>
                            You can add messages and images before submitting it for support.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateTicket;