import React, { useState, useEffect, useCallback } from "react";
import { Form, Spinner, Row, Col, Card, Modal, Alert } from "react-bootstrap";
import { api, publicApi } from "@/lib/axiosInterceptor";
import { User, Mail, Phone, FileText, Hash, Upload, Check, Ticket, Users, Minus, Plus } from "lucide-react";
import CustomBtn from "@/utils/CustomBtn";
import CommonPricingComp from "@/components/Tickets/CommonPricingComp";
import { useMyContext } from "@/Context/MyContextProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { signIn } from "@/store/auth/authSlice";
import { getErrorMessage } from "@/utils/errorUtils";
import CustomDrawer from "@/utils/CustomDrawer";
import { CustomHeader } from "@/utils/ModalUtils/CustomModalHeader";
import { processImageFile } from "../../CustomComponents/AttendeeStroreUtils";
import FaceDetector from "../Attendees/FaceDetector";


/**
 * RegistrationBooking Component
 * 1. Shows ticket cards for single selection with quantity input (max = selection_limit)
 * 2. Checks if user exists, if not creates user and triggers OTP verification
 * 3. Renders dynamic event fields from API
 * 4. Calculates taxes and passes data to parent for checkout
 */
const RegistrationBooking = ({
    show = false,
    onVerified, // Callback when OTP verified successfully - passes data to parent
    eventId,
    cartItems = [],
    tax_data,
    isMobile,
    setSelectedTickets,
    onHide,
}) => {
    const { getCurrencySymbol, isLoggedIn, UserData } = useMyContext();
    const dispatch = useDispatch();

    // Internal ticket selection and quantity (moved here from cart sidebar)
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // User form states
    const [number, setNumber] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [photo, setPhoto] = useState(null);
    const [showFields, setShowFields] = useState(false);
    const [isExist, setIsExist] = useState(null);
    const [errors, setErrors] = useState({});

    // User check query
    const { data: userData, isLoading: checkingUser, isError: isUserCheckError } = useQuery({
        queryKey: ["user-check", number],
        queryFn: async () => {
            const response = await api.get(`user-from-number/${number}`);
            return response.data;
        },
        enabled: (number.length === 10 || number.length === 12) && !showFields,
        retry: false,
    });

    // Sync user data to form when query brings data or error occurs
    useEffect(() => {
        if (!checkingUser) {
            if (userData) {
                if (userData.status) {
                    // User exists
                    setIsExist(true);
                    setName(userData.user?.name || "");
                    setEmail(userData.user?.email || "");
                    setPhoto(userData.user?.photo || null);
                } else {
                    // User doesn't exist
                    setIsExist(false);
                    setName("");
                    setEmail("");
                    setPhoto(null);
                }
                setShowFields(true);
            } else if (isUserCheckError) {
                // Error fetching user (network error or server error) - treat as new user/allow entry
                setIsExist(false);
                setName("");
                setEmail("");
                setPhoto(null);
                setShowFields(true);
            }
        }
    }, [userData, checkingUser, isUserCheckError]);

    // Event fields query
    const { data: eventFields = [], isLoading: loadingFields } = useQuery({
        queryKey: ["event-fields", eventId],
        queryFn: async () => {
            const response = await api.get(`event/attendee/fields/${eventId}`);
            return response.data.data || [];
        },
        enabled: !!eventId && show,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Dynamic custom fields values state
    const [customFieldValues, setCustomFieldValues] = useState({});

    // OTP Modal state (now inline, not separate modal)
    const [showOtpSection, setShowOtpSection] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [countdown, setCountdown] = useState(30);
    const [timerVisible, setTimerVisible] = useState(false);

    // Registration data state (for new user flow)
    const [registrationData, setRegistrationData] = useState(null);

    // Get max booking limit for selected ticket
    const maxBookingLimit = selectedTicket?.selection_limit
        ? parseInt(selectedTicket.selection_limit)
        : 1;

    // Calculate tax for selected ticket
    const calculateTax = useCallback((price, ticketId, ticketName, qty = 1) => {
        if (!price) return null;

        const round = (n) => +Number(n ?? 0).toFixed(2);
        const baseAmount = round(price);

        // Convenience Fee calculation
        const feeRaw = Number(tax_data?.convenience_fee) || 0;
        const feeType = String(tax_data?.type || "").toLowerCase();

        let convenienceFee = 0;
        if (feeType === "percentage" || feeType === "percent") {
            convenienceFee = round(baseAmount * (feeRaw / 100));
        } else if (["flat", "fixed", "amount"].includes(feeType)) {
            convenienceFee = round(feeRaw);
        }

        // GST calculations
        const centralGST = convenienceFee * 0.09;
        const stateGST = convenienceFee * 0.09;
        const totalTax = centralGST + stateGST + convenienceFee;
        const finalAmount = baseAmount + totalTax;

        // Totals
        const totalBaseAmount = baseAmount * qty;
        const totalCentralGST = centralGST * qty;
        const totalStateGST = stateGST * qty;
        const totalConvenienceFee = convenienceFee * qty;
        const totalTaxTotal = totalCentralGST + totalStateGST + totalConvenienceFee;
        const totalFinalAmount = totalBaseAmount + totalTaxTotal;

        return {
            id: ticketId,
            category: ticketName,
            quantity: qty,
            price: round(price),

            // per-unit
            baseAmount: round(baseAmount),
            centralGST: round(centralGST),
            stateGST: round(stateGST),
            convenienceFee: round(convenienceFee),
            totalTax: round(totalTax),
            finalAmount: round(finalAmount),

            // totals
            totalBaseAmount: round(totalBaseAmount),
            totalCentralGST: round(totalCentralGST),
            totalStateGST: round(totalStateGST),
            totalConvenienceFee: round(totalConvenienceFee),
            totalTaxTotal: round(totalTaxTotal),
            totalFinalAmount: round(totalFinalAmount),

            // convenience
            subTotal: round(price * qty),
            grandTotal: round(totalFinalAmount),
        };
    }, [tax_data]);

    // Build fieldsData object from form values
    const buildFieldsData = useCallback(() => {
        return {
            name,
            email,
            number,
            photo,
            ...customFieldValues
        };
    }, [name, email, number, photo, customFieldValues]);

    // Update parent with selected ticket data when quantity or ticket changes
    useEffect(() => {
        if (selectedTicket && setSelectedTickets) {
            const price = selectedTicket?.sale === 1 ? selectedTicket?.sale_price : selectedTicket?.price;
            const taxData = calculateTax(price, selectedTicket.id, selectedTicket.name, quantity);

            // Include registration fields data and attendee quantity
            setSelectedTickets({
                ...taxData,
                fieldsData: JSON.stringify(buildFieldsData()),
                attendee_qty: quantity
            });
        }
    }, [selectedTicket, quantity, calculateTax, setSelectedTickets, buildFieldsData]);

    // OTP Timer
    useEffect(() => {
        let timer;
        if (timerVisible && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        if (countdown === 0) {
            setTimerVisible(false);
        }
        return () => clearInterval(timer);
    }, [timerVisible, countdown]);

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await publicApi.post("/create-user", { ...userData, password: userData.number });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                // After creating user, verify and send OTP
                verifyUserMutation.mutate(number);
            }
        },
        onError: (error) => {
            setOtpError(getErrorMessage(error, "Something went wrong"));
        },

    });

    // Verify user mutation (sends OTP)
    const verifyUserMutation = useMutation({
        mutationFn: async (phoneNumber) => {
            const response = await publicApi.post("/verify-user", { data: phoneNumber });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                setShowOtpSection(true);
                setTimerVisible(true);
                setCountdown(30);
                setOtp("");
                setOtpError("");
            }
        },
        onError: (error) => {
            setOtpError(getErrorMessage(error, "Failed to send OTP. Please try again."));
        },

    });

    // Verify OTP mutation
    const verifyOtpMutation = useMutation({
        mutationFn: async (loginData) => {
            const resultAction = await dispatch(signIn(loginData));
            if (!signIn.fulfilled.match(resultAction)) {
                throw new Error(resultAction.payload || "OTP verification failed");
            }
            return resultAction;
        },
        onSuccess: async () => {
            setShowOtpSection(false);
            setIsExist(true);
            // Call common handler to store registration and proceed
            await handleContinueToCheckout(true);
        },
        onError: (error) => {
            setOtpError(getErrorMessage(error, "Invalid OTP. Please try again."));
        },

    });

    // Common function to store registration and proceed to checkout
    const handleContinueToCheckout = async (isNewUser = false) => {
        // Prepare registration data
        const registrationData = {
            name,
            email,
            number,
            photo,
            user_id: UserData?.id,
            event_id: eventId,
            ...customFieldValues
        };

        try {
            // Store registration data via API
            const response = await api.post('/store/registration', {
                registration: JSON.stringify(registrationData)
            });

            // Extract registration_id from response
            const registration_id = response?.data?.data?.id;

            // Pass data to parent and close modal
            if (onVerified) {
                const price = selectedTicket?.sale === 1 ? selectedTicket?.sale_price : selectedTicket?.price;
                const taxData = calculateTax(price, selectedTicket?.id, selectedTicket?.name, quantity);
                onVerified({
                    number,
                    name,
                    email,
                    isExist: true,
                    photo,
                    customFieldValues,
                    selectedTicket,
                    quantity,
                    isNewUser,
                    taxData,
                    fieldsData: JSON.stringify({
                        name,
                        email,
                        number,
                        photo,
                        ...customFieldValues
                    }),
                    attendee_qty: quantity,
                    registration_id // Pass registration_id to parent
                });
            }
        } catch (error) {
            console.error("Error storing registration:", error);
            setOtpError(getErrorMessage(error, "Registration failed. Please try again."));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate hardcoded fields
        if (!number || (number.length !== 10 && number.length !== 12)) {
            newErrors.number = "Please enter a valid 10 or 12 digit number";
        }
        if (!name.trim()) {
            newErrors.name = "Name is required";
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate dynamic fields
        eventFields.forEach(field => {
            const { field_name, field_required, lable } = field;
            // Skip hardcoded fields if they are in the JSON
            if (['name', 'email', 'number'].includes(field_name.toLowerCase())) return;

            const value = customFieldValues[field_name] ?? (field_name.toLowerCase() === 'photo' ? photo : "");
            const isEmpty = value instanceof File || (typeof value === 'string' && value.startsWith('data:image'))
                ? !value
                : typeof value === "string" ? !value.trim() : !value;

            if (field_required && isEmpty) {
                newErrors[field_name] = `${lable || field_name} is required`;
            }

            // Specific format checks for dynamic fields if needed (email/phone detection)
            if (!isEmpty && typeof value === 'string') {
                if (/email/i.test(field_name) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors[field_name] = `${lable || field_name} must be a valid email`;
                }
                const isPhoneField = ["number", "phone number", "mobile number", "contact_number", "mo", "phone", "contact number"].includes(field_name.toLowerCase()) || /phone|contact|mobile/i.test(field_name);
                if (isPhoneField && !/^\d{10,12}$/.test(value)) {
                    newErrors[field_name] = `${lable || field_name} must be a valid number`;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Removed fetchEventFields useEffect as it is replaced by useQuery

    const isValidPhone = number.length === 10 || number.length === 12;

    // Removed handleCheckUser and its useEffect as it is replaced by useQuery

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 12) {
            setNumber(value);
            if (value.length < 10) {
                setShowFields(false);
                setIsExist(null);
                setName("");
                setEmail("");
            }
        }
    };

    const parseFieldOptions = (options) => {
        if (!options) return [];
        if (Array.isArray(options)) return options;
        try {
            const parsed = JSON.parse(options);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse field options:', e);
            return [];
        }
    };

    // Handle custom field value changes
    const handleCustomFieldChange = (fieldTitle, value) => {
        setCustomFieldValues(prev => ({
            ...prev,
            [fieldTitle]: value
        }));
    };

    // Handle file input changes
    const handleFileChange = async (fieldName, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const fileData = ev.target.result;

            // Photo processing (face detection)
            if (fieldName.toLowerCase().includes("photo")) {
                try {
                    const faceImageBase64 = await FaceDetector.cropFaceFromImage(fileData);
                    if (faceImageBase64) {
                        if (fieldName === 'photo') setPhoto(faceImageBase64);
                        else handleCustomFieldChange(fieldName, faceImageBase64);
                        return;
                    }
                } catch (err) {
                    console.warn("Face detection failed, using original/compressed image", err);
                }
            }

            // Fallback for non-photo or failed face detection: compression
            try {
                const processedBlob = await processImageFile(file);
                if (processedBlob instanceof Blob) {
                    const base64 = await new Promise((resolve) => {
                        const r = new FileReader();
                        r.onloadend = () => resolve(r.result);
                        r.readAsDataURL(processedBlob);
                    });
                    if (fieldName === 'photo') setPhoto(base64);
                    else handleCustomFieldChange(fieldName, base64);
                } else {
                    // If compression failed or returned something else, use the original file data (base64)
                    if (fieldName === 'photo') setPhoto(fileData);
                    else handleCustomFieldChange(fieldName, fileData);
                }
            } catch (error) {
                if (fieldName === 'photo') setPhoto(fileData);
                else handleCustomFieldChange(fieldName, fileData);
            }
        };
        reader.readAsDataURL(file);
    };

    // Get icon for field type
    const getFieldIcon = (type) => {
        switch (type) {
            case 'number':
                return <Hash size={14} />;
            case 'file':
                return <Upload size={14} />;
            case 'email':
                return <Mail size={14} />;
            case 'select':
                return <Users size={14} />;
            default:
                return <FileText size={14} />;
        }
    };

    // Handle new user registration (create user + OTP)
    const handleNewUserRegistration = () => {
        if (!validateForm()) {
            return;
        }

        // Store registration data and create user
        setRegistrationData({ name, email, number });
        createUserMutation.mutate({
            name,
            email,
            number,
            role_id: 4,
        });
    };

    // Handle OTP verification
    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            setOtpError("Please enter 6-digit OTP");
            return;
        }

        verifyOtpMutation.mutate({ otp, number });
    };

    // Handle resend OTP
    const handleResendOtp = () => {
        verifyUserMutation.mutate(number);
    };

    // Filter out name, email, number from dynamic fields as they are hardcoded
    // But KEEP photo if we want to render it dynamically OR if we want to render it in profile
    const filteredEventFields = eventFields.filter(field => {
        const title = field.field_name?.toLowerCase();
        return !['name', 'email', 'number'].includes(title);
    });

    // Filter active tickets
    const activeTickets = cartItems?.filter((item) => Number(item.status) === 1) || [];

    // Handle ticket selection
    const handleTicketSelect = (ticketId) => {
        const ticket = activeTickets.find(t => String(t.id) === ticketId);
        setSelectedTicket(ticket || null);
        setQuantity(1); // Reset quantity when changing ticket
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value) || 1;
        setQuantity(Math.max(1, Math.min(val, maxBookingLimit)));
    };

    const isLoading = createUserMutation.isPending || verifyUserMutation.isPending || verifyOtpMutation.isPending;

    const registrationContent = (
        <>
            {/* OTP Section - show when OTP verification is needed */}
            {showOtpSection ? (
                <div className="text-center">
                    <h5 className="mb-3">OTP Verification</h5>

                    {otpError && (
                        <Alert variant="danger" className="mb-3">
                            {otpError}
                        </Alert>
                    )}

                    <p className="text-muted mb-3">
                        Enter the 6-digit OTP sent to <strong>{number}</strong>
                    </p>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="bg-dark text-white border-secondary text-center"
                            style={{ fontSize: '1.5rem', letterSpacing: '0.5em' }}
                            maxLength={6}
                            autoFocus
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        {timerVisible ? (
                            <span className="text-muted small">
                                Resend OTP in {countdown}s
                            </span>
                        ) : (
                            <CustomBtn
                                buttonText="Resend OTP"
                                HandleClick={handleResendOtp}
                                variant="link"
                                className="p-0"
                                size="sm"
                                loading={verifyUserMutation.isPending}
                                hideIcon
                            />
                        )}
                    </div>

                    <CustomBtn
                        buttonText="Verify OTP & Continue"
                        HandleClick={handleVerifyOtp}
                        className="w-100"
                        loading={verifyOtpMutation.isPending}
                        disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                        hideIcon
                    />
                </div>
            ) : (
                <>
                    {/* User Details Form */}
                    <div>
                        <Row className="g-3">
                            {/* Phone Number Field */}
                            <Col xs={12} md={showFields ? 4 : 12}>
                                <Form.Group>
                                    <Form.Label className="text-white d-flex align-items-center gap-2 small">
                                        <Phone size={14} /> Phone Number <span className="text-danger">*</span>
                                    </Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={number}
                                            onChange={handlePhoneChange}
                                            className={`bg-dark text-white border-secondary ${errors.number ? 'border-danger' : ''}`}
                                            maxLength={12}
                                            required
                                            isInvalid={!!errors.number}
                                        />
                                        {checkingUser && (
                                            <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                <Spinner animation="border" size="sm" variant="primary" />
                                            </div>
                                        )}
                                    </div>
                                    {errors.number && <Form.Text className="text-danger small">{errors.number}</Form.Text>}
                                    {!showFields && !errors.number && (
                                        <Form.Text className="text-muted small">
                                            Enter 10 or 12 digit number
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>

                            {/* Name Field - show after phone verified */}
                            {showFields && (
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="text-white d-flex align-items-center gap-2 small">
                                            <User size={14} /> Name <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter your name"
                                            value={name}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                setErrors(prev => ({ ...prev, name: "" }));
                                            }}
                                            className={`bg-dark text-white border-secondary ${errors.name ? 'border-danger' : ''}`}
                                            disabled={isExist}
                                            isInvalid={!!errors.name}
                                            required
                                        />
                                        {errors.name && <Form.Text className="text-danger small">{errors.name}</Form.Text>}
                                    </Form.Group>
                                </Col>
                            )}

                            {/* Email Field - show after phone verified */}
                            {showFields && (
                                <Col xs={12} md={4}>
                                    <Form.Group>
                                        <Form.Label className="text-white d-flex align-items-center gap-2 small">
                                            <Mail size={14} /> Email <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setErrors(prev => ({ ...prev, email: "" }));
                                            }}
                                            className={`bg-dark text-white border-secondary ${errors.email ? 'border-danger' : ''}`}
                                            disabled={isExist}
                                            isInvalid={!!errors.email}
                                            required
                                        />
                                        {errors.email && <Form.Text className="text-danger small">{errors.email}</Form.Text>}
                                    </Form.Group>
                                </Col>
                            )}

                            {/* Dynamic Event Fields */}
                            {showFields && loadingFields && (
                                <Col xs={12}>
                                    <div className="d-flex justify-content-center py-3">
                                        <Spinner animation="border" size="sm" variant="primary" />
                                    </div>
                                </Col>
                            )}

                            {showFields && !loadingFields && filteredEventFields.map((field, index) => {
                                const field_name = field.field_name;
                                const field_type = field.field_type || field.type;
                                const isPhoto = field_name.toLowerCase() === 'photo';
                                const value = isPhoto ? photo : (customFieldValues[field_name] || "");
                                const error = errors[field_name];
                                const label = field.lable || field.field_name;
                                const isRequired = field.field_required;

                                return (
                                    <Col xs={12} md={4} key={index}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="text-white d-flex align-items-center gap-2 small text-capitalize">
                                                {getFieldIcon(field_type)} {label.replace(/_/g, ' ')} {isRequired && <span className="text-danger">*</span>}
                                            </Form.Label>

                                            {field_type === 'file' ? (
                                                <div className="d-flex flex-column gap-2">
                                                    <Form.Control
                                                        type="file"
                                                        onChange={(e) => {
                                                            handleFileChange(field_name, e);
                                                            setErrors(prev => ({ ...prev, [field_name]: "" }));
                                                        }}
                                                        className={`bg-dark text-white border-secondary ${error ? 'border-danger' : ''}`}
                                                        accept="image/*"
                                                        isInvalid={!!error}
                                                    />
                                                    {value && (typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))) && (
                                                        <div className="d-flex align-items-center gap-2">
                                                            <img
                                                                src={value}
                                                                alt="Preview"
                                                                className="rounded border border-secondary"
                                                                style={{ width: 40, height: 40, objectFit: 'cover' }}
                                                            />
                                                            <span className="text-success small">Photo Selected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : field_type === 'select' ? (
                                                <Form.Select
                                                    value={value}
                                                    onChange={(e) => {
                                                        handleCustomFieldChange(field_name, e.target.value);
                                                        setErrors(prev => ({ ...prev, [field_name]: "" }));
                                                    }}
                                                    className={`bg-dark text-white border-secondary ${error ? 'border-danger' : ''}`}
                                                    isInvalid={!!error}
                                                >
                                                    <option value="">Select {label}</option>
                                                    {parseFieldOptions(field.field_options).map((opt, i) => (
                                                        <option key={i} value={opt}>{opt}</option>
                                                    ))}
                                                </Form.Select>
                                            ) : field_type === 'radio' ? (
                                                <div className="d-flex gap-3 flex-wrap">
                                                    {parseFieldOptions(field.field_options).map((option, idx) => (
                                                        <div key={idx} className="form-check d-flex align-items-center gap-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id={`${field_name}-${idx}`}
                                                                name={field_name}
                                                                value={option}
                                                                checked={value === option}
                                                                onChange={(e) => handleCustomFieldChange(field_name, e.target.value)}
                                                            />
                                                            <label className="form-check-label text-white small" htmlFor={`${field_name}-${idx}`}>
                                                                {option}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : field_type === 'checkbox' ? (
                                                <div className="d-flex gap-3 flex-wrap">
                                                    {parseFieldOptions(field.field_options).map((option, idx) => (
                                                        <div key={idx} className="form-check d-flex align-items-center gap-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`${field_name}-${idx}`}
                                                                value={option}
                                                                checked={(Array.isArray(value) ? value : []).includes(option)}
                                                                onChange={(e) => {
                                                                    const currentValues = Array.isArray(value) ? value : [];
                                                                    const newValues = e.target.checked
                                                                        ? [...currentValues, option]
                                                                        : currentValues.filter(v => v !== option);
                                                                    handleCustomFieldChange(field_name, newValues);
                                                                }}
                                                            />
                                                            <label className="form-check-label text-white small" htmlFor={`${field_name}-${idx}`}>
                                                                {option}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : field_type === 'textarea' ? (
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    placeholder={`Enter ${label}`}
                                                    value={value}
                                                    onChange={(e) => {
                                                        handleCustomFieldChange(field_name, e.target.value);
                                                        setErrors(prev => ({ ...prev, [field_name]: "" }));
                                                    }}
                                                    className={`bg-dark text-white border-secondary ${error ? 'border-danger' : ''}`}
                                                    isInvalid={!!error}
                                                />
                                            ) : (
                                                <Form.Control
                                                    type={field_type === 'number' ? 'number' : 'text'}
                                                    placeholder={`Enter ${label}`}
                                                    value={value}
                                                    onChange={(e) => {
                                                        handleCustomFieldChange(field_name, e.target.value);
                                                        setErrors(prev => ({ ...prev, [field_name]: "" }));
                                                    }}
                                                    className={`bg-dark text-white border-secondary ${error ? 'border-danger' : ''}`}
                                                    isInvalid={!!error}
                                                />
                                            )}
                                            {error && <Form.Text className="text-danger small">{error}</Form.Text>}
                                        </Form.Group>
                                    </Col>
                                );
                            })}

                            {/* Verify & Continue Button for new users */}
                            {showFields && isExist === false && (
                                <Col xs={12} className="mt-4">
                                    <CustomBtn
                                        buttonText="Verify & Continue"
                                        HandleClick={handleNewUserRegistration}
                                        className="w-100"
                                        loading={isLoading}
                                        disabled={!name.trim() || !email.trim() || isLoading}
                                        hideIcon
                                    />
                                    <Form.Text className="text-muted small d-block text-center mt-2">
                                        An OTP will be sent to your phone number for verification
                                    </Form.Text>
                                </Col>
                            )}

                            {/* Continue Button for existing users */}
                            {showFields && isExist === true && (
                                <Col xs={12} className="mt-4">
                                    <CustomBtn
                                        buttonText={isLoggedIn ? "Continue to Checkout" : "Verify & Continue"}
                                        HandleClick={() => {
                                            if (!validateForm()) return;
                                            if (isLoggedIn) {
                                                // Already logged in, proceed directly
                                                handleContinueToCheckout(false);
                                            } else {
                                                // Not logged in, need OTP verification
                                                verifyUserMutation.mutate(number);
                                            }
                                        }}
                                        className="w-100"
                                        loading={verifyUserMutation.isPending}
                                        disabled={!name.trim() || !email.trim() || verifyUserMutation.isPending}
                                        hideIcon
                                    />
                                    {!isLoggedIn && (
                                        <Form.Text className="text-muted small d-block text-center mt-2">
                                            An OTP will be sent to verify your identity
                                        </Form.Text>
                                    )}
                                </Col>
                            )}
                        </Row>
                    </div>
                </>
            )}
        </>
    );

    if (isMobile) {
        return (
            <CustomDrawer
                showOffcanvas={show}
                setShowOffcanvas={() => onHide && onHide()}
                title={
                    <div className="d-flex align-items-center gap-2">
                        <Ticket size={24} className="text-warning" />
                        Registration
                    </div>
                }
                placement="bottom"
                className="bg-dark text-white"
                style={{ height: 'auto', minHeight: '60vh' }}
            >
                <div className="p-2">
                    {registrationContent}
                </div>
            </CustomDrawer>
        );
    }

    return (
        <Modal
            show={show}
            onHide={() => onHide && onHide()}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
            className="modal-glass-bg"
        >
            <CustomHeader
                title={
                    <div className="d-flex align-items-center gap-2">
                        <Ticket size={24} className="text-warning" />
                        Registration
                    </div>
                }
                closable={true}
                onClose={() => onHide && onHide()}
                className="border-0"
            />
            <Modal.Body>
                {registrationContent}
            </Modal.Body>
        </Modal>
    );
};

export default RegistrationBooking;
