import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch a specific image by image ID
 * Secure: token only sent via Authorization header
 */
const fetchImageById = async (ticketId, imageId) => {
    const token = sessionStorage.getItem('access_token');

    const response = await axios.get(
        `${BASE_URL}/tickets/${ticketId}/images/${imageId}/view`,
        {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
        }
    );

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(response.data);
    });
}

/**
 * Fetch thumbnail by image ID
 */
export const fetchThumbnailById = async (ticketId, imageId) => {
    return fetchImageById(ticketId, imageId);
};