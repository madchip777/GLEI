import axios from 'axios';

/**
 * Fetch image with authentication
 * Returns blob URL for display
 */
export const fetchImageAsBlob = async (ticketId, messageId) => {
    try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('access_token');

        const response = await axios.get(
            `http://localhost:8000/api/tickets/${ticketId}/messages/${messageId}/image/view`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            }
        );

        // Create temporary blob URL
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error('Failed to fetch image:', error);
        throw error;
    }
};