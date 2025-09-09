import { api, publicApi } from "@/lib/axiosInterceptor";
import { useQuery } from "@tanstack/react-query";

export const useEventData = (event_key) => {
    return useQuery({
        queryKey: ['event', event_key],
        queryFn: async () => {
            const response = await publicApi.get(`/event-detail/${event_key}`);
            return response.data.events;
        },
        enabled: !!event_key,
    });
};

export const getuserBookings = async (id) => {
    const response = await api.get(`/user-bookings/${id}`);
    return response.data
}