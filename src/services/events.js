import { api, publicApi } from "@/lib/axiosInterceptor";
import { useQuery } from "@tanstack/react-query";

export const useEventData = (event_key) => {
    return useQuery({
        queryKey: ['event', event_key],
        queryFn: async () => {
            const response = await publicApi.get(`/event-detail/${event_key}`);
            return response.data.event;
        },
        enabled: !!event_key,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
    });
};

export const getuserBookings = async (id) => {
    const response = await api.get(`/user-bookings/${id}`);
    return response.data
}

/**
 * Fetch user bookings with pagination and filters
 * @param {string} userId - User ID
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 15)
 * @param {string} search - Search query
 * @param {string} startDate - Start date for filtering (YYYY-MM-DD)
 * @param {string} endDate - End date for filtering (YYYY-MM-DD)
 * @returns {Promise} Response with bookings and pagination data
 */
export const getUserBookingsPaginated = async ({
    userId,
    page = 1,
    perPage = 15,
    search = '',
    startDate = '',
    endDate = ''
}) => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (search?.trim()) {
        params.append('search', search.trim());
    }

    if (startDate) {
        params.append('start_date', startDate);
    }

    if (endDate) {
        params.append('end_date', endDate);
    }

    const response = await api.get(`/user-bookings/${userId}?${params.toString()}`);
    return response.data;
}