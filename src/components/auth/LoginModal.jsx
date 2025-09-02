import React, { Fragment, memo, useEffect, useState } from 'react';
import { Modal, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { publicApi } from '@/lib/axiosInterceptor';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { signIn, logout } from '@/store/auth/authSlice';
import { PasswordField } from '../../components/CustomComponents/CustomFormFields';
import { ChevronLeft } from 'lucide-react';

const MODAL_VIEWS = {
    SIGN_IN: 'SIGN_IN',
    SIGN_UP: 'SIGN_UP',
    OTP: 'OTP',
    PASSWORD: 'PASSWORD'
};

const LoginModal = memo(({ show, onHide, eventKey, redirectPath }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    
    // States
    const [currentView, setCurrentView] = useState(MODAL_VIEWS.SIGN_IN);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timerVisible, setTimerVisible] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [credential, setCredential] = useState('');
    const [otp, setOTP] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [password, setPassword] = useState('');
    const [countdown, setCountdown] = useState(30);
    const [resendCount, setResendCount] = useState(0);
    const [sessionData, setSessionData] = useState(null);
    
    const MAX_RESEND_ATTEMPTS = 3;
    const RESEND_COOLDOWN = 60; // seconds

    useEffect(() => {
        let timer;
        if (timerVisible && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timerVisible, countdown]);

    useEffect(() => {
        if (countdown === 0) {
            setTimerVisible(false);
        }
    }, [countdown]);

    // Clear error on tab change
    useEffect(() => {
        setError('');
    }, [currentView]);

    const handleModalClose = () => {
        // Reset all form fields and states
        setError('');
        setOTP('');
        setEmail('');
        setNumber('');
        setName('');
        setCredential('');
        setResendCount(0);
        setLoading(false);
        setCurrentView(MODAL_VIEWS.SIGN_IN);
        setOtpSent(false);
        setTimerVisible(false);
        setCountdown(30);
        setAttempts(0);
        setPassword('');
        setSessionData(null);

        // Only remove OTP timer for current number if it exists
        if (credential) {
            localStorage.removeItem(`lastOtpResendTime_${credential}`);
        }

        onHide();
    };

    const handleLogin = async (data) => {
        let crd = credential || data;
        if (!crd) {
            setError('Please Enter The Mobile No / Email Address');
            return;
        }

        const lastResendKey = `lastOtpResendTime_${crd}`;
        const lastResendTime = localStorage.getItem(lastResendKey);
        const currentTime = Date.now();
        
        if (lastResendTime && (currentTime - parseInt(lastResendTime)) < (RESEND_COOLDOWN * 1000)) {
            setError(`Please wait ${RESEND_COOLDOWN} seconds before requesting new OTP`);
            return;
        }

        if (resendCount >= MAX_RESEND_ATTEMPTS) {
            setError('Maximum OTP resend attempts reached. Please try again later.');
            return;
        }

        setLoading(true);
        try {
            const response = await publicApi.post('/verify-user', { data: crd });
            if (response.data.status) {
                if (response.data.pass_req) {
                    setCurrentView(MODAL_VIEWS.PASSWORD);
                    setSessionData({
                        data: crd,
                        session_id: response.data.session_id,
                        auth_session: response.data.auth_session
                    });
                } else {
                    setError('');
                    setTimerVisible(true);
                    setCountdown(30);
                    setCurrentView(MODAL_VIEWS.OTP);
                    setOtpSent(true);
                    setOTP('');
                    setResendCount(prev => prev + 1);
                    setCredential(crd);
                    localStorage.setItem(lastResendKey, currentTime?.toString());
                }
            }
        } catch (err) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const isEmail = emailRegex.test(crd);
            if (isEmail) {
                setEmail(crd);
                setNumber('');
            } else {
                setNumber(crd);
                setEmail('');
            }
            setError('');
            setCurrentView(MODAL_VIEWS.SIGN_UP);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('Please enter OTP');
            return;
        }
       
        setLoading(true);
        try {
            const loginData = { otp, number: credential };
            const resultAction = await dispatch(signIn(loginData));
            
            if (signIn.fulfilled.match(resultAction)) {
                handleModalClose();
                router.push(redirectPath || `/events/${eventKey}/process`);
            } else {
                setError(resultAction.payload || 'OTP verification failed');
                setAttempts(prev => prev + 1);
                if (attempts >= 2) {
                    dispatch(logout());
                    setCurrentView(MODAL_VIEWS.SIGN_IN);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            setAttempts(prev => prev + 1);
            if (attempts >= 2) {
                dispatch(logout());
                setCurrentView(MODAL_VIEWS.SIGN_IN);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        if (!name || !number) {
            setError('Please fill in all required fields.');
            return;
        }
        
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address.');
                return;
            }
        }
        
        try {
            const response = await publicApi.post('/create-user', {
                name,
                email,
                number,
                role_id: 4
            });
            
            if (response.data.status) {
                setCredential(number || email);
                await handleLogin(number || email);
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPassword = async () => {
        if (!password) {
            setError('Password is required');
            return;
        }
        
        if (!sessionData) {
            setError('Session expired. Please try again.');
            return;
        }
        
        setLoading(true);
        try {
            const loginData = {
                password,
                number: sessionData.data,
                passwordRequired: true,
                session_id: sessionData.session_id,
                auth_session: sessionData.auth_session,
            };

            const resultAction = await dispatch(signIn(loginData));
            
            if (signIn.fulfilled.match(resultAction)) {
                handleModalClose();
                router.push(redirectPath || `/events/${eventKey}/process`);
            } else {
                setError(resultAction.payload || 'Password verification failed');
                setAttempts(prev => prev + 1);
                if (attempts >= 2) {
                    dispatch(logout());
                    setCurrentView(MODAL_VIEWS.SIGN_IN);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            setAttempts(prev => prev + 1);
            if (attempts >= 2) {
                dispatch(logout());
                setCurrentView(MODAL_VIEWS.SIGN_IN);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentView(MODAL_VIEWS.SIGN_IN);
        setError('');
    };

    return (
        <Modal show={show} onHide={handleModalClose} size="lg" centered className="auth-modal">
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
                {error && <Alert variant="primary" className="mb-3">{error}</Alert>}

                {currentView === MODAL_VIEWS.OTP ? (
                    <div className="p-3">
                        <div className="form-group">
                            <Form.Group controlId="otp">
                                <Form.Label>Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={otp}
                                    autoFocus
                                    className="form-control-lg text-center"
                                    placeholder="Enter 6-digit OTP"
                                    onChange={(e) => setOTP(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOtp(); }}
                                />
                            </Form.Group>
                        </div>

                        <div className="d-flex gap-3 justify-content-center my-3">
                            <Button 
                                variant="primary" 
                                onClick={handleVerifyOtp} 
                                disabled={loading || !otp}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button variant="outline-secondary" onClick={handleBack}>
                                Change Number
                            </Button>
                        </div>

                        <div className="text-center pb-3">
                            <p className="my-3">OTP sent to your mobile number and email</p>
                            {timerVisible && otpSent ? (
                                <p className="text-muted">
                                    Resend OTP in {countdown} seconds
                                </p>
                            ) : (
                                <Button 
                                    variant="link" 
                                    onClick={() => handleLogin(credential)} 
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Resend OTP'}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : currentView === MODAL_VIEWS.SIGN_UP ? (
                    <>
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
                                            onChange={(e) => setName(e.target.value)}
                                            autoFocus
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={12} md={6}>
                                    <Form.Group controlId="number">
                                        <Form.Label>Phone Number *</Form.Label>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={number}
                                            required
                                            onChange={(e) => setNumber(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={12} md={6}>
                                    <Form.Group controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="d-flex align-items-center gap-3 pb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="terms-agreement"
                                    label="I agree with the terms of use"
                                    className="mb-0"
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleSignUp}
                                    disabled={loading || !name || !number}
                                    className="ms-auto"
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </Button>
                            </div>
                        </div>
                        <p className="text-center">
                            Already have an account?{' '}
                            <Button variant="link" onClick={() => setCurrentView(MODAL_VIEWS.SIGN_IN)} className="p-0">
                                Sign in
                            </Button>
                        </p>
                    </>
                ) : currentView === MODAL_VIEWS.PASSWORD ? (
                    <div className="p-3">
                        <div className="form-group">
                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <PasswordField
                                    value={password}
                                    setPassword={setPassword}
                                    handleKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleVerifyPassword();
                                        }
                                    }}
                                />
                            </Form.Group>
                        </div>

                        <div className="text-center pb-3">
                            <Button
                                variant="primary"
                                disabled={loading || !password}
                                onClick={handleVerifyPassword}
                            >
                                {loading ? 'Verifying...' : 'Login'}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={handleBack}
                            >
                                <ChevronLeft size={16} /> Back to Login
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-3">
                            <div className="form-group">
                                <Form.Group controlId="credential">
                                    <Form.Label>Email or Mobile Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter email or mobile number"
                                        onChange={(e) => setCredential(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                                    />
                                </Form.Group>
                            </div>

                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="remember-me"
                                    label="Remember Me"
                                    className="mb-0"
                                />
                                <Button
                                    variant="primary"
                                    disabled={loading || !credential}
                                    onClick={() => handleLogin()}
                                >
                                    {loading ? 'Processing...' : 'Next'}
                                </Button>
                            </div>
                        </div>

                        <p className="text-center">
                            Don't have an account?{' '}
                            <Button variant="link" onClick={() => setCurrentView(MODAL_VIEWS.SIGN_UP)} className="p-0">
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