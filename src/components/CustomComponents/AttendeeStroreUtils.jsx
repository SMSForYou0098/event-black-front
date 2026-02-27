import imageCompression from 'browser-image-compression';
const getFieldType = (key) => {
    const normalizedKey = key?.toLowerCase()?.replace(/\s+/g, '');
    if (normalizedKey?.includes("email")) return "email";
    if (normalizedKey?.includes("phone") || normalizedKey?.includes("contact")) return "phone";
    return "other";
};
export const checkForDuplicateAttendees = (attendees, setErrorMessages, setShowErrorModal) => {
    if (!attendees || !Array.isArray(attendees)) return false;

    const duplicates = {};
    const errorMessages = [];

    const fieldsToCheck = Object.keys(attendees[0] || {}).filter(field =>
        field !== 'missingFields' && field !== 'Mo' && field !== 'Gender' && field !== 'id' && attendees[0][field]
    );
    fieldsToCheck.forEach(field => {
        duplicates[field] = new Map();
    });
    attendees.forEach((attendee, currentIndex) => {
        fieldsToCheck.forEach(field => {
            const value = attendee[field];
            const normalizedValue = field === 'Mo' ? value?.toString() : value;

            if (duplicates[field].has(normalizedValue)) {
                const previousIndex = duplicates[field].get(normalizedValue);
                if (previousIndex !== currentIndex) {
                    let friendlyMessage = '';
                    switch (field) {
                        case 'Name':
                            friendlyMessage = `The name "${value}" is already used in ticket #${previousIndex + 1}. Please use a different name.`;
                            break;
                        case 'Email':
                            friendlyMessage = `The email address "${value}" is already used in ticket #${previousIndex + 1}. Please use a different email address.`;
                            break;
                        // case 'Contact_Number':
                        //     friendlyMessage = `The contact number "${value}" is already used in ticket #${previousIndex + 1}. Please provide a different contact number.`;
                        //     break;
                        default:
                            friendlyMessage = `Duplicate ${field} found between tickets #${currentIndex + 1} and #${previousIndex + 1}`;
                    }
                    errorMessages.push(friendlyMessage);
                }
            } else {
                duplicates[field].set(normalizedValue, currentIndex);
            }
        });
    });

    // Log the error messages for debugging
    if (errorMessages.length > 0) {
        setErrorMessages(errorMessages);
        setShowErrorModal(true);
        return true;
    }
    else {
        return false;
    }

};
export const sanitizeData = (attendees) => {
    return attendees.map((attendee) => {
        const sanitizedAttendee = { ...attendee };
        Object.keys(sanitizedAttendee).forEach((key) => {
            const value = sanitizedAttendee[key];

            // Convert string numbers to actual numbers
            if (!isNaN(value) && typeof value === 'string') {
                sanitizedAttendee[key] = Number(value);
            }

            // Ensure boolean-like strings are converted to booleans
            if (value === 'true' || value === 'false') {
                sanitizedAttendee[key] = value === 'true';
            }
        });

        return sanitizedAttendee;
    });
};
export const validateAttendeeData = (attendee, apiData = []) => {
    // If apiData is provided, validate based on field configuration (required-ness and format)
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        for (const field of apiData) {
            const fieldName = field.field_name;
            const isRequired = field.field_required === true;
            const value = attendee[fieldName];

            // 1. Mandatory check for required fields
            if (isRequired && (value === null || value === undefined || value === '')) {
                return { valid: false, message: `${field.lable || fieldName} is required` };
            }

            // 2. Format validation (only if value exists)
            if (value !== null && value !== undefined && value !== '') {
                const fieldType = getFieldType(fieldName);

                // Email validation
                if (fieldType === "email" && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                    return { valid: false, message: `Invalid email format for ${field.lable || fieldName}` };
                }

                // Phone number validation
                if (fieldType === "phone" && !/^\d{10}$/.test(String(value))) {
                    return { valid: false, message: `Invalid phone number format for ${field.lable || fieldName}` };
                }
            }
        }
    } else {
        // Fallback/Legacy behavior: Validate format for all keys that have values
        for (const [key, value] of Object.entries(attendee)) {
            // Skip helper keys
            if (key === 'id' || key === 'missingFields') continue;

            // Only validate format if there is a value; don't enforce required-ness without config
            if (value !== null && value !== undefined && value !== '') {
                const fieldType = getFieldType(key);

                // Email validation
                if (fieldType === "email" && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
                    return { valid: false, message: `Invalid email format for ${key}` };
                }

                // Phone number validation
                if (fieldType === "phone" && !/^\d{10}$/.test(String(value))) {
                    return { valid: false, message: `Invalid phone number format for ${key}` };
                }
            }
        }
    }
    return { valid: true };
};
export const sanitizeInput = (value) => {
    if (typeof value === 'string') {
        return value.replace(/[<>]/g, ""); // Simple sanitization to remove tags
    }
    return value;
};

export const processImageFile = async (file) => {
    if (file && file.type.startsWith('image/')) {
        const options = {
            maxSizeMB: 100 / 1024,
            maxWidthOrHeight: 200,
            useWebWorker: true,
            fileType: 'image/jpeg' // Convert to JPEG format
        };

        try {
            const compressedBlob = await imageCompression(file, options);
            const fileName = file.name.split('.')[0] + '.jpg';
            const compressedFile = new File([compressedBlob], fileName, {
                type: 'image/jpeg'
            });
            return compressedFile;
        } catch (error) {
            console.error("Image compression failed:", error);
            return error;
        }
    } else {
        console.warn("Please upload an image file.");
        return null;
    }
};