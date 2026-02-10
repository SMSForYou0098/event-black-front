import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Form, Button, Spinner, Alert, InputGroup, Badge } from 'react-bootstrap';
import { Search, User, Mail, Phone, ArrowRight, CheckCircle, AlertCircle, KeyRound, RotateCcw, Ticket, Send } from 'lucide-react';
import CustomDrawer from '@/utils/CustomDrawer';
import CustomBtn from '@/utils/CustomBtn';
import { getUserByPhone, createTransferUser, transferBooking, verifyTransferOtp } from '@/services/transferService';
import { useMyContext } from '@/Context/MyContextProvider';

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps = 3 }) => {
    const steps = [
        { num: 1, label: 'Find User' },
        { num: 2, label: 'Verify' },
        { num: 3, label: 'Transfer' }
    ];

    return (
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
            {steps.map((step, index) => (
                <React.Fragment key={step.num}>
                    <div className="d-flex flex-column align-items-center">
                        <div
                            className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${currentStep >= step.num
                                ? 'bg-primary text-white'
                                : 'bg-secondary bg-opacity-25 text-muted'
                                }`}
                            style={{
                                width: 32,
                                height: 32,
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {currentStep > step.num ? <CheckCircle size={16} /> : step.num}
                        </div>
                        <small className={`text-center ${currentStep >= step.num ? 'text-primary fw-medium' : 'text-muted'}`}
                            style={{ fontSize: '0.7rem' }}>
                            {step.label}
                        </small>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={`flex-grow-1 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`}
                            style={{ height: 2, marginTop: -12, transition: 'all 0.3s ease' }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// User Info Card Component
const UserInfoCard = ({ user, phoneNumber, isNew = false, variant = 'success' }) => (
    <div
        className="rounded-3 p-3 mb-3 gray-bg"

    >
        <div className="d-flex align-items-center gap-2 mb-2">
            <div
                className={`rounded-circle bg-${variant} bg-opacity-25 d-flex align-items-center justify-content-center`}
                style={{ width: 40, height: 40 }}
            >
                <User size={20} className={`text-${variant}`} />
            </div>
            <div className="flex-grow-1">
                <div className="fw-semibold">{user?.name || 'Unknown'}</div>
                <small className="text-muted">{phoneNumber}</small>
            </div>
            {isNew && (
                <Badge bg="warning" className="text-dark">New User</Badge>
            )}
        </div>
        {user?.email && (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <Mail size={14} />
                <span>{user.email}</span>
            </div>
        )}
    </div>
);

const TransferBookingDrawer = ({
    show,
    onHide,
    booking,
    onTransferSuccess
}) => {
    const { UserData, successAlert } = useMyContext();

    // Get event_id and OTP settings from booking
    const eventData = useMemo(() => {
        const normalizeBooking = booking?.bookings ? booking.bookings[0] : booking;
        return {
            eventId: normalizeBooking?.event?.id || normalizeBooking?.event_id,
            otpRequired: normalizeBooking?.event?.event_controls?.ticket_transfer_otp ?? true,
            eventName: normalizeBooking?.event?.name || 'Event'
        };
    }, [booking]);

    // Form data state (consolidated)
    const [formData, setFormData] = useState({ phone: '', name: '', email: '' });
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

    // Get max quantity from booking
    const maxQuantity = booking?.bookings?.length || 1;

    // Calculate current step
    const currentStep = useMemo(() => {
        if (otpVerified) return 3;
        if (otpSent || (userFound !== null && !eventData.otpRequired)) return 2;
        if (userFound !== null) return 2;
        return 1;
    }, [userFound, otpSent, otpVerified, eventData.otpRequired]);

    // Ref for phone input
    const phoneInputRef = useRef(null);
    const otpInputRef = useRef(null);

    // Focus OTP input when OTP sent
    useEffect(() => {
        if (otpSent && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [otpSent]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ phone: '', name: '', email: '' });
        setUserFound(null);
        setTargetUser(null);
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        setTransferHashKey(null);
        setQuantity(1);
        setError('');
        setSuccess('');
    }, []);

    // Handle drawer close
    const handleClose = useCallback(() => {
        resetForm();
        onHide();
    }, [resetForm, onHide]);

    // Search user by phone
    const handleSearchUser = useCallback(async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
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
    }, [formData.phone]);

    // Auto-search when phone number reaches 10 digits
    useEffect(() => {
        if (formData.phone.length === 10 && userFound === null && !isSearching) {
            handleSearchUser();
        }
    }, [formData.phone, userFound, isSearching, handleSearchUser]);

    // Send OTP
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
                setError(response.message || 'Failed to verify user');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSendingOtp(false);
        }
    }, [formData, eventData, userFound, targetUser]);

    // Handle OTP verification
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
                setError(verifyResponse.message || 'Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Failed to verify OTP');
        } finally {
            setIsVerifyingOtp(false);
        }
    }, [otp, formData.phone, eventData.eventId]);

    // Handle transfer
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
                is_master: booking?.bookings?.length > 1 ? true : false,
                booking_id: booking?.id,
                transfer_from: UserData?.id,
                transfer_to: targetUser?.id,
                hash_key: transferHashKey,
                quantity: quantity,
                event_id: eventData.eventId
            };

            const transferResponse = await transferBooking(transferPayload);

            if (transferResponse.status) {
                successAlert(transferResponse.message || 'Booking transferred successfully!');
                handleClose();
                onTransferSuccess?.();
            } else {
                setError(transferResponse.message || 'Failed to transfer booking');
            }
        } catch (err) {
            console.error('Transfer error:', err);
            setError('An error occurred during transfer');
        } finally {
            setIsTransferring(false);
        }
    }, [otpVerified, booking, UserData, targetUser, quantity, handleClose, transferHashKey, eventData.eventId, successAlert]);

    return (
        <CustomDrawer
            title="Transfer Booking"
            showOffcanvas={show}
            setShowOffcanvas={handleClose}
            hideIndicator={true}
        >
            <div className="p-3">
                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} />

                {/* Booking Info Header */}
                <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2" >
                    <Ticket size={18} className="text-primary" />
                    <div className="flex-grow-1">
                        <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Transferring</small>
                        <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{maxQuantity} ticket(s) • {eventData.eventName}</span>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <Alert variant="danger" className="py-2 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="py-2 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                        <CheckCircle size={16} />
                        {success}
                    </Alert>
                )}

                {/* Step 1: Phone Number Input */}
                <div className="mb-3">
                    <Form.Label className="small text-muted mb-2 d-flex align-items-center gap-1">
                        <Phone size={14} />
                        Recipient's Phone Number
                    </Form.Label>
                    <InputGroup size="lg" className='card-glassmorphism__input rounded-3'>
                        <InputGroup.Text className="card-glassmorphism__input-prefix">+91</InputGroup.Text>
                        <Form.Control
                            ref={phoneInputRef}
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            maxLength={10}
                            disabled={isSearching || userFound !== null}
                            className="gray-bg"
                            style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}
                        />
                        {/* <Button
                            variant={formData.phone.length === 10 && userFound === null ? 'primary' : 'outline-secondary'}
                            onClick={handleSearchUser}
                            disabled={isSearching || formData.phone.length < 10 || userFound !== null}
                            style={{ minWidth: 50 }}
                        >
                            {isSearching ? (
                                <Spinner size="sm" animation="border" />
                            ) : (
                                <Search size={20} />
                            )}
                        </Button> */}
                    </InputGroup>
                    {formData.phone.length > 0 && formData.phone.length < 10 && (
                        <Form.Text className="text-muted">
                            {10 - formData.phone.length} more digits needed
                        </Form.Text>
                    )}
                </div>

                {/* User Found Display */}
                {userFound === true && targetUser && !otpSent && !otpVerified && (
                    <div className="animate__animated animate__fadeIn">
                        <UserInfoCard user={targetUser} phoneNumber={formData.phone} variant="success" />
                        <CustomBtn
                            variant="primary"
                            buttonText={isSendingOtp ? 'Processing...' : (eventData.otpRequired ? 'Send Verification OTP' : 'Verify & Continue')}
                            icon={isSendingOtp ? null : <Send size={18} />}
                            HandleClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className="w-100 mb-2"
                        />
                    </div>
                )}

                {/* User Not Found - Create Form */}
                {userFound === false && !otpSent && !otpVerified && (
                    <div className="animate__animated animate__fadeIn">
                        <div
                            className="rounded-3 p-3 mb-3"
                            style={{
                                background: 'var(--bs-warning-bg-subtle)',
                                border: '1px solid var(--bs-warning-border-subtle)'
                            }}
                        >
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-warning" />
                                <span className="fw-medium">New user - Enter details</span>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted mb-1">
                                    Full Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter recipient's name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    size="lg"
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="small text-muted mb-1">
                                    Email <span className="text-muted">(Optional)</span>
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    size="lg"
                                />
                            </Form.Group>
                        </div>

                        <CustomBtn
                            variant="primary"
                            buttonText={isSendingOtp ? 'Processing...' : (eventData.otpRequired ? 'Send Verification OTP' : 'Verify & Continue')}
                            icon={isSendingOtp ? null : <Send size={18} />}
                            HandleClick={handleSendOtp}
                            disabled={isSendingOtp || !formData.name.trim()}
                            className="w-100 mb-2"
                        />
                    </div>
                )}

                {/* OTP Input */}
                {otpSent && !otpVerified && (
                    <div className="animate__animated animate__fadeIn">
                        <UserInfoCard
                            user={targetUser || { name: formData.name }}
                            phoneNumber={formData.phone}
                            isNew={userFound === false}
                            variant="info"
                        />

                        <div
                            className="rounded-3 p-3 mb-3 text-center"
                            style={{
                                background: 'var(--bs-info-bg-subtle)',
                                border: '1px solid var(--bs-info-border-subtle)'
                            }}
                        >
                            <KeyRound size={24} className="text-info mb-2" />
                            <p className="mb-3 small">
                                Enter the 6-digit OTP sent to <strong>{formData.phone}</strong>
                            </p>

                            <Form.Control
                                ref={otpInputRef}
                                type="text"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                className="text-center mb-3"
                                style={{
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5em',
                                    fontWeight: 600
                                }}
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
                    </div>
                )}

                {/* Transfer Ready */}
                {otpVerified && (
                    <div className="animate__animated animate__fadeIn">
                        <UserInfoCard
                            user={targetUser || { name: formData.name }}
                            phoneNumber={formData.phone}
                            isNew={userFound === false}
                            variant="success"
                        />

                        <div className="mb-4">
                            <Form.Label className="d-flex justify-content-between align-items-center mb-2">
                                <span className="small text-muted">Number of Tickets to Transfer</span>
                                <Badge bg="info">{quantity} of {maxQuantity}</Badge>
                            </Form.Label>

                            {maxQuantity > 1 ? (
                                <div className="d-flex align-items-center gap-3">
                                    <Button
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        style={{ width: 50, height: 50 }}
                                    >
                                        −
                                    </Button>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        max={maxQuantity}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuantity))}
                                        className="text-center"
                                        style={{ fontSize: '1.3rem', fontWeight: 600 }}
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                                        disabled={quantity >= maxQuantity}
                                        style={{ width: 50, height: 50 }}
                                    >
                                        +
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 rounded-2 text-center">
                                    <span className="fw-semibold">1 Ticket</span>
                                </div>
                            )}
                        </div>

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

                {/* Reset Button */}
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

export default TransferBookingDrawer;
