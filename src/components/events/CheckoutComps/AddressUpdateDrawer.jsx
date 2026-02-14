import React, { useState, useEffect } from 'react';
import CustomDrawer from '../../../utils/CustomDrawer';
import { Form, Spinner } from 'react-bootstrap';
import CustomBtn from '../../../utils/CustomBtn';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';

import { useDispatch } from 'react-redux';
import { updateUserAddress } from '@/store/auth/authSlice';

import { PenLine, PenLineIcon } from 'lucide-react';

const AddressUpdateDrawer = ({ open, onClose, userData, onSuccess }) => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { successAlert, ErrorAlert } = useMyContext();
    const dispatch = useDispatch();

    useEffect(() => {
        if (userData?.address) {
            setAddress(userData.address);
            setIsEditing(false);
        } else {
            setIsEditing(true); // Force edit if no address
        }
    }, [userData]);

    const handleAction = async () => {
        // If not editing, just proceed
        if (!isEditing) {
            onClose();
            return;
        }

        // If editing, validate and update
        if (!userData?.id) return;
        if (!address || address.trim() === "") {
            ErrorAlert("Address cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/update-user-address/${userData.id}`, { address });
            if (res.data.status) {
                successAlert(res.data.message || "Address updated successfully");
                dispatch(updateUserAddress(address)); // Update Redux state
                onSuccess(address);
                onClose();
            } else {
                ErrorAlert(res.data.message || "Failed to update address");
            }
        } catch (error) {
            // console.error("Address update failed", error);
            ErrorAlert(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomDrawer
            title="Confirm Address"
            showOffcanvas={open}
            setShowOffcanvas={onClose}
            placement="bottom"
            style={{ height: 'auto', minHeight: '40vh' }}
        >
            <div className="">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-light fw-bold">Address</label>
                    {!isEditing && (
                        <CustomBtn
                            buttonText=""
                            icon={<PenLineIcon size={16} />}
                            HandleClick={() => setIsEditing(true)}
                            className=""
                            size="sm"
                        />
                    )}
                </div>

                <Form.Group className="mb-4">
                    <Form.Control
                        as="textarea"
                        rows={4}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full address here..."
                        className={`card-glassmorphism__input ${!isEditing ? 'opacity-75' : ''}`}
                        disabled={!isEditing}
                    />
                </Form.Group>

                <div className="d-flex flex-column gap-3">
                    <CustomBtn
                        HandleClick={handleAction}
                        buttonText={isEditing ? (loading ? "Updating..." : "Update & Proceed") : "Confirm & Proceed"}
                        disabled={loading}
                        className="w-100 custom-primary-bg border-0"
                    />
                </div>
            </div>
        </CustomDrawer>
    );
};

export default AddressUpdateDrawer;
