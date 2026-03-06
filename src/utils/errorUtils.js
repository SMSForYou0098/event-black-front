/**
 * Utility to extract a human-readable error message from a backend response.
 * Handles Axios error objects and standard error objects.
 * 
 * @param {any} err - The error object (Axios error or standard Error)
 * @param {string} defaultMessage - The fallback message if no specific message is found
 * @returns {string} - The extracted error message
 */
export const getErrorMessage = (err, defaultMessage = 'An error occurred') => {
    // If it's an axios error, look into response.data. Otherwise, use the error object itself
    const errorData = err?.response?.data || err;

    // 1. Check for direct message
    if (errorData?.message) return errorData.message;

    // 2. Check for 'error' property
    if (errorData?.error) return errorData.error;

    // 3. Handle validation 'errors' object (common in Laravel/standard APIs)
    if (errorData?.errors && typeof errorData.errors === 'object') {
        const errors = errorData.errors;
        // If it's an array, join it
        if (Array.isArray(errors)) return errors.join(' ');

        // If it's an object, flatten values and join
        const specificErrors = Object.values(errors).flat();
        if (specificErrors.length > 0) {
            return specificErrors.join(' ');
        }
    }

    // 4. Fallback to generic Error message or default
    return err?.message || defaultMessage;
};

