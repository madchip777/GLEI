import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ticketAPI, userAPI } from "../services/api.js";
import { fetchThumbnailById } from "../services/imageService.js";
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

    // Admin actions state
    const [admins, setAdmins] = useState([]);
    const [assigningAdmin, setAssigningAdmin] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPriority, setUpdatingPriority] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [joining, setJoining] = useState(false);

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
     * Set up polling for new messages
     * Polls every 3 seconds for all authenticated users on non-draft tickets
     */
    useEffect(() => {
        if (!ticket) return;
        if (ticket.status === 'draft') return;

        const interval = setInterval(async () => {
            try {
                const response = await ticketAPI.getTicket(id);
                const updatedTicket = response.data.data.ticket;
                const newMessages = updatedTicket.messages || [];

                // Update messages if new ones arrived
                if (newMessages.length > messages.length) {
                    setMessages(newMessages);
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }

                // Always update ticket data (status, participants, etc. may have changed)
                setTicket(updatedTicket);

            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000);

        return () => clearInterval(interval);

    }, [ticket?.id, ticket?.status, messages.length]);

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
            const urls = { ...imageDataUrls};
            let hasNewImages = false;

            for (const message of messages) {
                if (message.images && message.images.length > 0) {
                    if (!urls[message.id]) {
                        urls[message.id] = [];
                    }

                    for (const image of message.images) {
                        const alreadyLoaded = urls[message.id].some(u => u.id === image.id);
                        if (alreadyLoaded) continue;

                        try {
                            const dataUrl = await fetchThumbnailById(id, image.id);
                            urls[message.id].push({
                                id: image.id,
                                dataUrl: dataUrl,
                            });
                            hasNewImages = true;
                        } catch (error) {
                            console.error('Failed to load thumbnail', error);
                        }
                    }
                }
            }

            if (hasNewImages) {
                setImageDataUrls(urls);
            }
        };

        if (messages.length > 0) {
            loadImages();
        }
    }, [messages, id]);

    /**
     * Load admins for assignment dropdown
     * Only runs for admin/super_admin users
     */
    useEffect(() => {
        if (user?.role !== 'admin' && user?.role !== 'super_admin') return;

        const loadAdmins = async () => {
            try {
                const response = await userAPI.listAdmins();
                setAdmins(response.data.data.admins);
            } catch (err) {
                console.error('Failed to load admins:', err);
            }
        };

        loadAdmins();
    }, [user]);

    /**
     * Handle image file selection
     */
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const MAX_IMAGES = 5;
        const remainingSlots = MAX_IMAGES - selectedImages.length;

        if (remainingSlots <= 0) {
            setMessageError(`Maximum ${MAX_IMAGES} images per message reached`);
            e.target.value = '';
            return;
        }

        const filesToAdd = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            setMessageError(`Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES} per message)`);
        }

        const newImages = filesToAdd.map(file => ({
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

        const MAX_IMAGES = 5;
        const remainingSlots = MAX_IMAGES - selectedImages.length;

        if (remainingSlots <= 0) {
            setMessageError(`Maximum ${MAX_IMAGES} images per message reached`);
            return;
        }

        const filesToAdd = imageFiles.slice(0, remainingSlots);

        if (imageFiles.length > remainingSlots) {
            setMessageError(`Only ${remainingSlots} more image(s) can be added (max ${MAX_IMAGES} per message)`);
        }

        const newImages = filesToAdd.map(file => ({
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
     * Assign ticket to an admin
     */
    const handleAssign = async () => {
        if (!assigningAdmin) return;
        setAssigning(true);
        try {
            await ticketAPI.assign(id, parseInt(assigningAdmin));
            await fetchTicket();
            setAssigningAdmin('');
        } catch (error) {
            setError(`Failed to assign ticket: ${error}`);
        } finally {
            setAssigning(false);
        }
    };

    /**
     * Update ticket status
     */
    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await ticketAPI.updateStatus(id, newStatus);
            await fetchTicket();
        } catch (error) {
            setError(`Failed to update status: ${error}`);
        } finally {
            setUpdatingStatus(false);
        }
    };

    /**
     * Update ticket priority
     */
    const handlePriorityChange = async (newPriority) => {
        setUpdatingPriority(true);
        try {
            await ticketAPI.updatePriority(id, newPriority);
            await fetchTicket();
        } catch (error) {
            setError(`Failed to update priority: ${error}`);
        } finally {
            setUpdatingPriority(false);
        }
    };

    /**
     * Admin joins ticket as participant
     */
    const handleJoin = async () => {
        setJoining(true);
        try {
            await ticketAPI.join(id);
            await fetchTicket();
        } catch (error) {
            setError(`Failed to join ticket : ${error}`);
        } finally {
            setJoining(false);
        }
    };

    /**
     * View original image securely with auth
     */
    const handleViewImage = async (image) => {
        try {
            const dataUrl = await fetchThumbnailById(id, image.id);
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

    /**
     * Check if current user is already a participant
     */
    const isParticipant = ticket?.participants?.some(p => p.user.id === user?.id);

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
                        background: 'none', border: 'none', color: '#3498db',
                        cursor: 'pointer', fontSize: '0.95rem',
                        marginBottom: '1.5rem', padding: 0,
                    }}
                >
                    ← Back to Tickets
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
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Assigned To</span>
                            <span className="ticket-meta-value">
                            {ticket.assigned_to ? ticket.assigned_to.name : '—'}
                        </span>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="ticket-meta-label">Created By</span>
                            <span className="ticket-meta-value">
                            {ticket.creator?.name || '—'}
                        </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ color: '#34495e', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                            Description
                        </h3>
                        <div className="ticket-description">{ticket.description}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ticket-actions">
                        {ticket.status === 'draft' && (
                            <button onClick={handleSubmitTicket} className="ticket-action-btn primary">
                                Submit Ticket
                            </button>
                        )}
                        <button onClick={() => navigate('/tickets')} className="ticket-action-btn">
                            Close
                        </button>
                    </div>
                </div>

                {/* ===== ADMIN PANEL ===== */}
                {(user?.role === 'admin' || user?.role === 'super_admin') &&
                    ticket.status !== 'draft' &&
                    user?.id !== ticket.user_id && (
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        marginTop: '1.5rem',
                        borderLeft: '4px solid #3498db',
                    }}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
                            Admin Actions
                        </h3>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>

                            {/* Assign */}
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <label style={{ fontSize: '0.8rem', color: '#7f8c8d', display: 'block', marginBottom: '0.4rem' }}>
                                    Assign To
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={assigningAdmin}
                                        onChange={e => setAssigningAdmin(e.target.value)}
                                        style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                        disabled={assigning}
                                    >
                                        <option value="">Select admin...</option>
                                        {admins.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        disabled={!assigningAdmin || assigning}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {assigning ? '...' : 'Assign'}
                                    </button>
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <label style={{ fontSize: '0.8rem', color: '#7f8c8d', display: 'block', marginBottom: '0.4rem' }}>
                                    Change Status
                                </label>
                                <select
                                    value={ticket.status}
                                    onChange={e => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                >
                                    {['open', 'in_progress', 'resolved', 'closed'].map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <label style={{ fontSize: '0.8rem', color: '#7f8c8d', display: 'block', marginBottom: '0.4rem' }}>
                                    Change Priority
                                </label>
                                <select
                                    value={ticket.priority}
                                    onChange={e => handlePriorityChange(e.target.value)}
                                    disabled={updatingPriority}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                >
                                    {['low', 'medium', 'high', 'critical'].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Join */}
                            {!isParticipant && (
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        onClick={handleJoin}
                                        disabled={joining}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: '#27ae60',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        {joining ? 'Joining...' : '+ Join Ticket'}
                                    </button>
                                </div>
                            )}

                            {isParticipant && (
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.85rem', color: '#27ae60', padding: '0.5rem' }}>
                                    You are a participant
                                </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== PARTICIPANTS ===== */}
                {ticket.participants?.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        marginTop: '1.5rem',
                    }}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
                            Participants ({ticket.participants.length})
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {ticket.participants.map(p => (
                                <div key={p.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: '#f8f9fa',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                }}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%',
                                        background: p.role === 'assigned' ? '#3498db' : p.role === 'creator' ? '#2c3e50' : '#95a5a6',
                                        color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem', fontWeight: '700',
                                    }}>
                                        {p.user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <span>{p.user.name}</span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        background: p.role === 'assigned' ? '#cce5ff' : p.role === 'creator' ? '#e2e3e5' : '#d4edda',
                                        color: p.role === 'assigned' ? '#004085' : p.role === 'creator' ? '#383d41' : '#155724',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                    }}>
                                    {p.role}
                                </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== MESSAGES ===== */}
                <div style={{ marginTop: '1.5rem' }}>
                    <h2 style={{ color: '#34495e', marginBottom: '1rem' }}>Messages</h2>

                    {messages.length > 0 ? (
                        <div className="ticket-messages">
                            <div className="message-list">
                                {messages.map(message => {
                                    const { time } = formatDateTime(message.created_at);
                                    return (
                                        <div key={message.id} className="message-item">
                                            <div className="message-avatar">
                                                {getInitials(message.user?.name)}
                                            </div>
                                            <div className="message-content">
                                                <div className="message-header">
                                                    <div>
                                                    <span className="message-author">
                                                        {message.user?.name || 'Unknown User'}
                                                    </span>
                                                        {message.user?.email && (
                                                            <span className="message-email">
                                                            {message.user.email}
                                                        </span>
                                                        )}
                                                    </div>
                                                    <span className="message-time">{time}</span>
                                                </div>
                                                <div className="message-body">{message.content}</div>

                                                {message.images && message.images.length > 0 && (
                                                    <div className="message-images" style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {message.images.map((image, imgIndex) => (
                                                            <div key={image.id} className="message-image" style={{ position: 'relative' }}>
                                                                <img
                                                                    src={imageDataUrls[message.id]?.[imgIndex]?.dataUrl}
                                                                    alt={`Attachment ${imgIndex + 1}`}
                                                                    className="message-image-thumbnail"
                                                                    onClick={() => handleViewImage(image)}
                                                                    title="Click to view original image"
                                                                    style={{ cursor: 'pointer', maxWidth: '150px' }}
                                                                />
                                                            </div>
                                                        ))}
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
                            backgroundColor: '#f8f9fa', padding: '2rem',
                            borderRadius: '8px', textAlign: 'center', color: '#7f8c8d',
                        }}>
                            <p>No messages yet.</p>
                        </div>
                    )}
                </div>

                {/* ===== MESSAGE FORM ===== */}
                {(user?.id === ticket.user_id || user?.role === 'admin' || user?.role === 'super_admin') &&
                    ticket.status !== 'closed' && ticket.status !== 'draft' && (
                        <div className="message-form" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: '#34495e', marginBottom: '1rem' }}>Add Message</h3>

                            {messageError && <div className="error-alert">{messageError}</div>}

                            <form onSubmit={handleSendMessage}>
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

                                <div className="form-group-textarea">
                                    <label className="form-label">Attach Images</label>
                                    <div
                                        className="image-upload-area"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="image-upload-text">Drag and drop images here or click to select</div>
                                        <div className="image-upload-hint">Max 5MB per image (JPEG, PNG, GIF)</div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={handleImageSelect}
                                            className="image-upload-input"
                                        />
                                    </div>

                                    {selectedImages.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <p style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
                                                Selected images: {selectedImages.length}/5
                                            </p>
                                            <div className="image-preview">
                                                {selectedImages.map((image, index) => (
                                                    <div key={index} className="image-preview-item">
                                                        <img src={image.previewUrl} alt={`Preview ${index}`} className="image-preview-img" />
                                                        <button type="button" onClick={() => removeImage(index)}
                                                                className="image-preview-remove" title="Remove">×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

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

                {/* Closed notice */}
                {ticket.status === 'closed' && (
                    <div style={{
                        backgroundColor: '#f8f9fa', padding: '1.5rem',
                        borderRadius: '8px', marginTop: '2rem', color: '#7f8c8d',
                        borderLeft: '3px solid #95a5a6',
                    }}>
                        <p>This ticket is closed. You cannot add new messages.</p>
                    </div>
                )}

                {/* ===== HISTORY ===== */}
                {ticket.history?.length > 0 && (
                    <div style={{
                        background: 'white', borderRadius: '10px',
                        padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        marginTop: '1.5rem', marginBottom: '2rem',
                    }}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
                            History
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {ticket.history.map(h => (
                                <div key={h.id} style={{
                                    display: 'flex', alignItems: 'flex-start',
                                    gap: '0.75rem', padding: '0.5rem 0',
                                    borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem',
                                }}>
                                <span style={{ color: '#7f8c8d', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                    {new Date(h.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                    <span style={{ color: '#2c3e50' }}>
                                    <strong>{h.changed_by?.name || 'System'}</strong>
                                        {' '}
                                        {h.action_type === 'created' && 'created the ticket'}
                                        {h.action_type === 'submitted' && 'submitted the ticket'}
                                        {h.action_type === 'assigned' && `assigned to ${h.new_values?.assigned_to ? admins.find(a => a.id === h.new_values.assigned_to)?.name || 'an admin' : 'unassigned'}`}
                                        {h.action_type === 'status_changed' && `changed status from ${h.old_values?.status?.replace('_', ' ')} to ${h.new_values?.status?.replace('_', ' ')}`}
                                        {h.action_type === 'priority_changed' && `changed priority from ${h.old_values?.priority} to ${h.new_values?.priority}`}
                                        {h.action_type === 'participant_joined' && 'joined as participant'}
                                        {h.action_type === 'closed' && 'closed the ticket'}
                                </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default TicketDetail;