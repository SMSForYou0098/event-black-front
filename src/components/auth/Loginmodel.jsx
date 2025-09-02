import React, { memo, Fragment, useState, useEffect } from 'react'
import { Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { signIn, logout } from '@/store/auth/authSlice';
import { useMyContext } from "@/Context/MyContextProvider";

import { AlertCircle, ArrowLeft } from 'lucide-react'
import { persistor } from '../../../../../store'
import { PasswordField } from './CustomFormFields'

export const handleVerifyPassword = async (details, setLoading, dispatch, successAlert, history, to, setError, setAttempts) => {
    if (details.password) {
        setLoading(true)
        const data = { password: details.password, number: details.number, passwordRequired: details.passwordRequired, session_id: details.session_id, auth_session: details.auth_session }
        const user = await dispatch(signIn(data))
        if (user?.type === 'login/fulfilled') {
            setLoading(false)
            successAlert('Success', 'Login Successfully')
            // history('/dashboard');
            if(to){
                history(to);
            }
            return user?.payload
        } else {
            setLoading(false)
            setError(user?.payload)
        }
    } else {
        setLoading(false)
        setAttempts(prevAttempts => prevAttempts + 1);
        if (details?.attempts >= 2) {
            dispatch(logout())
            persistor.purge();
        }
    }
};
const VerifyPassword = memo(() => {
    const { successAlert } = useMyContext();
    let history = useNavigate();
    const dispatch = useDispatch();
    let location = useLocation();
    let number = location?.state?.info?.data;
    let session_id = location?.state?.info?.session_id;
    let passwordRequired = location?.state?.info?.password_required;
    let auth_session = location?.state?.info?.auth_session;
    const [password, setPassword] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!number) {
            navigate('/sign-in')
        }
    }, []);

    useEffect(() => {
        setPassword('');
        setAttempts(0);
        setError('');
        setLoading(false);

        const isConfirmedLeave = sessionStorage.getItem('isConfirmedLeave');
        if (isConfirmedLeave) {
            navigate('/sign-in');
            sessionStorage.removeItem('isConfirmedLeave');
        }
        const handleBeforeUnload = (event) => {
            const confirmationMessage = 'Are you sure you want to leave? Your current data will be lost.';
            event.returnValue = confirmationMessage;
            return confirmationMessage;
        };

        const handleUnload = (event) => {
            sessionStorage.setItem('isConfirmedLeave', 'true');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [navigate]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && password) {
            VerifyPassword();
        }
    };

    const VerifyPassword = () => {
        const details = {
            password,
            session_id,
            auth_session,
            passwordRequired: true,
        };
        let to = '/dashboard';
        handleVerifyPassword(details, setLoading, dispatch, successAlert, history, to, setError, setAttempts);
    }
    return (
        <Fragment>
            {/* <ToastContainer /> */}
            <div className="iq-auth-page">
                {/* <Autheffect /> */}
                <Row className="align-items-center iq-auth-container w-100" style={{marginLeft:'0'}}>
                    <Col lg="4" className="col-10 offset-lg-7 offset-1">
                        <Card>
                            <Card.Body className="p-4 p-md-5">
                                <div className="mb-4">
                                    <Button 
                                        variant="link" 
                                        className="text-dark p-0 mb-3 d-flex align-items-center"
                                        onClick={() => navigate('/sign-in')}
                                    >
                                        <ArrowLeft size={20} className="me-1" />
                                        Back to Sign In
                                    </Button>
                                    
                                    <h2 className="text-dark mb-3">Password Verification</h2>
                                    <p className="text-dark mb-4">
                                        Enter your password to continue to your account
                                    </p>
                                
                                    {error && (
                                        <Alert variant="danger" className="d-flex align-items-center mb-4">
                                            <AlertCircle size={18} className="me-2" />
                                            <span>{error}</span>
                                        </Alert>
                                    )}

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-dark mb-2">Password</Form.Label>
                                        <PasswordField 
                                            value={password} 
                                            setPassword={setPassword} 
                                            handleKeyDown={handleKeyDown}
                                            className="py-3"
                                            autoFocus
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-100 py-3"
                                        onClick={VerifyPassword}
                                        disabled={!password || loading}
                                    >
                                        {loading ? 'Verifying...' : 'Continue'}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Fragment>
    )
})

VerifyPassword.displayName = "VerifyPassword"
export default VerifyPassword
