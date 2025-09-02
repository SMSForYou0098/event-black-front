import React, { memo, Fragment, useState, useEffect } from 'react';
import { Row, Col, Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { signIn, logout } from '@/store/auth/authSlice';
import { AppDispatch } from '@/store';
// import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PasswordField } from '../../components/auth/CustomFormFields';

const VerifyPassword = memo(() => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data, session_id, auth_session } = router.query;

    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!data || !session_id || !auth_session) {
            router.push('/auth/login');
        }
    }, [data, session_id, auth_session, router]);

    const handleVerification = async () => {
        if (!password) {
            setError('Password is required.');
            return;
        }
        setLoading(true);
        setError('');

        const loginData = {
            password,
            number: data ,
            passwordRequired: true,
            session_id: session_id ,
            auth_session: auth_session ,
        };

        const resultAction = await dispatch(signIn(loginData));

        if (signIn.fulfilled.match(resultAction)) {
            toast.success('Login Successful!');
            router.push('/dashboard');
        } else {
            setAttempts(prev => prev + 1);
            if (resultAction.payload) {
                setError(resultAction.payload);
            } else {
                setError('Login failed. Please check your credentials.');
            }
            if (attempts >= 2) {
                dispatch(logout());
                toast.error("Too many failed attempts. You have been logged out.");
                router.push('/auth/login');
            }
        }
        setLoading(false);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && password) {
            handleVerification();
        }
    };

    return (
        <Fragment>
            <main className='main-content'>
                 <div className='vh-100' style={{ backgroundImage: "url(/assets/images/pages/01.webp)", backgroundSize: 'cover', backgroundRepeat: "no-repeat", position: 'relative', minHeight: '500px' }}>
                    <Container>
                        <Row className='justify-content-center align-items-center height-self-center vh-100'>
                            <Col lg="5" md="12" className='align-self-center'>
                                <Card className="user-login-card bg-body">
                                    <Card.Body className="p-4 p-md-5">
                                        <div className="mb-4 text-center">
                                            <h2 className="text-dark mb-3">Enter Password</h2>
                                            <p>Enter your password for {data}</p>
                                        </div>
                                         {error && <Alert variant="danger">{error}</Alert>}
                                        <Form.Group className="mb-4">
                                            <Form.Label htmlFor="password-field">Password</Form.Label>
                                            {/* --- REPLACED WITH PasswordField COMPONENT --- */}
                                            <PasswordField
                                                idValue="password-field"
                                                value={password}
                                                setPassword={setPassword}
                                                handleKeyDown={handleKeyDown}
                                                className="rounded-0"
                                                autoFocus
                                            />
                                        </Form.Group>
                                        <Form.Group className="text-end mb-3">
                                            <Link href="/auth/lost-password" passHref>
                                                Forgot Password?
                                            </Link>
                                        </Form.Group>
                                        <div className="full-button">
                                            <Button
                                                variant="primary"
                                                className="w-100"
                                                onClick={handleVerification}
                                                disabled={!password || loading}
                                            >
                                                {loading ? 'Verifying...' : 'Sign In'}
                                            </Button>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <Link href="/auth/login" className='text-primary'>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </main>
        </Fragment>
    );
});

VerifyPassword.displayName = "VerifyPassword";
// VerifyPassword.layout = "Blank";
export default VerifyPassword;
