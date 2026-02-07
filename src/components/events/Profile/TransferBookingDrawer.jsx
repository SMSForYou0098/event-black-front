import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { Search, User, Mail, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import CustomDrawer from '@/utils/CustomDrawer';
import CustomBtn from '@/utils/CustomBtn';
import { getUserByPhone, createTransferUser, transferBooking } from '@/services/transferService';
import { useMyContext } from '@/Context/MyContextProvider';

const TransferBookingDrawer = ({
    show,
    onHide,
    booking,
    onTransferSuccess
}) => {
    const { UserData } = useMyContext();

    // States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [userFound, setUserFound] = useState(null); // null = not searched, true/false = result
    const [targetUser, setTargetUser] = useState(null);

    // New user form states
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');

    // Transfer states
    const [quantity, setQuantity] = useState(1);
    const [isTransferring, setIsTransferring] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Get max quantity from booking
    const maxQuantity = booking?.bookings?.length || 1;

    // Ref for phone input to handle mobile keyboard
    const phoneInputRef = useRef(null);

    // Handle phone input focus - scroll into view for mobile
    const handlePhoneFocus = useCallback(() => {
        // Delay to wait for keyboard to appear
        setTimeout(() => {
            phoneInputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 300);
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setPhoneNumber('');
        setUserFound(null);
        setTargetUser(null);
        setNewUserName('');
        setNewUserEmail('');
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
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsSearching(true);
        setError('');
        setUserFound(null);
        setTargetUser(null);

        try {
            const response = await getUserByPhone(phoneNumber);

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
    }, [phoneNumber]);

    // Auto-search when phone number reaches 10 digits
    useEffect(() => {
        if (phoneNumber.length === 10 && userFound === null && !isSearching) {
            handleSearchUser();
        }
    }, [phoneNumber, userFound, isSearching, handleSearchUser]);

    // Handle transfer
    const handleTransfer = useCallback(async () => {
        setIsTransferring(true);
        setError('');
        setSuccess('');

        try {
            let transferToUser = targetUser;
            let hashKey = targetUser?.hash_key;

            // If user not found, create new user first
            if (!userFound) {
                if (!newUserName.trim()) {
                    setError('Please enter the name');
                    setIsTransferring(false);
                    return;
                }

                const createResponse = await createTransferUser({
                    name: newUserName,
                    phone: phoneNumber,
                    email: newUserEmail || undefined
                });

                if (!createResponse.status || !createResponse.user) {
                    setError(createResponse.message || 'Failed to create user');
                    setIsTransferring(false);
                    return;
                }

                transferToUser = createResponse.user;
                hashKey = createResponse.user.hash_key;
            }

            // Now transfer the booking
            const transferPayload = {
                is_master: booking?.is_master || false,
                booking_id: booking?.id,
                transfer_from: UserData?.id,
                transfer_to: transferToUser?.id,
                hash_key: hashKey,
                quantity: quantity
            };

            const transferResponse = await transferBooking(transferPayload);

            if (transferResponse.status) {
                setSuccess('Booking transferred successfully!');
                setTimeout(() => {
                    handleClose();
                    onTransferSuccess?.();
                }, 1500);
            } else {
                setError(transferResponse.message || 'Failed to transfer booking');
            }
        } catch (err) {
            setError('An error occurred during transfer');
        } finally {
            setIsTransferring(false);
        }
    }, [userFound, targetUser, newUserName, newUserEmail, phoneNumber, booking, UserData, quantity, handleClose, onTransferSuccess]);

    return (
        <CustomDrawer
            title="Transfer Booking"
            showOffcanvas={show}
            setShowOffcanvas={handleClose}
            hideIndicator={true}
        >
            <div className="p-2">
                {/* Error/Success Messages */}
                {error && (
                    <Alert variant="danger" className="py-2 mb-3">
                        <AlertCircle size={16} className="me-2" />
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="py-2 mb-3">
                        <CheckCircle size={16} className="me-2" />
                        {success}
                    </Alert>
                )}

                {/* Phone Number Input */}
                <Form.Group className="mb-3">
                    <Form.Label className="small text-muted">
                        <Phone size={14} className="me-1" />
                        Enter Phone Number
                    </Form.Label>
                    <InputGroup>
                        <Form.Control
                            ref={phoneInputRef}
                            type="tel"
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            onFocus={handlePhoneFocus}
                            maxLength={10}
                            disabled={isSearching || userFound !== null}
                            style={{ fontSize: '1.1rem' }}
                        />
                        <Button
                            variant="primary"
                            onClick={handleSearchUser}
                            disabled={isSearching || phoneNumber.length < 10 || userFound !== null}
                        >
                            {isSearching ? (
                                <Spinner size="sm" animation="border" />
                            ) : (
                                <Search size={18} />
                            )}
                        </Button>
                    </InputGroup>
                </Form.Group>

                {/* User Found - Display Info */}
                {userFound === true && targetUser && (
                    <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bs-success-bg-subtle)' }}>
                        <small className="text-success d-block mb-2">
                            <CheckCircle size={14} className="me-1" />
                            User found!
                        </small>
                        <Form.Group className="mb-2">
                            <Form.Label className="small text-muted mb-1">
                                <User size={12} className="me-1" />
                                Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={targetUser.name || ''}
                                disabled
                                className="bg-transparent"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small text-muted mb-1">
                                <Mail size={12} className="me-1" />
                                Email
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={targetUser.email || ''}
                                disabled
                                className="bg-transparent"
                            />
                        </Form.Group>
                    </div>
                )}

                {/* User Not Found - Create New User Form */}
                {userFound === false && (
                    <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bs-warning-bg-subtle)' }}>
                        <small className="text-warning d-block mb-2">
                            <AlertCircle size={14} className="me-1" />
                            User not found. Enter details to create new user.
                        </small>
                        <Form.Group className="mb-2">
                            <Form.Label className="small text-muted mb-1">
                                <User size={12} className="me-1" />
                                Name *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="small text-muted mb-1">
                                <Mail size={12} className="me-1" />
                                Email (Optional)
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </Form.Group>
                    </div>
                )}

                {/* Quantity Input - Only show after user search */}
                {userFound !== null && (
                    <Form.Group className="mb-4">
                        <Form.Label className="small text-muted">
                            Ticket Quantity (Max: {maxQuantity})
                        </Form.Label>
                        <Form.Control
                            type="number"
                            min={1}
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuantity))}
                        />
                        <Form.Text className="text-muted">
                            Enter how many tickets you want to transfer
                        </Form.Text>
                    </Form.Group>
                )}

                {/* Reset Button - Show if search was done */}
                {userFound !== null && (
                    <div className="d-flex gap-2 mb-3">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={resetForm}
                            className="flex-grow-1"
                        >
                            Search Different Number
                        </Button>
                    </div>
                )}

                {/* Transfer Button */}
                {userFound !== null && (
                    <CustomBtn
                        variant="primary"
                        buttonText={isTransferring ? 'Transferring...' : 'Transfer Booking'}
                        icon={<ArrowRight size={18} />}
                        HandleClick={handleTransfer}
                        disabled={isTransferring || (userFound === false && !newUserName.trim())}
                        className="w-100"
                    />
                )}
            </div>
        </CustomDrawer>
    );
};

export default TransferBookingDrawer;
