import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Form, Button, Alert, InputGroup, Badge } from 'react-bootstrap';
import { User, Phone, ArrowRight, CheckCircle, AlertCircle, KeyRound, RotateCcw, Ticket, Send } from 'lucide-react';
import CustomDrawer from '@/utils/CustomDrawer';
import CustomBtn from '@/utils/CustomBtn';
import { getUserByPhone, createTransferUser, transferBooking, verifyTransferOtp } from '@/services/transferService';
import { useMyContext } from '@/Context/MyContextProvider';
import { StepIndicator, UserInfoCard } from '../../events/Profile/TransferBookingDrawer';


const TokenTransferDrawer = ({
    show,
    onHide,
    ticketData,
    token, // master token from URL, used as booking_id
    onTransferSuccess
}) => {
    const { UserData, successAlert } = useMyContext();

    const eventData = useMemo(() => {
        return {
            eventId: ticketData?.event?.id,
            otpRequired: ticketData?.controls?.ticket_transfer_otp ?? true,
            eventName: ticketData?.event?.name || 'Event'
        };
    }, [ticketData]);

    // Form data state
    const [formData, setFormData] = useState({ phone: '', confirmPhone: '', name: '', email: '' });
    const [isSearching, setIsSearching] = useState(false);
    const [userFound, setUserFound] = useState(null);
    const [targetUser, setTargetUser] = useState(null);

    // OTP states
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [transferHashKey, setTransferHashKey] = useState(null);

    // Transfer states
    const [quantity, setQuantity] = useState(1);
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [alertCountdown, setAlertCountdown] = useState(0);
    const [createUserStepCompleted, setCreateUserStepCompleted] = useState(false);

    const maxQuantity = ticketData?.data?.length || 1;

    const { steps, currentStep } = useMemo(() => {
        const baseSteps = userFound === false
            ? [
                { num: 1, label: 'Find User' },
                { num: 2, label: 'Create User' },
                { num: 3, label: 'Verify' },
                { num: 4, label: 'Transfer' }
            ]
            : [
                { num: 1, label: 'Find User' },
                { num: 2, label: 'Verify' },
                { num: 3, label: 'Transfer' }
            ];

        let current = 1;
        if (userFound === null) current = 1;
        else if (userFound === false) {
            if (!createUserStepCompleted) current = 2;
            else if (!otpVerified) current = 3;
            else current = 4;
        } else {
            if (!otpVerified) current = 2;
            else current = 3;
        }
        return { steps: baseSteps, currentStep: current };
    }, [userFound, createUserStepCompleted, otpVerified]);

    const phoneInputRef = useRef(null);
    const otpInputRef = useRef(null);

    useEffect(() => {
        if (otpSent && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [otpSent]);

    useEffect(() => {
        if (error || success) setAlertCountdown(3);
    }, [error, success]);

    useEffect(() => {
        if (!(error || success) || alertCountdown <= 0) return;
        const id = setInterval(() => {
            setAlertCountdown((prev) => {
                if (prev <= 1) {
                    setError('');
                    setSuccess('');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [error, success, alertCountdown]);

    const resetForm = useCallback(() => {
        setFormData({ phone: '', confirmPhone: '', name: '', email: '' });
        setUserFound(null);
        setTargetUser(null);
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        setTransferHashKey(null);
        setQuantity(1);
        setError('');
        setSuccess('');
        setAlertCountdown(0);
        setCreateUserStepCompleted(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onHide();
    }, [resetForm, onHide]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleSearchUser = useCallback(async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (formData.phone.trim() !== formData.confirmPhone.trim()) {
            setError('Phone numbers do not match');
            return;
        }

        setIsSearching(true);
        setError('');
        setUserFound(null);
        setTargetUser(null);

        try {
            const response = await getUserByPhone(formData.phone);
            if (response.status && response.user) {
                setUserFound(true);
                setSuccess('Verified! Select quantity and transfer.');
                setTargetUser(response.user);
            } else {
                setUserFound(false);
                setTargetUser(null);
            }
        } catch (err) {
            setError('Failed to search user');
            setUserFound(false);
        } finally {
            setIsSearching(false);
        }
    }, [formData.phone, formData.confirmPhone]);

    useEffect(() => {
        if (
            formData.phone.length === 10 &&
            formData.confirmPhone.length === 10 &&
            formData.phone === formData.confirmPhone &&
            userFound === null &&
            !isSearching
        ) {
            handleSearchUser();
        }
    }, [formData.phone, formData.confirmPhone, userFound, isSearching, handleSearchUser]);

    const handleSendOtp = useCallback(async () => {
        if (userFound === false && !formData.name.trim()) {
            setError('Please enter the recipient\'s name');
            return;
        }

        setIsSendingOtp(true);
        setError('');

        try {
            const payload = {
                number: formData.phone,
                event_id: eventData.eventId,
                name: userFound === true ? targetUser?.name : formData.name,
                email: userFound === true ? targetUser?.email : (formData.email || undefined)
            };

            const response = await createTransferUser(payload);

            if (response.status) {
                if (response.user) {
                    setTargetUser(response.user);
                }

                if (!eventData.otpRequired) {
                    if (response.data?.hash_key) {
                        setTransferHashKey(response.data.hash_key);
                    }
                    if (response.data?.user_id) {
                        setTargetUser(prev => ({
                            ...prev,
                            id: response.data.user_id
                        }));
                    }
                    setOtpVerified(true);
                    setSuccess('Verified! Select quantity and transfer.');
                } else {
                    setOtpSent(true);
                    setSuccess('OTP sent to ' + formData.phone);
                }
            } else {
                let errorMessage = response.message || 'Failed to verify user';
                if (response.errors && typeof response.errors === 'object') {
                    const specificErrors = Object.values(response.errors).flat();
                    if (specificErrors.length > 0) {
                        errorMessage = specificErrors.join(' ');
                    }
                }
                setError(errorMessage);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    }, [formData, eventData, userFound, targetUser]);

    const handleVerifyOtp = useCallback(async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsVerifyingOtp(true);
        setError('');

        try {
            const verifyResponse = await verifyTransferOtp({
                number: formData.phone,
                otp: otp,
                event_id: eventData.eventId
            });

            if (verifyResponse.status) {
                setOtpVerified(true);
                setSuccess('Verified! Select quantity and transfer.');
                if (verifyResponse.data) {
                    setTransferHashKey(verifyResponse.data.hash_key);
                    setTargetUser(prev => ({
                        ...prev,
                        id: verifyResponse.data.user_id
                    }));
                }
            } else {
                let errorMessage = verifyResponse.message || 'Invalid OTP. Please try again.';
                if (verifyResponse.errors && typeof verifyResponse.errors === 'object') {
                    const specificErrors = Object.values(verifyResponse.errors).flat();
                    if (specificErrors.length > 0) {
                        errorMessage = specificErrors.join(' ');
                    }
                }
                setError(errorMessage);
            }
        } catch (err) {
            setError('Failed to verify OTP');
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [otp, formData.phone, eventData.eventId]);

    const handleTransfer = useCallback(async () => {
        if (!otpVerified) {
            setError('Please complete verification first');
            return;
        }

        setIsTransferring(true);
        setError('');
        setSuccess('');

        try {
            const transferPayload = {
                is_master: ticketData?.data?.length > 1 ? true : false,
                booking_id: ticketData?.id,
                transfer_from: UserData?.id,
                transfer_to: targetUser?.id,
                hash_key: transferHashKey,
                quantity: quantity,
                event_id: eventData.eventId
            };

            const transferResponse = await transferBooking(transferPayload);

            if (transferResponse.status) {
                successAlert('', transferResponse.message || 'Ticket transferred successfully!');
                handleClose();
                onTransferSuccess?.();
            } else {
                let errorMessage = transferResponse.message || 'Failed to transfer booking';
                if (transferResponse.errors && typeof transferResponse.errors === 'object') {
                    const specificErrors = Object.values(transferResponse.errors).flat();
                    if (specificErrors.length > 0) {
                        errorMessage = specificErrors.join(' ');
                    }
                }
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Transfer error:', err);
            setError('An error occurred during transfer');
        } finally {
            setIsTransferring(false);
        }
    }, [otpVerified, ticketData, token, UserData, targetUser, quantity, handleClose, transferHashKey, eventData.eventId, successAlert, onTransferSuccess]);

    return (
        <CustomDrawer
            title={
                <div className="d-flex align-items-center gap-2">
                    <Ticket size={18} className="text-primary" />
                    <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{maxQuantity} ticket(s) • {eventData.eventName}</span>
                </div>
            }
            showOffcanvas={show}
            setShowOffcanvas={handleClose}
            hideIndicator={true}
        >
            <div className="p-3">
                <StepIndicator steps={steps} currentStep={currentStep} />

                {error && (
                    <Alert dismissible variant="primary" className="py-2 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="py-2 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <CheckCircle size={16} />
                        <span>{success}</span>
                    </Alert>
                )}

                {/* Step 1: Find User */}
                {currentStep === 1 && (
                    <div className="animate__animated animate__fadeIn mb-4">
                        <Form.Label className="small text-muted mb-2 d-flex align-items-center gap-1">
                            <Phone size={14} />
                            Recipient&apos;s Phone Number
                        </Form.Label>
                        <InputGroup size="sm" className="card-glassmorphism__input rounded-3 mb-3">
                            <InputGroup.Text className="card-glassmorphism__input-prefix">+91</InputGroup.Text>
                            <Form.Control
                                ref={phoneInputRef}
                                type="tel"
                                size="sm"
                                placeholder="Enter 10-digit number"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                maxLength={10}
                                disabled={isSearching || userFound !== null}
                            />
                        </InputGroup>

                        <Form.Label className="small text-muted mb-2 d-flex align-items-center gap-1">
                            <Phone size={14} />
                            Confirm Recipient&apos;s Phone Number
                        </Form.Label>
                        <InputGroup size="sm" className="card-glassmorphism__input rounded-3">
                            <InputGroup.Text className="card-glassmorphism__input-prefix">+91</InputGroup.Text>
                            <Form.Control
                                type="tel"
                                size="sm"
                                placeholder="Re-enter 10-digit number"
                                value={formData.confirmPhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPhone: e.target.value.replace(/\D/g, '') }))}
                                maxLength={10}
                                disabled={isSearching || userFound !== null}
                            />
                        </InputGroup>
                        {formData.phone.trim().length === 10 && formData.confirmPhone.trim().length === 10 && formData.phone.trim() !== formData.confirmPhone.trim() && (
                            <Form.Text className="text-danger d-block mt-2">
                                <AlertCircle size={12} className="me-1" />
                                Phone numbers do not match
                            </Form.Text>
                        )}
                        {formData.phone.length > 0 && formData.phone.length < 10 && (
                            <Form.Text className="text-muted d-block mt-2">{10 - formData.phone.length} more digits needed</Form.Text>
                        )}
                    </div>
                )}

                {/* Step 2 (new user only): Create User */}
                {userFound === false && currentStep === 2 && (
                    <div className="animate__animated animate__fadeIn">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <AlertCircle size={18} className="text-warning" />
                            <span className="fw-medium">New user</span>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted mb-1">Full Name <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter recipient's name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                size="sm"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small text-muted mb-1">Email <span className="text-muted">(Optional)</span></Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                size="sm"
                            />
                        </Form.Group>
                        <CustomBtn
                            variant="primary"
                            buttonText="Continue"
                            icon={<ArrowRight size={18} />}
                            HandleClick={() => setCreateUserStepCompleted(true)}
                            disabled={!formData.name.trim()}
                            className="w-100"
                        />
                    </div>
                )}

                {/* Verify step */}
                {((userFound === true && currentStep === 2) || (userFound === false && currentStep === 3)) && (
                    <div className="animate__animated animate__fadeIn">
                        {!otpSent ? (
                            <>
                                <UserInfoCard
                                    user={targetUser || { name: formData.name }}
                                    phoneNumber={formData.phone}
                                    isNew={userFound === false}
                                    variant={userFound === true ? 'success' : 'info'}
                                />
                                <CustomBtn
                                    variant="primary"
                                    buttonText={isSendingOtp ? 'Processing...' : (eventData.otpRequired ? 'Send Verification OTP' : 'Verify & Continue')}
                                    icon={isSendingOtp ? null : <Send size={18} />}
                                    HandleClick={handleSendOtp}
                                    disabled={isSendingOtp}
                                    className="w-100"
                                />
                            </>
                        ) : (
                            <>
                                <UserInfoCard
                                    user={targetUser || { name: formData.name }}
                                    phoneNumber={formData.phone}
                                    isNew={userFound === false}
                                    variant="info"
                                />
                                <div
                                    className="rounded-3 p-3 mb-3 text-center"
                                    style={{ background: 'var(--bs-info-bg-subtle)', border: '1px solid var(--bs-info-border-subtle)' }}
                                >
                                    <KeyRound size={24} className="text-info mb-2" />
                                    <p className="mb-3 small">Enter the 6-digit OTP sent to <strong>{formData.phone}</strong></p>
                                    <Form.Control
                                        ref={otpInputRef}
                                        type="text"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        className="text-center mb-3"
                                        style={{ fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 600 }}
                                    />
                                    <CustomBtn
                                        variant="primary"
                                        buttonText={isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                                        icon={isVerifyingOtp ? null : <CheckCircle size={18} />}
                                        HandleClick={handleVerifyOtp}
                                        disabled={isVerifyingOtp || otp.length !== 6}
                                        className="w-100"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Transfer step */}
                {currentStep === steps.length && steps.length > 1 && (
                    <div className="animate__animated animate__fadeIn">
                        <Form.Label className="small text-muted mb-2 d-flex align-items-center justify-content-between">
                            <span></span>
                            {maxQuantity > 1 &&
                                <span>
                                    <Badge bg="info">{quantity} of {maxQuantity}</Badge>
                                    tickets
                                </span>}
                        </Form.Label>
                        {maxQuantity > 1 ? (
                            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    style={{ width: 50, height: 50 }}
                                >−</Button>
                                <input
                                    type="number"
                                    min={1}
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuantity))}
                                    className="text-center"
                                    style={{ fontSize: '1rem', fontWeight: 600 }}
                                />
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                                    disabled={quantity >= maxQuantity}
                                    style={{ width: 50, height: 50 }}
                                >+</Button>
                            </div>
                        ) : (
                            <div className="p-3 rounded-2 text-center mb-3"><span className="fw-semibold">1 Ticket transfer</span></div>
                        )}
                        <CustomBtn
                            variant="primary"
                            buttonText={isTransferring ? 'Transferring...' : `Transfer ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
                            icon={isTransferring ? null : <ArrowRight size={18} />}
                            HandleClick={handleTransfer}
                            disabled={isTransferring}
                            className="w-100"
                        />
                    </div>
                )}

                {userFound !== null && (
                    <Button
                        variant="link"
                        size="sm"
                        onClick={resetForm}
                        className="w-100 mt-3 text-muted d-flex align-items-center justify-content-center gap-2"
                    >
                        <RotateCcw size={14} />
                        Start Over
                    </Button>
                )}
            </div>
        </CustomDrawer>
    );
};

export default TokenTransferDrawer;
