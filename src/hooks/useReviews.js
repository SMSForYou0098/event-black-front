import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axiosInterceptor";

/**
 * Fetch reviews for an event with infinite scrolling
 * @param {number|string} eventId - The event ID
 */
export const useEventReviews = (eventId) => {
    return useInfiniteQuery({
        queryKey: ["reviews", "event", eventId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await api.get("/reviews", {
                params: {
                    reviewable_id: eventId,
                    reviewable_type: "event",
                    page: pageParam,
                },
            });
            return res.data;
        },
        getNextPageParam: (lastPage) => {
            // Check if there are more pages based on the API response structure
            if (lastPage?.data?.current_page < lastPage?.data?.last_page) {
                return lastPage?.data?.current_page + 1;
            }
            return undefined;
        },
        enabled: !!eventId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Create a new review
 */
/**
 * Create a new review
 */
export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, rating, review }) => {
            const res = await api.post("/reviews", {
                reviewable_id: eventId,
                reviewable_type: "event",
                rating,
                review,
            });
            return res.data;
        },
        onSuccess: (newReview, variables) => {
            // Invalidate and refetch to get the complete data with user info
            queryClient.invalidateQueries({
                queryKey: ["reviews", "event", variables.eventId]
            });
        },
    });
};

/**
 * Update an existing review
 */
export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId, eventId, rating, review }) => {
            const res = await api.put(`/reviews/${reviewId}`, {
                rating,
                review,
            });
            return res.data;
        },
        onSuccess: (updatedReview, variables) => {
            queryClient.setQueryData(["reviews", "event", variables.eventId], (oldData) => {
                if (!oldData) return oldData;

                const reviewToUpdate = updatedReview.data || updatedReview;

                // Update the review in page.data array (data is an array directly)
                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    data: (page.data || []).map((r) =>
                        r.id === variables.reviewId ? { ...r, ...reviewToUpdate } : r
                    ),
                }));

                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        },
    });
};

/**
 * Delete a review
 */
export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId }) => {
            const res = await api.delete(`/reviews/${reviewId}`);
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.setQueryData(["reviews", "event", variables.eventId], (oldData) => {
                if (!oldData) return oldData;

                // Filter out the deleted review from page.data array and update pagination.total
                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    data: (page.data || []).filter((r) => r.id !== variables.reviewId),
                    pagination: page.pagination ? {
                        ...page.pagination,
                        total: Math.max(0, (page.pagination.total || 0) - 1)
                    } : page.pagination
                }));

                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        },
    });
};
