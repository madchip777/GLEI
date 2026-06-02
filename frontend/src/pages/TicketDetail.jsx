import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ticketAPI } from "../services/api.js";
import { fetchImageAsBlob, fetchThumbnailAsBlob } from "../services/imageService.js";
import Navbar from "../components/Navbar.jsx";
import '../styles/tickets.css';
import '../styles/common.css';

/**
 * Ticket Detail Page
 *
 * Full ticket view with:
 * - Ticket details (title, description, status, priority)
 * - Message chat history
 * - Message input form with image upload
 * - Status and assignment info
 * - Action buttons (submit, change status)
 *
 * Uses polling for new messages (hybrid real-time approach):
 * - Load full ticket on mount
 * - Poll for new messages every 3 seconds
 *
 * @component
 */
const TicketDetail = () => {
    const {id} = useParams();
    const {user, loading: authLoading} = useAuth();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Message from state
    const [messageContent, setMessageContent] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messageError, setMessageError] = useState('');

    // Image upload state
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Image URL
    const [imageDataUrls, setImageDataUrls] = useState({});

    useEffect(() => {
        return () => {
            selectedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
        };
    }, [selectedImages]);

    /**
     * Fetch ticket details and messages
     */
    const fetchTicket = async () => {
        try {
            const response = await ticketAPI.getTicket(id);
            setTicket(response.data.data.ticket);
            setMessages(response.data.data.ticket.messages || []);
            setError('');
        } catch (err) {
            setError('Failed to load ticket');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Initial load - fetch ticket
     */
    useEffect(() => {
        if (authLoading) return;

        const loadTicket = async () => {
            await fetchTicket();
        };

        loadTicket();
    }, [authLoading, id]);

    /**
     * set up polling for new messages
     * Polls every 3 seconds when user can reply
     */
    useEffect(() => {
        if (!ticket) return;

        // Only poll if user can reply to ticket
        if (ticket.canReply || user?.role === 'admin' || user?.role === 'super_admin') {
            const interval = setInterval(async () => {
                try {
                    const response = await ticketAPI.getTicket(id);
                    const newMessages = response.data.data.ticket.messages || [];

                    // Only update if there are new messages
                    if (newMessages.length > messages.length) {
                        setMessages(newMessages);
                        // Auto-scroll to bottom
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval);
        }

    }, [ticket, id, messages.length, user]);

    /**
     * Auto-scroll to bottom when message change
     */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /**
     * Load image thumbnails securely
     */
    useEffect(() => {
        const loadImages = async () => {
            const urls = {};

            for (const message of messages) {
                if (message.image) {
                    try {
                        const dataUrl = await fetchThumbnailAsBlob(id, message.id);
                        urls[message.id] = dataUrl;
                    } catch (err) {
                        console.error('Failed to load thumbnail:', err);
                    }
                }
            }

            setImageDataUrls(urls);
        };

        if (messages.length > 0) {
            loadImages();
        }
    }, [messages, id]);

    /**
     * Handle image file selection
     */
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setSelectedImages(prev => [...prev, ...newImages]);

        e.target.value = '';
    };

    /**
     * Handle drag and drop for images
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    }

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        const newImages = imageFiles.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
    };

    /**
     * Remove  selected image
     */
    const removeImage = (index) => {
        setSelectedImages(prev => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    }

    /**
     * Send message with optional image
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!messageContent.trim() && selectedImages.length === 0) {
            setMessageError('Please enter a message or select an image');
            return;
        }

        setSendingMessage(true);
        setMessageError('');

        try {
            // Add message
            const messageResponse = await ticketAPI.addMessage(id, messageContent);
            const newMessage = messageResponse.data.data.message;

            // Upload images if any
            for (const image of selectedImages) {
                try {
                    await ticketAPI.uploadImage(id, newMessage.id, image.file);
                } catch (imgError) {
                    console.error('Image upload error:', imgError);
                    setMessageError('Message sent but some images failed to upload');
                }
            }

            // Refresh ticket to get updated messages
            await fetchTicket();

            // Clear form
            setMessageContent('');
            setSelectedImages(prev => {
                prev.forEach(img => URL.revokeObjectURL(img.previewUrl));
                return [];
            });
            setMessageError('');
        } catch (error) {
            setMessageError('Failed to send message');
            console.error(error);
        } finally {
            setSendingMessage(false);
        }
    };

    /**
     * Submit ticket (draft -> open)
     */
    const handleSubmitTicket = async () => {
        try {
            await ticketAPI.submitTicket(id);
            await fetchTicket();
        } catch (error) {
            setError('Failed to submit ticket');
            console.error(error);
        }
    };

    /**
     * View image securely with auth
     */
    /**
     * View original image securely with auth
     */
    const handleViewImage = async (image) => {
        try {
            const dataUrl = await fetchImageAsBlob(id, image.message_id);
            const win = window.open('', '_blank');

            const img = win.document.createElement('img');
            img.src = dataUrl;
            img.style.maxWidth = '100%';

            win.document.body.style.margin = '0';
            win.document.body.style.background = '#111';
            win.document.body.appendChild(img);
        } catch (err) {
            setError('Failed to load image - access denied');
            console.error(err);
        }
    };

    /**
     * Format date/time for display
     */
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        return {
            date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isToday,
        };
    };

    /**
     * Get user initials for avatar
     */
    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '?';
    };

    /**
     * DEBUG: Log values to console
     */
    useEffect(() => {
        if (ticket && user) {
            console.log('=== TICKET DETAIL DEBUG ===');
            console.log('User object:', {
                id: user?.id,
                name: user?.name,
                role: user?.role,
                type_of_id: typeof user?.id
            });
            console.log('Ticket object:', {
                id: ticket.id,
                user_id: ticket.user_id,
                status: ticket.status,
                type_of_user_id: typeof ticket.user_id
            });
            console.log('Condition checks:', {
                is_creator: user?.id === ticket.user_id,
                is_admin: user?.role === 'admin',
                is_super_admin: user?.role === 'super_admin',
                is_not_closed: ticket.status !== 'closed',
                should_show_form: (user?.id === ticket.user_id || user?.role === 'admin' || user?.role === 'super_admin') && ticket.status !== 'closed'
            });
        }
    }, [ticket, user]);

    // Loading state
    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="loading-text">
                    <p>Loading ticket...</p>
                </div>
            </>
        );
    }

    if (error && !ticket) {
        return (
            <>
                <Navbar />
                <div className="error-container">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/tickets')}
                        className="btn btn-primary"
                        style={{ maxWidth: '150px', marginTop: '1rem' }}
                    >
                        Back to Tickets
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container" style={{ maxWidth: '900px' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate('/tickets')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        marginBottom: '1.5rem',
                        padding: 0,
                    }}
                >
                    Back to Tickets
                </button>

                {/* Ticket Header */}
                <div className="ticket-detail-header">
                    <h1 className="ticket-detail-title">
                        #{ticket.id} - {ticket.title}
                    </h1>

                    {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

                    {/* Metadata Grid */}
                    <div className="ticket-detail-meta">
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Status</span>
                            <span className={`status-badge status-${ticket.status}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Priority</span>
                            <span className={`priority-badge priority-${ticket.priority}`}>
                                {ticket.priority}
                            </span>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Category</span>
                            <span className="ticket-meta-value">
                                {ticket.category?.replace('_', ' ') || 'General'}
                            </span>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Created</span>
                            <span className="ticket-meta-value">
                                {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ color: '#34495e', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                            Description
                        </h3>
                        <div className="ticket-description">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ticket-actions">
                        {ticket.status === 'draft' && (
                            <button
                                onClick={handleSubmitTicket}
                                className="ticket-action-btn primary"
                            >
                                Submit Ticket
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/tickets')}
                            className="ticket-action-btn"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Messages Section */}
                <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1rem' }}>Messages</h2>

                    {/* Messages List */}
                    {messages.length > 0 ? (
                        <div className="ticket-messages">
                            <div className="message-list">
                                {messages.map(message => {
                                    const { time} = formatDateTime(message.created_at);
                                    return (
                                        <div key={message.id} className="message-item">
                                            <div className="message-avatar">
                                                {getInitials(message.user?.name)}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-header">
                                                    <div>
                                                        <span className="message-author">
                                                            {message.user?.name || "Unknown USer"}
                                                        </span>
                                                        {message.user?.email && (
                                                            <span className="message-email">
                                                                {message.user.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="message-time">
                                                        {time}
                                                    </span>
                                                </div>
                                                <div className="message-body">
                                                    {message.content}
                                                </div>

                                                {/* Image attachement - if message has an image */}
                                                {message.image && (
                                                    <div className="message-image">
                                                        <img
                                                            src={imageDataUrls[message.id]}
                                                            alt="Attachment"
                                                            className="message-image-thumbnail"
                                                            onClick={() => handleViewImage(message.image)}
                                                            title="Click to view original image"
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '2rem',
                            borderRadius: '8px',
                            textAlign: 'center',
                            color: '#7f8c8d',
                        }}>
                            <p>No messages yet. Start a conversation by adding a message below.</p>
                        </div>
                    )}
                </div>

                {/* Message Form */}
                {(user?.id === ticket.user_id || user?.role === 'admin' || user?.role === 'super_admin') &&
                    ticket.status !== 'closed' && (
                        <div className="message-form" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: '#34495e', marginBottom: '1rem' }}>
                                Add Message
                            </h3>

                            {messageError && <div className="error-alert">{messageError}</div>}

                            <form onSubmit={handleSendMessage}>
                                {/* Message textarea */}
                                <div className="form-group-textarea">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="form-textarea"
                                        disabled={sendingMessage}
                                        maxLength={5000}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                                        {messageContent.length} / 5000 characters
                                    </p>
                                </div>

                                {/* Image upload */}
                                <div className="form-group-textarea">
                                    <label className="form-label">Attach Images</label>
                                    <div
                                        className="image-upload-area"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="image-upload-text">
                                            Drag and drop images here or click to select
                                        </div>
                                        <div className="image-upload-hint">
                                            Max 5MB per image (JPEG, PNG, GIF)
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={handleImageSelect}
                                            className="image-upload-input"
                                        />
                                    </div>

                                    {/* Selected images preview */}
                                    {selectedImages.length > 0 && (
                                        <div className="image-preview">
                                            {selectedImages.map((image, index) => (
                                                <div key={index} className="image-preview-item">
                                                    <img
                                                        src={image.previewUrl}
                                                        alt={`Preview ${index}`}
                                                        className="image-preview-img"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="image-preview-remove"
                                                        title="Remove"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit button */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={sendingMessage || (!messageContent.trim() && selectedImages.length === 0)}
                                        className="form-button form-button-primary"
                                    >
                                        {sendingMessage ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                {/* No reply allowed message */}
                {ticket.status === 'closed' && (
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '1.5rem',
                        borderRadius: '8px',
                        marginTop: '2rem',
                        color: '#7f8c8d',
                        borderLeft: '3px solid #95a5a6',
                    }}>
                        <p>This ticket is closed. You cannot add new messages.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default TicketDetail;