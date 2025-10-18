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