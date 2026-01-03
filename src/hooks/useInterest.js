import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";

/**
 * Get current user's interests
 */
export const useMyInterests = (eventId, userId) => {
    return useQuery({
        queryKey: ["my-interests", eventId],
        queryFn: async () => {
            const res = await api.get(`/interests/event/${eventId}`);
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Toggle interest on an event
 */
export const useToggleInterest = () => {
    return useMutation({
        mutationFn: async ({ eventId }) => {
            const res = await api.post("/interests/toggle", {
                interestable_id: eventId,
                interestable_type: "event",
            });
            return res.data;
        },
    });
};
