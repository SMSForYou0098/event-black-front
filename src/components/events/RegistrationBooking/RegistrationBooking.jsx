import React, { useState, useEffect, useCallback } from "react";
import { Form, Spinner, Row, Col, Card, Modal, Alert } from "react-bootstrap";
import { api, publicApi } from "@/lib/axiosInterceptor";
import { User, Mail, Phone, FileText, Hash, Upload, Check, Ticket, Users, Minus, Plus } from "lucide-react";
import CustomBtn from "@/utils/CustomBtn";
import CommonPricingComp from "@/components/Tickets/CommonPricingComp";
import { useMyContext } from "@/Context/MyContextProvider";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { signIn } from "@/store/auth/authSlice";

/**
 * RegistrationBooking Component
 * 1. Shows ticket cards for single selection with quantity input (max = user_booking_limit)
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

    const [checkingUser, setCheckingUser] = useState(false);
    const [isExist, setIsExist] = useState(null);
    const [showFields, setShowFields] = useState(false);

    // Event fields state
    const [eventFields, setEventFields] = useState([]);
    const [loadingFields, setLoadingFields] = useState(false);

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
    const maxBookingLimit = selectedTicket?.user_booking_limit
        ? parseInt(selectedTicket.user_booking_limit)
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
            setOtpError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Something went wrong"
            );
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
            setOtpError(
                error.response?.data?.message ||
                "Failed to send OTP. Please try again."
            );
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
            setOtpError(error.message || "Invalid OTP. Please try again.");
        },
    });

    // Common function to store registration and proceed to checkout
    const handleContinueToCheckout = async (isNewUser = false) => {
        // Prepare registration data
        const registrationData = {
            // name,
            // email,
            // number,
            // photo,
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
            setOtpError("Registration failed. Please try again.");
        }
    };

    useEffect(() => {
        const fetchEventFields = async () => {
            if (!eventId) return;

            setLoadingFields(true);
            try {
                const response = await api.get(`event/fields/${eventId}`);
                if (response.data?.status) {
                    setEventFields(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching event fields:", error);
            } finally {
                setLoadingFields(false);
            }
        };

        fetchEventFields();
    }, [eventId]);

    const isValidPhone = number.length === 10 || number.length === 12;

    const handleCheckUser = useCallback(async (phoneNumber) => {
        if (!phoneNumber || (phoneNumber.length !== 10 && phoneNumber.length !== 12)) {
            return;
        }

        setCheckingUser(true);
        try {
            const url = `user-from-number/${phoneNumber}`;
            const response = await api.get(url);

            if (response.data?.status) {
                // User exists
                setIsExist(true);
                setName(response.data.user?.name || "");
                setEmail(response.data.user?.email || "");
                setPhoto(response.data.user?.photo || null);
            } else {
                // User doesn't exist - will need to create
                setIsExist(false);
                setName("");
                setEmail("");
                setPhoto(null);
            }
            setShowFields(true);
        } catch (error) {
            console.error("Error fetching user:", error);
            setIsExist(false);
            setName("");
            setEmail("");
            setShowFields(true);
        } finally {
            setCheckingUser(false);
        }
    }, []);

    useEffect(() => {
        if (isValidPhone && !showFields) {
            handleCheckUser(number);
        }
    }, [number, isValidPhone, showFields, handleCheckUser]);

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

    // Handle custom field value changes
    const handleCustomFieldChange = (fieldTitle, value) => {
        setCustomFieldValues(prev => ({
            ...prev,
            [fieldTitle]: value
        }));
    };

    // Handle file input changes
    const handleFileChange = (fieldTitle, e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomFieldValues(prev => ({
                ...prev,
                [fieldTitle]: file
            }));
        }
    };

    // Get icon for field type
    const getFieldIcon = (type) => {
        switch (type) {
            case 'number':
                return <Hash size={14} />;
            case 'file':
                return <Upload size={14} />;
            default:
                return <FileText size={14} />;
        }
    };

    // Handle new user registration (create user + OTP)
    const handleNewUserRegistration = () => {
        if (!name.trim() || !email.trim() || !number.trim()) {
            setOtpError("Please fill all required fields");
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

    // Filter out name, email, number, photo from dynamic fields
    const filteredEventFields = eventFields.filter(field => {
        const title = field.title?.toLowerCase();
        return !['name', 'email', 'number', 'photo'].includes(title);
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

    return (
        <Modal
            show={show}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
            className="modal-glass-bg"
        >
            <Modal.Header className="border-0">
                <Modal.Title className="d-flex fe-6 align-items-center gap-2">
                    <Ticket size={24} className="text-warning" />
                    Registration
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                                                className="bg-dark text-white border-secondary"
                                                maxLength={12}
                                                required
                                            />
                                            {checkingUser && (
                                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                    <Spinner animation="border" size="sm" variant="primary" />
                                                </div>
                                            )}
                                        </div>
                                        {!showFields && (
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
                                                onChange={(e) => setName(e.target.value)}
                                                className="bg-dark text-white border-secondary"
                                                disabled={isExist}
                                                required
                                            />
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
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-dark text-white border-secondary"
                                                disabled={isExist}
                                                required
                                            />
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

                                {showFields && !loadingFields && filteredEventFields.map((field, index) => (
                                    <Col xs={12} md={4} key={index}>
                                        <Form.Group>
                                            <Form.Label className="text-white d-flex align-items-center gap-2 small text-capitalize">
                                                {getFieldIcon(field.type)} {field.title?.replace(/_/g, ' ')}
                                            </Form.Label>

                                            {field.type === 'file' ? (
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleFileChange(field.title, e)}
                                                    className="bg-dark text-white border-secondary"
                                                    accept="image/*"
                                                />
                                            ) : (
                                                <Form.Control
                                                    type={field.type === 'number' ? 'number' : 'text'}
                                                    placeholder={`Enter ${field.title?.replace(/_/g, ' ')}`}
                                                    value={customFieldValues[field.title] || ""}
                                                    onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                                                    className="bg-dark text-white border-secondary"
                                                />
                                            )}

                                            {field.note && (
                                                <Form.Text className="text-muted small">
                                                    {field.note}
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                    </Col>
                                ))}

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
            </Modal.Body>
        </Modal>
    );
};

export default RegistrationBooking;
