// ================== Pure Validators (Regex) ==================

// Validate email
export const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9]+([._+-]?[A-Za-z0-9]+)*@[A-Za-z0-9]+(-[A-Za-z0-9]+)*(\.[A-Za-z0-9]+(-[A-Za-z0-9]+)*)+$/;
    return emailRegex.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
    return phone.length === 10 && /^\d+$/.test(phone);
};

// Validate credential
export const validateCredential = (credential) => {
    return validateEmail(credential) || validatePhone(credential);
};

// Validate name
export const validateName = (name) => {
    return !/[^a-zA-Z\s]/.test(name);
};

export const validateSearchTerm = (searchTerm) => {
    // Returns true ONLY if there are no invalid characters AND no 4 consecutive dots
    return !/[^a-zA-Z0-9\s.]/.test(searchTerm) && !/\.{4,}/.test(searchTerm);
};

// ================== Field-Level Validators (for useEffect real-time feedback) ==================

// Get credential error message
export const getCredentialError = (credential) => {
    if (!credential.trim()) return "Email or mobile number is required";
    if (!validateCredential(credential)) return "Please enter a valid email or mobile number";
    return null;
};

// Get OTP error message
export const getOtpError = (otp) => {
    if (!otp.trim()) return "OTP is required";
    if (otp.length !== 6) return "OTP must be 6 digits";
    return null;
};

// Get password error message
export const getPasswordError = (password) => {
    if (!password.trim()) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one digit";
    if (!/(?=.*[\W_])/.test(password)) return "Password must contain at least one special character";

    return null;
};

// Get name error message
export const getNameError = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.length < 2) return "Full name must be at least 2 characters long";
    if (!validateName(name)) return "Full name should only contain letters and spaces";
    return null;
};

// Get number error message
export const getNumberError = (number) => {
    if (!number.trim()) return "Phone number is required";
    if (!validatePhone(number)) return "Please enter a valid phone number (10 digits)";
    return null;
};

// Get email error message
export const getEmailError = (email) => {
    if (!email.trim()) return "Email is required";
    if (!validateEmail(email)) return "Please enter a valid email address";
    return null;
};

// Get search term error message
export const getSearchError = (searchTerm, is_required = false) => {
    //  If it's NOT required and empty, return null (no error text)
    if (!is_required && !searchTerm.trim()) return null;

    //  If it IS required and empty, show required error
    if (is_required && !searchTerm.trim()) return "Search is required";

    //  If they typed something but it contains invalid symbols, show validation error
    if (searchTerm.trim() && !validateSearchTerm(searchTerm)) return "Please enter a valid search term";

    return null;
};

// Get textarea input error message
export const getTextareaError = (value, is_required, label) => {
    if (is_required && !value.trim()) return `${label} is required`;
    if (value.trim().length < 5) return `${label} is too short`;
    if (value.trim().length > 255) return `${label} is too long`;
    if (!/^[a-zA-Z0-9\s,.\-\/\(\)\|]+$/.test(value)) {
        return `${label} contains invalid characters`;
    }
    if (/[,.\-\/\(\)\|]{2,}|\|\s*\|/.test(value)) {
        return `${label} contains consecutive special characters`;
    }
    return null;
};

// ================== Contact Us Form Validators ==================

// Get select error message
export const getSelectError = (query) => {
    if (!query) return "Please select a subject";
    return null;
}

// ================= Form-Level Validators (return { errors, isValid }) =================

// Login form validation
export const validateLoginForm = ({ credential }) => {
    const errors = {};

    const credentialError = getCredentialError(credential);
    if (credentialError) errors.credential = credentialError;

    return { errors, isValid: Object.keys(errors).length === 0 };
};

// OTP form validation
export const validateOtpForm = ({ otp }) => {
    const errors = {};

    const otpError = getOtpError(otp);
    if (otpError) errors.otp = otpError;

    return { errors, isValid: Object.keys(errors).length === 0 };
};

// Password form validation
export const validatePasswordForm = ({ password }) => {
    const errors = {};

    const passwordError = getPasswordError(password);
    if (passwordError) errors.password = passwordError;

    return { errors, isValid: Object.keys(errors).length === 0 };
}

// Sign Up form validation
export const validateSignUpForm = ({ name, number, email, address, is_address_required }) => {
    const errors = {};

    const nameError = getNameError(name);
    if (nameError) errors.name = nameError;

    const numberError = getNumberError(number);
    if (numberError) errors.number = numberError;

    const emailError = getEmailError(email);
    if (emailError) errors.email = emailError;

    // const addressError = getAddressError(address, is_address_required);
    // if (addressError) errors.address = addressError;

    return { errors, isValid: Object.keys(errors).length === 0 };
};

// Newsletter email validation
export const validateNewsLetterEmail = ({ email }) => {
    const errors = {};

    const emailError = getEmailError(email);
    if (emailError) errors.email = emailError;

    return { errors, isValid: Object.keys(errors).length === 0 };
};

// Validate profile data (Edit Profile)
export const validateProfileData = (formValues) => {
    const errors = {};

    const nameError = getNameError(formValues.name);
    if (nameError) {
        errors.name = nameError;
    }

    const emailError = getEmailError(formValues.email);
    if (emailError) {
        errors.email = emailError;
    }

    const addressError = getTextareaError(formValues.address, true, "Address");
    if (addressError) {
        errors.address = addressError;
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
};

// Contact Us form validation
export const validateContactUsForm = ({ name, phone, email, query, message }) => {
    const errors = {};

    // name validation
    const nameError = getNameError(name);
    if (nameError) errors.name = nameError;

    // email validation
    const emailError = getEmailError(email);
    if (emailError) errors.email = emailError;

    // phone validation
    const phoneError = getNumberError(phone);
    if (phoneError) errors.phone = phoneError;

    // select validation
    const selectError = getSelectError(query);
    if (selectError) errors.query = selectError;

    // message validation
    const messageError = getTextareaError(message, true, "Message");
    if (messageError) errors.message = messageError;

    return { errors, isValid: Object.keys(errors).length === 0 };
};