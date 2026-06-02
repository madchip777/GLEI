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

        // Convert blob to data URL for display
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(response.data);
        });
    } catch (error) {
        console.error('Failed to fetch image:', error);
        throw error;
    }
};

/**
 * Fetch thumbnail as blob
 */
export const fetchThumbnailAsBlob = async (ticketId, messageId) => {
    return fetchImageAsBlob(ticketId, messageId);
};