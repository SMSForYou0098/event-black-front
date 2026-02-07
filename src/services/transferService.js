import { api, publicApi } from '@/lib/axiosInterceptor';

/**
 * Look up a user by phone number
 * @param {string} phoneNumber - Phone number to search
 * @returns {Promise<{status: boolean, user?: object, message: string}>}
 */
export const getUserByPhone = async (phoneNumber) => {
    try {
        const response = await api.get(`user-from-number/${phoneNumber}`);
        return response.data;
    } catch (error) {
        // Return standardized error response
        return {
            status: false,
            message: error.response?.data?.message || 'User not found'
        };
    }
};

/**
 * Create a new user for transfer
 * @param {object} userData - { name, phone }
 * @returns {Promise<{status: boolean, user?: object, message: string}>}
 */
export const createTransferUser = async (userData) => {
    try {
        const response = await api.post('create-user', userData);
        return response.data;
    } catch (error) {
        return {
            status: false,
            message: error.response?.data?.message || 'Failed to create user'
        };
    }
};

/**
 * Transfer booking to another user
 * @param {object} payload - { is_master, booking_id, transfer_from, transfer_to, hash_key }
 * @returns {Promise<{status: boolean, message: string}>}
 */
export const transferBooking = async (payload) => {
    try {
        const response = await api.post('bookings/transfer', payload);
        return response.data;
    } catch (error) {
        return {
            status: false,
            message: error.response?.data?.message || 'Failed to transfer booking'
        };
    }
};
