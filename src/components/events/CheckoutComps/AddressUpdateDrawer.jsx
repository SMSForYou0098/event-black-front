import React, { useState, useEffect, useRef } from 'react';
import CustomDrawer from '../../../utils/CustomDrawer';
import { Form, Spinner, Modal } from 'react-bootstrap';
import CustomHeader from '../../../utils/ModalUtils/CustomModalHeader';
import CustomBtn from '../../../utils/CustomBtn';
import { getErrorMessage } from '../../../utils/errorUtils';
import { getTextareaError } from '../../../utils/validations';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';

import { useDispatch } from 'react-redux';
import { updateUserAddress } from '@/store/auth/authSlice';

import { PenLine } from 'lucide-react';

import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/router';

const AddressUpdateDrawer = ({ open, onClose, userData, onSuccess }) => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [addressError, setAddressError] = useState(null);
    const { successAlert, ErrorAlert } = useMyContext();
    const dispatch = useDispatch();
    const router = useRouter();
    const isMobile = useMediaQuery({ maxWidth: 575 });
    const textareaRef = useRef(null);

    // Auto-focus when editing starts
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();

            // Push cursor to the end of the text
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    // Set address and editing state
    useEffect(() => {
        if (userData?.address) {
            setAddress(userData.address);
            setIsEditing(false);
        } else {
            setIsEditing(true); // Force edit if no address
        }
    }, [userData]);


    // Handle action
    const handleAction = async () => {
        // If not editing, just proceed by confirming current address
        if (!isEditing) {
            onSuccess?.(address);
            onClose();
            return;
        }

        // If editing, validate and update
        if (!userData?.id) return;

        // Validate address
        const validationError = getTextareaError(address, true, "Address");
        if (validationError) {
            setAddressError(validationError);
            return;
        }

        // Update address
        setLoading(true);
        try {
            const res = await api.post(`/update-user-address/${userData.id}`, { address });
            if (res.data.status) {
                successAlert(res.data.message || "Address updated successfully");
                dispatch(updateUserAddress(address)); // Update Redux state
                onSuccess?.(address);
                onClose();
            } else {
                ErrorAlert(getErrorMessage(res.data, "Failed to update address"));
            }
        } catch (error) {
            ErrorAlert(getErrorMessage(error, "Something went wrong"));
        } finally {
            setLoading(false);
        }
    };


    // Render form content
    const renderFormContent = () => (
        <div>
            <Form.Group className="mb-4">
                <Form.Control
                    as="textarea"
                    ref={textareaRef}
                    rows={4}
                    value={address}
                    onChange={(e) => {
                        let val = e.target.value
                            .replace(/,/g, '|')
                            .replace(/ {2,}/g, ' ') // Reduce multiple spaces to a single space
                            .replace(/^\s+/, '');   // Remove completely leading spaces

                        // Only auto-pad slashes if user is NOT actively deleting
                        if (!e.nativeEvent.inputType?.startsWith('delete')) {
                            val = val.replace(/\s*\|\s*/g, ' | ');
                        }

                        setAddress(val);
                        setAddressError(getTextareaError(val, true, "Address"));
                    }}
                    onBlur={() => {
                        if (isEditing) {
                            setAddressError(getTextareaError(address, true, "Address"));
                        }
                    }}
                    placeholder="Enter your full address here..."
                    className={`card-glassmorphism__input ${!isEditing ? 'opacity-75 bg-transparent' : ''} ${addressError ? 'is-invalid border-danger' : ''}`}
                    disabled={!isEditing}
                />
                {addressError && (
                    <Form.Control.Feedback type="invalid" className="d-block text-start">
                        {addressError}
                    </Form.Control.Feedback>
                )}
                {isEditing && (
                    <div className="text-light opacity-75 mt-2 text-start">
                        <span style={{ fontSize: '13px' }}>' , ' will be automatically converted to ' | '.</span>
                    </div>
                )}
            </Form.Group>

            <div className="d-flex gap-3">
                <div style={{ flex: 1 }}>
                    <CustomBtn
                        HandleClick={() => router.back()}
                        buttonText="Back"
                        icon={<i className="fa-solid fa-arrow-left"></i>}
                        variant="secondary"
                        className="w-100 border-0"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <CustomBtn
                        HandleClick={handleAction}
                        buttonText={isEditing ? (loading ? "Updating..." : "Update & Proceed") : "Confirm & Proceed"}
                        disabled={loading || !!addressError}
                        className="w-100 custom-primary-bg border-0"
                    />
                </div>
            </div>
        </div>
    );

    // Mobile view
    if (isMobile) {
        return (
            <CustomDrawer
                title={
                    <div className="w-100 position-relative d-flex align-items-center justify-content-center">
                        <span>Confirm Address</span>
                        {!isEditing && (
                            <div className="position-absolute end-0 pe-2">
                                <CustomBtn
                                    buttonText=""
                                    icon={<PenLine size={12} />}
                                    HandleClick={() => setIsEditing(true)}
                                    size="sm"
                                    className="p-2"
                                />
                            </div>
                        )}
                    </div>
                }
                showOffcanvas={open}
                setShowOffcanvas={onClose}
                placement="bottom"
                style={{ height: 'auto', minHeight: '40vh' }}
                backdrop="static"
                keyboard={false}
                allowDragClose={false}
            >
                {renderFormContent()}
            </CustomDrawer>
        );
    }

    return (
        <Modal
            show={open}
            // onHide={onClose}
            centered
            className="modal-glass-bg"
            contentClassName="border-0 shadow-lg"
        >
            <CustomHeader
                title={<span className="fw-bold fs-5">Confirm Address</span>}
                closable={false}
                onClose={onClose}
                className="border-0 pb-0 d-flex justify-content-between align-items-center text-white"
                extra={
                    !isEditing && (
                        <CustomBtn
                            buttonText=""
                            icon={<PenLine size={16} />}
                            HandleClick={() => setIsEditing(true)}
                            size="sm"
                            className="p-1 p-sm-2"
                        />
                    )
                }
            />
            <Modal.Body className="p-4 pt-3">
                {renderFormContent()}
            </Modal.Body>
        </Modal>
    );
};

export default AddressUpdateDrawer;
