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
            queryClient.setQueryData(["reviews", "event", variables.eventId], (oldData) => {
                if (!oldData) return oldData;

                const reviewToAdd = newReview.data || newReview;

                // Handle infinite query structure (pages array)
                // Add new review to the beginning of the first page
                const newPages = oldData.pages.map((page, index) => {
                    if (index === 0) {
                        return {
                            ...page,
                            data: {
                                ...page.data,
                                data: [reviewToAdd, ...(page.data?.data || [])],
                                total: (page.data?.total || 0) + 1
                            },
                        };
                    }
                    // Update total count on other pages if needed/available, but main list is page 0
                    return page;
                });

                return {
                    ...oldData,
                    pages: newPages,
                };
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

                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    data: {
                        ...page.data,
                        data: (page.data?.data || []).map((r) =>
                            r.id === variables.reviewId ? { ...r, ...reviewToUpdate } : r
                        ),
                    },
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

                const newPages = oldData.pages.map((page) => ({
                    ...page,
                    data: {
                        ...page.data,
                        data: (page.data?.data || []).filter((r) => r.id !== variables.reviewId),
                        total: Math.max(0, (page.data?.total || 0) - 1)
                    },
                }));

                return {
                    ...oldData,
                    pages: newPages,
                };
            });
        },
    });
};
