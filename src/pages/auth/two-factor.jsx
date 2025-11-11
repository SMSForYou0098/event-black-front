import React, { memo, Fragment, useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '@/store/auth/authSlice';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/auth/authSlice';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { publicApi } from '@/lib/axiosInterceptor';
import CustomBtn from '@/utils/CustomBtn';
import { ChevronLeft } from 'lucide-react';

const TwoFactor = memo(() => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data, path } = router.query;
    const { loading: authLoading } = useSelector((state) => state.auth);

    const [otp, setOTP] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [timerVisible, setTimerVisible] = useState(true);
    const [otpSent, setOtpSent] = useState(true);
    const [countdown, setCountdown] = useState(30);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            toast.success('OTP has been sent successfully!');
        } else {
            router.push('/auth/login');
        }
    }, [data, router]);

     useEffect(() => {
        let timer;
        if (timerVisible && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        }
        if (countdown === 0) {
            setOtpSent(false);
            setTimerVisible(false);
        }
        return () => clearInterval(timer);
    }, [timerVisible, countdown]);


    const handleVerifyOtp = async () => {
        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }
        if (otp.length !== 6) {
            setError("OTP must be exactly 6 digits.");
            return;
        }
        setLoading(true);
        setError('');

        const resultAction = await dispatch(signIn({ otp, number: data  }));
        if (signIn.fulfilled.match(resultAction)) {
            toast.success('Login Successfully');
            router.push(typeof path === 'string' ? path : '/');
        } else {
            setAttempts(prev => prev + 1);
            if (resultAction.payload) {
                setError(resultAction.payload );
            } else {
                setError('An unknown error occurred.');
            }
            if (attempts >= 2) {
                dispatch(logout());
                router.push('/auth/login');
            }
        }
        setLoading(false);
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            await publicApi.post('/verify-user', { data });
            setOtpSent(true);
            setTimerVisible(true);
            setCountdown(30);
            toast.success('OTP has been re-sent successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        }
        setLoading(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && otp && otp.length === 6) {
            handleVerifyOtp();
        }
    };

    return (
        <Fragment>
            <main className='main-content'>
                 <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
                    <Container>
                        <Row className='justify-content-center align-items-center height-self-center vh-100'>
                            <Col lg="5" md="12" className='align-self-center'>
                                {/* Applied the glassmorphism card style */}
                                <Card className="user-login-card p-4 card-glassmorphism">
                                    <div className="mb-4 text-center">
                                        <h5 className="text-white mb-3">Two-Factor Verification</h5>
                                        <p className="text-white-75">Enter the 6-digit OTP sent to your device.</p>
                                    </div>
                                    {error && <Alert variant="primary">{error}</Alert>}
                                    <Form.Group className="mb-4">
                                        {/* Applied the input style */}
                                        <Form.Control
                                            type="text"
                                            value={otp}
                                            placeholder="Enter 6-digit OTP"
                                            maxLength={6}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                setOTP(value);
                                                if (error) setError('');
                                            }}
                                            onKeyDown={handleKeyDown}
                                            autoFocus
                                            className="text-center card-glassmorphism__input"
                                        />
                                    </Form.Group>

                                    <div className="full-button mb-3">
                                        {/* Applied the gradient button style */}
                                        <CustomBtn
                                            className="btn text-uppercase position-relative w-100 "
                                            HandleClick={handleVerifyOtp}
                                            disabled={!otp || otp.length !== 6 || loading || authLoading}
                                            buttonText={loading || authLoading ? 'Verifying...' : 'Verify OTP'}
                                            size='sm'
                                        />
                                    </div>

                                    <div className="mt-3 d-flex justify-content-between align-items-center">
                                        <Link href="/auth/login" className="text-primary fw-bold d-flex align-items-center">
                                            <ChevronLeft size={16} /> Back to Login
                                        </Link>
                                        {timerVisible && otpSent ? (
                                            <p className='mb-0 text-white-75'>Resend OTP in {countdown}s</p>
                                        ) : (
                                            <CustomBtn
                                                buttonText={loading ? 'Sending...' : 'Resend OTP'}
                                                className="link-glassmorphism p-1"
                                                HandleClick={handleSendOtp}
                                                disabled={loading}
                                                size='sm'
                                            />
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </main>
        </Fragment>
    )
});

TwoFactor.displayName = "TwoFactor";
TwoFactor.layout = "Blank";
export default TwoFactor;