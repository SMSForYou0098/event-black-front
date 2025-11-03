import React, { Fragment, memo, useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { signIn, logout } from "@/store/auth/authSlice";
import { PasswordField } from "../../components/CustomComponents/CustomFormFields";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import CustomBtn from "../../utils/CustomBtn";

const MODAL_VIEWS = {
  SIGN_IN: "SIGN_IN",
  SIGN_UP: "SIGN_UP",
  OTP: "OTP",
  PASSWORD: "PASSWORD",
};

const LoginModal = memo(({ show, onHide, eventKey, redirectPath }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // States
  const [currentView, setCurrentView] = useState(MODAL_VIEWS.SIGN_IN);
  const [otpSent, setOtpSent] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
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

  const MAX_RESEND_ATTEMPTS = 3;
  const RESEND_COOLDOWN = 60; // seconds

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
          setCountdown(30);
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
      setCurrentView(MODAL_VIEWS.SIGN_UP);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await publicApi.post("/create-user", userData);
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
      router.push(redirectPath || `/events/${eventKey}/process`);
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
      router.push(redirectPath || `/events/${eventKey}/process`);
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

  // Clear validation errors on tab change
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

  // Real-time validation for Sign In
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

  // Real-time validation for OTP
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

  // Real-time validation for Password
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

  // Real-time validation for Sign Up
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
    // Reset all form fields and states
    setServerError("");
    setValidationErrors({});
    setTouched({});
    setOTP("");
    setEmail("");
    setNumber("");
    setName("");
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

    // Only remove OTP timer for current number if it exists
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

    // Mark field as touched
    setTouched({ credential: true });

    const errors = {};
    let isValid = true;

    // Validate credential
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

    // Mark field as touched
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

    // Mark all fields as touched
    setTouched({
      name: true,
      number: true,
      email: true,
      terms: true,
    });

    const errors = {};
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      errors.name = "Full name is required";
      isValid = false;
    }

    // Validate phone number
    if (!number.trim()) {
      errors.number = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(number)) {
      errors.number = "Please enter a valid phone number (10-12 digits)";
      isValid = false;
    }

    // Validate email (required)
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate terms
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
    });
  };

  const handleVerifyPassword = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Mark field as touched
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

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      size="lg"
      className="auth-modal modal-glass-bg"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center">
          <h4 className="mb-0 text-light">
            {currentView === MODAL_VIEWS.OTP && "OTP Verification"}
            {currentView === MODAL_VIEWS.SIGN_UP && "Create Account"}
            {currentView === MODAL_VIEWS.SIGN_IN && "Sign In"}
            {currentView === MODAL_VIEWS.PASSWORD && "Password Verification"}
          </h4>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        {serverError && (
          <Alert variant="primary" className="mt-2">
            {serverError}
          </Alert>
        )}

        {currentView === MODAL_VIEWS.OTP ? (
          <Form noValidate onSubmit={handleVerifyOtp}>
            <div className="">
              <Form.Group controlId="otp" className="mb-3">
                <Form.Label>Enter OTP</Form.Label>
                <Form.Control
                  type="text"
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

              <div className="d-flex gap-3 justify-content-center my-3">
                <CustomBtn
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  icon={isLoading ? <LoaderCircle className="spin" /> : null}
                  buttonText={isLoading ? "Verifying..." : "Verify OTP"}
                />
                <CustomBtn
                  type="button"
                  variant="secondary"
                  HandleClick={handleBack}
                  icon={isLoading ? <LoaderCircle className="spin" /> : null}
                  buttonText="Back"
                  disabled={isLoading}
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
          <>
            <Form noValidate onSubmit={handleSignUp}>
              <div className="p-3">
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

                <div className="d-flex justify-content-end pb-3">
                  <CustomBtn
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    icon={isLoading ? <LoaderCircle className="spin" /> : null}
                    buttonText={isLoading ? "Creating Account..." : "Sign Up"}
                  />
                </div>
              </div>
            </Form>
          </>
        ) : currentView === MODAL_VIEWS.PASSWORD ? (
          <Form noValidate onSubmit={handleVerifyPassword}>
            <div className="p-3">
              <Form.Group controlId="password" className="mb-3">
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

              <div className="text-end pb-3">
                <CustomBtn
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  icon={isLoading ? <LoaderCircle className="spin" /> : null}
                  buttonText={isLoading ? "Verifying..." : "Login"}
                />
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleBack}
                  type="button"
                  className="p-0"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Back to Login"}
                  <ChevronLeft size={16} className="me-1" />
                </Button>
              </div>
            </div>
          </Form>
        ) : (
          <>
            <Form noValidate onSubmit={handleLogin}>
              <div className="p-3">
                <Form.Group controlId="credential" className="mb-3">
                  <Form.Label>Email or Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    className="card-glassmorphism__input"
                    placeholder="Enter email or mobile number"
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
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.credential}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label="Remember Me"
                    className="mb-0"
                  />
                  <CustomBtn
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    icon={isLoading ? <LoaderCircle className="spin" /> : null}
                    buttonText={isLoading ? "Processing..." : "Next"}
                  />
                </div>
              </div>
            </Form>

            <p className="text-center">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => setCurrentView(MODAL_VIEWS.SIGN_UP)}
                className="p-0"
              >
                Sign up
              </Button>
            </p>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
});

LoginModal.displayName = "LoginModal";
export default LoginModal;