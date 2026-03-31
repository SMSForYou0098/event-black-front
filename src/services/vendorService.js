import { api } from '@/lib/axiosInterceptor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Fetch vendor profile
 * @returns {Promise<object>}
 */
export const getVendorProfile = async () => {
    const response = await api.get('vendor/profile');
    if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to fetch vendor profile');
    }
    return response.data.profile;
};

/**
 * Upsert vendor profile
 * @param {object} profileData - { business_name, business_type, gst_number, address, city, state, pincode }
 * @returns {Promise<object>}
 */
export const upsertVendorProfile = async (profileData) => {
    const response = await api.post('vendor/profile/upsert', profileData);
    if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to update vendor profile');
    }
    return response.data;
};

/**
 * Hook for vendor profile with refetch capability
 * @param {string|number} userId - The unique ID of the user to fetch profile for
 */
export const useVendorProfile = (userId, options = {}) => {
    return useQuery({
        queryKey: ['vendorProfile', userId],
        queryFn: getVendorProfile,
        retry: 1, // Limit retries to 1 to avoid excessive calls on error
        ...options
    });
};

/**
 * Hook for upserting vendor profile
 */
export const useUpsertVendorProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: upsertVendorProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
        }
    });
};
