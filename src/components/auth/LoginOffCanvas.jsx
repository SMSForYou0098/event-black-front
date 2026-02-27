import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import { Modal, Offcanvas, Row, Col, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { signIn, logout } from "@/store/auth/authSlice";
import { PasswordField } from "../../components/CustomComponents/CustomFormFields";
import { ChevronLeft, LoaderCircle, Mail } from "lucide-react";
import CustomBtn from "../../utils/CustomBtn";
import CustomDrawer from "../../utils/CustomDrawer";
import Link from "next/link";
import { useMyContext } from "@/Context/MyContextProvider";
import Logo from "../partials/Logo";

const MODAL_VIEWS = {
    SIGN_IN: "SIGN_IN",
    SIGN_UP: "SIGN_UP",
    OTP: "OTP",
    PASSWORD: "PASSWORD",
};

const LoginModal = memo(({ show, onHide, eventKey, redirectPath, onSuccess: onSuccessCallback, is_address_required }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isMobile } = useMyContext();
    // States
    const [currentView, setCurrentView] = useState(MODAL_VIEWS.SIGN_IN);
    const [otpSent, setOtpSent] = useState(false);
    const [timerVisible, setTimerVisible] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const [address, setAddress] = useState(""); // Add address state
    const [credential, setCredential] = useState("");
    const [otp, setOTP] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [password, setPassword] = useState("");
    const [countdown, setCountdown] = useState(30);
    const [resendCount, setResendCount] = useState(0);
    const [sessionData, setSessionData] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Validation states
    const [touched, setTouched] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const MAX_RESEND_ATTEMPTS = 10;
    const RESEND_COOLDOWN = 60;

    // Determine input type (email or phone)
    const getInputType = (value) => {
        if (!value) return null;

        // Check if it's a number
        const isNumeric = /^\d+$/.test(value);

        if (isNumeric) {
            // Check if it's a valid Indian phone number (starts with 6, 7, 8, or 9)
            const firstDigit = value[0];
            if (['6', '7', '8', '9'].includes(firstDigit)) {
                return 'phone';
            }
        }

        // Check if it contains @ (likely email)
        if (value.includes('@') || /[a-zA-Z]/.test(value)) {
            return 'email';
        }

        return null;
    };

    const inputType = getInputType(credential);

    // TanStack Query Mutations
    const verifyUserMutation = useMutation({
        mutationFn: async (data) => {
            const response = await publicApi.post("/verify-user", { data });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                if (data.pass_req) {
                    setCurrentView(MODAL_VIEWS.PASSWORD);
                    setSessionData({
                        data: credential,
                        session_id: data.session_id,
                        auth_session: data.auth_session,
                    });
                } else {
                    setTimerVisible(true);
                    setCountdown(60);
                    setCurrentView(MODAL_VIEWS.OTP);
                    setOtpSent(true);
                    setOTP("");
                    setResendCount((prev) => prev + 1);
                    const lastResendKey = `lastOtpResendTime_${credential}`;
                    localStorage.setItem(lastResendKey, Date.now().toString());
                }
            }
        },
        onError: (error) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const isEmail = emailRegex.test(credential);
            if (isEmail) {
                setEmail(credential);
                setNumber("");
            } else {
                setNumber(credential);
                setEmail("");
            }
            setServerError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Something went wrong"
            );
            if (error?.response?.data?.meta === 404) {
                setCurrentView(MODAL_VIEWS.SIGN_UP);
            }
        },
    });

    const createUserMutation = useMutation({
        mutationFn: async (userData) => {
            const response = await publicApi.post("/create-user", { ...userData, password: number });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                setCredential(number || email);
                verifyUserMutation.mutate(number || email);
            }
        },
        onError: (error) => {
            setServerError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Something went wrong"
            );
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async (loginData) => {
            const resultAction = await dispatch(signIn(loginData));
            if (!signIn.fulfilled.match(resultAction)) {
                throw new Error(resultAction.payload || "OTP verification failed");
            }
            return resultAction;
        },
        onSuccess: () => {
            handleModalClose();
            if (onSuccessCallback) {
                onSuccessCallback();
            } else {
                router.push(redirectPath || `/events/${eventKey}/process`);
            }
        },
        onError: (error) => {
            setServerError(error.message || "An error occurred");
            setAttempts((prev) => prev + 1);
            if (attempts >= 2) {
                dispatch(logout());
                setCurrentView(MODAL_VIEWS.SIGN_IN);
            }
        },
    });

    const verifyPasswordMutation = useMutation({
        mutationFn: async (loginData) => {
            const resultAction = await dispatch(signIn(loginData));
            if (!signIn.fulfilled.match(resultAction)) {
                throw new Error(resultAction.payload || "Password verification failed");
            }
            return resultAction;
        },
        onSuccess: () => {
            handleModalClose();
            if (onSuccessCallback) {
                onSuccessCallback();
            } else {
                router.push(redirectPath || `/events/${eventKey}/process`);
            }
        },
        onError: (error) => {
            setServerError(error.message || "An error occurred");
            setAttempts((prev) => prev + 1);
            if (attempts >= 2) {
                dispatch(logout());
                setCurrentView(MODAL_VIEWS.SIGN_IN);
            }
        },
    });

    useEffect(() => {
        let timer;
        if (timerVisible && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timerVisible, countdown]);

    useEffect(() => {
        if (countdown === 0) {
            setTimerVisible(false);
        }
    }, [countdown]);

    useEffect(() => {
        setValidationErrors({});
        setTouched({});
        setServerError("");
    }, [currentView]);

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        return phone.length >= 10 && phone.length <= 12 && /^\d+$/.test(phone);
    };

    const validateCredential = (credential) => {
        return validateEmail(credential) || validatePhone(credential);
    };

    useEffect(() => {
        if (!touched.credential) return;
        const errors = { ...validationErrors };
        if (!credential.trim()) {
            errors.credential = "Email or mobile number is required";
        } else if (!validateCredential(credential)) {
            errors.credential = "Please enter a valid email or mobile number";
        } else {
            delete errors.credential;
        }
        setValidationErrors(errors);
    }, [credential, touched.credential]);

    useEffect(() => {
        if (!touched.otp) return;
        const errors = { ...validationErrors };
        if (!otp.trim()) {
            errors.otp = "OTP is required";
        } else if (otp.length !== 6) {
            errors.otp = "OTP must be 6 digits";
        } else {
            delete errors.otp;
        }
        setValidationErrors(errors);
    }, [otp, touched.otp]);

    useEffect(() => {
        if (!touched.password) return;
        const errors = { ...validationErrors };
        if (!password.trim()) {
            errors.password = "Password is required";
        } else {
            delete errors.password;
        }
        setValidationErrors(errors);
    }, [password, touched.password]);

    useEffect(() => {
        if (!touched.name) return;
        const errors = { ...validationErrors };
        if (!name.trim()) {
            errors.name = "Full name is required";
        } else {
            delete errors.name;
        }
        setValidationErrors(errors);
    }, [name, touched.name]);

    useEffect(() => {
        if (!touched.number) return;
        const errors = { ...validationErrors };
        if (!number.trim()) {
            errors.number = "Phone number is required";
        } else if (!validatePhone(number)) {
            errors.number = "Please enter a valid phone number (10-12 digits)";
        } else {
            delete errors.number;
        }
        setValidationErrors(errors);
    }, [number, touched.number]);

    useEffect(() => {
        if (!touched.email) return;
        const errors = { ...validationErrors };
        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!validateEmail(email)) {
            errors.email = "Please enter a valid email address";
        } else {
            delete errors.email;
        }
        setValidationErrors(errors);
    }, [email, touched.email]);

    useEffect(() => {
        if (!touched.address) return;
        const errors = { ...validationErrors };
        if (is_address_required && !address.trim()) {
            errors.address = "Address is required";
        } else {
            delete errors.address;
        }
        setValidationErrors(errors);
    }, [address, touched.address, is_address_required]);

    useEffect(() => {
        if (!touched.terms) return;
        const errors = { ...validationErrors };
        if (!termsAccepted) {
            errors.terms = "You must agree to the terms of use";
        } else {
            delete errors.terms;
        }
        setValidationErrors(errors);
    }, [termsAccepted, touched.terms]);

    const handleModalClose = () => {
        setServerError("");
        setValidationErrors({});
        setTouched({});
        setOTP("");
        setEmail("");
        setNumber("");
        setName("");
        setAddress(""); // Clear address
        setCredential("");
        setResendCount(0);
        setCurrentView(MODAL_VIEWS.SIGN_IN);
        setOtpSent(false);
        setTimerVisible(false);
        setCountdown(30);
        setAttempts(0);
        setPassword("");
        setSessionData(null);
        setTermsAccepted(false);

        if (credential) {
            localStorage.removeItem(`lastOtpResendTime_${credential}`);
        }

        onHide();
    };

    const handleLogin = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTouched({ credential: true });

        const errors = {};
        let isValid = true;

        if (!credential.trim()) {
            errors.credential = "Email or mobile number is required";
            isValid = false;
        } else if (!validateCredential(credential)) {
            errors.credential = "Please enter a valid email or mobile number";
            isValid = false;
        }

        setValidationErrors(errors);

        if (!isValid) return;

        const lastResendKey = `lastOtpResendTime_${credential}`;
        const lastResendTime = localStorage.getItem(lastResendKey);
        const currentTime = Date.now();

        if (
            lastResendTime &&
            currentTime - parseInt(lastResendTime) < RESEND_COOLDOWN * 1000
        ) {
            setServerError(
                `Please wait ${RESEND_COOLDOWN} seconds before requesting new OTP`
            );
            return;
        }

        if (resendCount >= MAX_RESEND_ATTEMPTS) {
            setServerError(
                "Maximum OTP resend attempts reached. Please try again later."
            );
            return;
        }

        setServerError("");
        verifyUserMutation.mutate(credential);
    };

    const handleVerifyOtp = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTouched({ otp: true });

        const errors = {};
        let isValid = true;

        if (!otp.trim()) {
            errors.otp = "OTP is required";
            isValid = false;
        } else if (otp.length !== 6) {
            errors.otp = "OTP must be 6 digits";
            isValid = false;
        }

        setValidationErrors(errors);

        if (!isValid) return;

        setServerError("");
        const loginData = { otp, number: credential };
        verifyOtpMutation.mutate(loginData);
    };

    const handleSignUp = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTouched({
            name: true,
            number: true,
            email: true,
            address: true, // Mark address as touched
            terms: true,
        });

        const errors = {};
        let isValid = true;

        if (!name.trim()) {
            errors.name = "Full name is required";
            isValid = false;
        }

        if (!number.trim()) {
            errors.number = "Phone number is required";
            isValid = false;
        } else if (!validatePhone(number)) {
            errors.number = "Please enter a valid phone number (10-12 digits)";
            isValid = false;
        }

        if (!email.trim()) {
            errors.email = "Email is required";
            isValid = false;
        } else if (!validateEmail(email)) {
            errors.email = "Please enter a valid email address";
            isValid = false;
        }

        if (is_address_required && !address.trim()) {
            errors.address = "Address is required";
            isValid = false;
        }

        if (!termsAccepted) {
            errors.terms = "You must agree to the terms of use";
            isValid = false;
        }

        setValidationErrors(errors);

        if (!isValid) return;

        setServerError("");
        createUserMutation.mutate({
            name,
            email,
            number,
            role_id: 4,
            ...(is_address_required && { address }), // Include address if required
        });
    };

    const handleVerifyPassword = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        setTouched({ password: true });

        const errors = {};
        let isValid = true;

        if (!password.trim()) {
            errors.password = "Password is required";
            isValid = false;
        }

        if (!sessionData) {
            setServerError("Session expired. Please try again.");
            return;
        }

        setValidationErrors(errors);

        if (!isValid) return;

        setServerError("");
        const loginData = {
            password,
            number: sessionData.data,
            passwordRequired: true,
            session_id: sessionData.session_id,
            auth_session: sessionData.auth_session,
        };
        verifyPasswordMutation.mutate(loginData);
    };

    const handleBack = () => {
        setCurrentView(MODAL_VIEWS.SIGN_IN);
        setValidationErrors({});
        setTouched({});
        setServerError("");
    };

    const isLoading =
        verifyUserMutation.isPending ||
        createUserMutation.isPending ||
        verifyOtpMutation.isPending ||
        verifyPasswordMutation.isPending;

    // Render title based on current view
    const getTitle = () => {
        switch (currentView) {
            case MODAL_VIEWS.OTP:
                return "OTP Verification";
            case MODAL_VIEWS.SIGN_UP:
                return "Create Account";
            case MODAL_VIEWS.PASSWORD:
                return "Password Verification";
            default:
                return "Sign In";
        }
    };

    // Render form content
    const renderContent = () => (
        <>
            {serverError && (
                <Alert variant="primary" className="mt-2">
                    {serverError}
                </Alert>
            )}

            {currentView === MODAL_VIEWS.OTP ? (
                <Form noValidate onSubmit={handleVerifyOtp} className="d-flex flex-column flex-grow-1">
                    <div className="d-flex flex-column flex-grow-1">
                        <Form.Group controlId="otp" className="mb-3">
                            <Form.Label>Enter OTP</Form.Label>
                            <Form.Control
                                type="text"
                                size=""
                                value={otp}
                                autoFocus
                                className="card-glassmorphism__input"
                                placeholder="Enter 6-digit OTP"
                                onChange={(e) => {
                                    setOTP(e.target.value.replace(/\D/g, "").slice(0, 6));
                                    setTouched(prev => ({ ...prev, otp: true }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleVerifyOtp(e);
                                }}
                                isInvalid={touched.otp && !!validationErrors.otp}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.otp}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center sticky-mobile-footer">
                            <CustomBtn
                                type="button"
                                variant="default"
                                className="btn-tertiary"
                                HandleClick={handleBack}
                                buttonText="Back"
                                disabled={isLoading}
                                hideIcon={true}
                            // className="w-100"
                            />
                            <CustomBtn
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                icon={isLoading ? <LoaderCircle className="spin" /> : null}
                                buttonText={isLoading ? "Verifying..." : "Verify OTP"}
                                className="w-100"
                            />
                        </div>


                        <div className="text-center pb-3">
                            <p className="my-3">OTP sent to your mobile number and email</p>
                            {timerVisible && otpSent ? (
                                <p className="text-muted">
                                    Resend OTP in {countdown} seconds
                                </p>
                            ) : (
                                <CustomBtn
                                    variant="link"
                                    className="p-0"
                                    HandleClick={() => handleLogin()}
                                    disabled={isLoading}
                                    icon={isLoading ? <LoaderCircle className="spin" /> : null}
                                    type="button"
                                    buttonText={isLoading ? "Sending..." : "Resend OTP"}
                                />
                            )}
                        </div>
                    </div>
                </Form>
            ) : currentView === MODAL_VIEWS.SIGN_UP ? (
                <Form noValidate onSubmit={handleSignUp} className="d-flex flex-column flex-grow-1">
                    <div className="p-3 d-flex flex-column flex-grow-1">
                        <Row className="mb-3 g-3">
                            <Col sm={12}>
                                <Form.Group controlId="name">
                                    <Form.Label>Full Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        required
                                        className="card-glassmorphism__input"
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setTouched(prev => ({ ...prev, name: true }));
                                        }}
                                        size={isMobile ? "sm" : ""}
                                        autoFocus
                                        isInvalid={touched.name && !!validationErrors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={12} md={6}>
                                <Form.Group controlId="number">
                                    <Form.Label>Phone Number *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter phone number"
                                        value={number}
                                        className="card-glassmorphism__input"
                                        maxLength={12}
                                        required
                                        size={isMobile ? "sm" : ""}
                                        onChange={(e) => {
                                            setNumber(e.target.value.replace(/\D/g, ""));
                                            setTouched(prev => ({ ...prev, number: true }));
                                        }}
                                        isInvalid={touched.number && !!validationErrors.number}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.number}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={12} md={6}>
                                <Form.Group controlId="email">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        className="card-glassmorphism__input"
                                        placeholder="Enter email"
                                        value={email}
                                        required
                                        size={isMobile ? "sm" : ""}
                                        onChange={(e) => {
                                            setEmail(e.target.value.toLowerCase());
                                            setTouched(prev => ({ ...prev, email: true }));
                                        }}
                                        isInvalid={touched.email && !!validationErrors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {validationErrors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            {is_address_required && (
                                <Col sm={12}>
                                    <Form.Group controlId="address">
                                        <Form.Label>Address *</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            className="card-glassmorphism__input"
                                            placeholder="Enter your address"
                                            value={address}
                                            required
                                            size={isMobile ? "sm" : ""}
                                            onChange={(e) => {
                                                setAddress(e.target.value);
                                                setTouched(prev => ({ ...prev, address: true }));
                                            }}
                                            isInvalid={touched.address && !!validationErrors.address}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {validationErrors.address}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>

                        <div className="mb-3">
                            <Form.Check
                                type="checkbox"
                                id="terms-agreement"
                                label="I agree with the terms of use"
                                checked={termsAccepted}
                                onChange={(e) => {
                                    setTermsAccepted(e.target.checked);
                                    setTouched(prev => ({ ...prev, terms: true }));
                                }}
                                isInvalid={touched.terms && !!validationErrors.terms}
                                required
                            />
                            <Form.Control.Feedback
                                type="invalid"
                                style={{
                                    display: touched.terms && validationErrors.terms ? "block" : "none",
                                }}
                            >
                                {validationErrors.terms}
                            </Form.Control.Feedback>
                        </div>
                        <div className="d-flex justify-content-between align-items-center sticky-mobile-footer">
                            <CustomBtn
                                variant="link"
                                HandleClick={handleBack}
                                type="button"
                                className="p-0 text-decoration-none"
                                disabled={isLoading}
                                buttonText={isLoading ? "Processing..." : "Back to Login"}
                                icon={<ChevronLeft size={16} className="me-1" />}
                                iconPosition="left"
                                size="sm"
                            />

                            <CustomBtn
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                icon={isLoading ? <LoaderCircle className="spin" /> : null}
                                buttonText={isLoading ? "Creating Account..." : "Sign Up"}
                                className="w-100"
                                size='sm'
                            />
                        </div>
                    </div>
                </Form>
            ) : currentView === MODAL_VIEWS.PASSWORD ? (
                <Form noValidate onSubmit={handleVerifyPassword} className="d-flex flex-column flex-grow-1">
                    <div className="p-3 d-flex flex-column flex-grow-1">
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <PasswordField
                                value={password}
                                setPassword={(value) => {
                                    setPassword(value);
                                    setTouched(prev => ({ ...prev, password: true }));
                                }}
                                handleKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleVerifyPassword(e);
                                    }
                                }}
                                isInvalid={touched.password && !!validationErrors.password}
                            />
                            <Form.Control.Feedback
                                type="invalid"
                                style={{
                                    display: touched.password && validationErrors.password ? "block" : "none",
                                }}
                            >
                                {validationErrors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex flex-column gap-2 pb-3 mt-auto">
                            <CustomBtn
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                icon={isLoading ? <LoaderCircle className="spin" /> : null}
                                buttonText={isLoading ? "Verifying..." : "Login"}
                                size="sm"
                                className="w-100"
                            />

                            <div className="d-flex justify-content-between align-items-center ">
                                <CustomBtn
                                    variant="link"
                                    HandleClick={handleBack}
                                    type="button"
                                    className="p-0 text-decoration-none"
                                    disabled={isLoading}
                                    buttonText={isLoading ? "Processing..." : "Back to Login"}
                                    icon={<ChevronLeft size={16} className="me-1" />}
                                    iconPosition="left"
                                    size="sm"
                                />

                                <CustomBtn
                                    variant="link"
                                    HandleClick={() => {
                                        handleModalClose();
                                        const emailParam = credential
                                            ? `?email=${encodeURIComponent(credential)}`
                                            : "";
                                        router.push(`/auth/lost-password${emailParam}`);
                                    }}
                                    type="button"
                                    className="p-0 text-muted"
                                    disabled={isLoading}
                                    size="sm"
                                    buttonText="Forgot Password?"
                                    hideIcon
                                />
                            </div>
                        </div>
                    </div>
                </Form>
            ) : (
                <Form noValidate onSubmit={handleLogin} className="d-flex flex-column flex-grow-1">
                    <div className="p-3 d-flex flex-column flex-grow-1">
                        <Form.Group controlId="credential" className="mb-3">
                            {/* <Form.Label>Email or Mobile Number</Form.Label> */}
                            <InputGroup
                                className={`card-glassmorphism__input rounded-3 ${touched.credential && validationErrors.credential ? 'is-invalid' : ''
                                    }`}
                                hasValidation
                            >
                                {inputType && (
                                    <InputGroup.Text
                                        className="card-glassmorphism__input-prefix"
                                    >
                                        {inputType === 'email' ? (
                                            <Mail size={18} />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 900 600"
                                                width="20"
                                                height="14"
                                                style={{ display: 'block' }}
                                            >
                                                <rect fill="#FF9933" width="900" height="200" />
                                                <rect fill="#ffffff" y="200" width="900" height="200" />
                                                <rect fill="#138808" y="400" width="900" height="200" />
                                                <circle fill="#000080" cx="450" cy="300" r="80" />
                                                <circle fill="#ffffff" cx="450" cy="300" r="70" />
                                                <circle fill="#000080" cx="450" cy="300" r="12.5" />
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <line
                                                        key={i}
                                                        x1="450"
                                                        y1="300"
                                                        x2={450 + 70 * Math.cos((i * 15 * Math.PI) / 180)}
                                                        y2={300 + 70 * Math.sin((i * 15 * Math.PI) / 180)}
                                                        stroke="#000080"
                                                        strokeWidth="2"
                                                    />
                                                ))}
                                            </svg>
                                        )}
                                    </InputGroup.Text>
                                )}
                                <Form.Control
                                    type="text"
                                    placeholder="Enter mobile number or email address"
                                    value={credential}
                                    onChange={(e) => {
                                        setCredential(e.target.value);
                                        setTouched(prev => ({ ...prev, credential: true }));
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleLogin(e);
                                    }}
                                    isInvalid={touched.credential && !!validationErrors.credential}
                                    required
                                />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid" style={{ display: touched.credential && validationErrors.credential ? 'block' : 'none' }}>
                                {validationErrors.credential}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <span style={{ fontSize: '14px' }} className="text-white mt-2 mb-3 d-block">
                            By continuing, you agree to accept our <Link href="/terms-and-conditions" className="text-decoration-underline text-primary">Terms & Conditions</Link> and <Link href="/privacy-policy" className="text-decoration-underline text-primary">Privacy Policy</Link>.
                        </span>

                        <div className="mt-auto ">
                            <CustomBtn
                                type="submit"
                                variant="primary"
                                disabled={isLoading}
                                icon={isLoading ? <LoaderCircle className="spin" /> : null}
                                buttonText={isLoading ? "Processing..." : "Continue"}
                                size="sm"
                                className="w-100"
                            />
                        </div>
                    </div>
                </Form>




            )}
        </>
    );

    const offcanvasBodyRef = useRef(null);

    // Auto-scroll to focused input on mobile
    useEffect(() => {
        const body = offcanvasBodyRef.current;
        if (!isMobile || !body || !show) return;

        const handleFocus = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500); // Delay for keyboard animation
            }
        };

        body.addEventListener('focusin', handleFocus);

        return () => {
            body.removeEventListener('focusin', handleFocus);
        };
    }, [isMobile, show]);

    // Render as Modal for desktop or Offcanvas for mobile
    return isMobile ? (
        <CustomDrawer
            showOffcanvas={show}
            setShowOffcanvas={() => handleModalClose()}
            placement="bottom"
            className="auth-offcanvas modal-glass-bg"
            hideIndicator={false}
            title={
                <div className="w-100 d-flex justify-content-center">
                    <Logo height={107} width={240}
                        mobileUrl={"/assets/images/logo/logo.webp"} />
                </div>
            }
            style={{
                height: 'auto',
                minHeight: '85vh',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
            }}
        >
            <div ref={offcanvasBodyRef} className="pt-0 pb-2 d-flex flex-column" style={{ overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </CustomDrawer>
    ) : (
        <Modal
            show={show}
            onHide={handleModalClose}
            size="lg"
            className="auth-modal modal-glass-bg"
            centered
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="w-100 text-center">
                    <Logo height={107} width={240} />
                    <h4 className="mb-0 text-light">{getTitle()}</h4>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-0 pb-2">
                {renderContent()}
            </Modal.Body>
        </Modal>
    );
});

LoginModal.displayName = "LoginModal";
export default LoginModal;
