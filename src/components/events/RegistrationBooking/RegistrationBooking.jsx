import React, { useState, useEffect, useCallback } from "react";
import { Form, Spinner, Row, Col } from "react-bootstrap";
import { api } from "@/lib/axiosInterceptor";
import { User, Mail, Phone } from "lucide-react";

/**
 * RegistrationBooking Component
 * Shows phone number field first, then auto-fetches user data
 * If user exists: shows name and email pre-filled
 * If user doesn't exist: shows empty name and email fields
 */
const RegistrationBooking = ({ onDataChange, initialData = {} }) => {
    const [number, setNumber] = useState(initialData?.number || "");
    const [name, setName] = useState(initialData?.name || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [photo, setPhoto] = useState(null);

    const [checkingUser, setCheckingUser] = useState(false);
    const [isExist, setIsExist] = useState(null);
    const [showFields, setShowFields] = useState(false);

    const isValidPhone = number.length === 10 || number.length === 12;

    const handleCheckUser = useCallback(async (phoneNumber) => {
        if (!phoneNumber || (phoneNumber.length !== 10 && phoneNumber.length !== 12)) {
            return;
        }

        setCheckingUser(true);
        try {
            const url = `user-from-number/${phoneNumber}`;
            const response = await api.get(url);

            if (response.data?.status) {
                setIsExist(true);
                setName(response.data.user?.name || "");
                setEmail(response.data.user?.email || "");
                setPhoto(response.data.user?.photo || null);
            } else {
                setIsExist(false);
                setName("");
                setEmail("");
                setPhoto(null);
            }
            setShowFields(true);
        } catch (error) {
            console.error("Error fetching user:", error);
            setIsExist(false);
            setName("");
            setEmail("");
            setShowFields(true);
        } finally {
            setCheckingUser(false);
        }
    }, []);

    useEffect(() => {
        if (isValidPhone && !showFields) {
            handleCheckUser(number);
        }
    }, [number, isValidPhone, showFields, handleCheckUser]);

    useEffect(() => {
        if (onDataChange) {
            onDataChange({ number, name, email, isExist, photo });
        }
    }, [number, name, email, isExist, photo, onDataChange]);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 12) {
            setNumber(value);
            if (value.length < 10) {
                setShowFields(false);
                setIsExist(null);
                setName("");
                setEmail("");
            }
        }
    };

    return (
        <div className="registration-booking">
            <Row className="g-3">
                {/* Phone Number Field */}
                <Col xs={12} md={showFields ? 4 : 12}>
                    <Form.Group>
                        <Form.Label className="text-white d-flex align-items-center gap-2 small">
                            <Phone size={14} /> Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <div className="position-relative">
                            <Form.Control
                                type="tel"
                                placeholder="Enter phone number"
                                value={number}
                                onChange={handlePhoneChange}
                                className="bg-dark text-white border-secondary"
                                maxLength={12}
                                required
                            />
                            {checkingUser && (
                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                    <Spinner animation="border" size="sm" variant="primary" />
                                </div>
                            )}
                        </div>
                        {!showFields && (
                            <Form.Text className="text-muted small">
                                Enter 10 or 12 digit number
                            </Form.Text>
                        )}
                    </Form.Group>
                </Col>

                {/* Name Field */}
                {showFields && (
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label className="text-white d-flex align-items-center gap-2 small">
                                <User size={14} /> Name <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-dark text-white border-secondary"
                                readOnly={isExist}
                                required
                            />
                            {isExist && (
                                <Form.Text className="text-success small">
                                    <i className="fa-solid fa-check me-1"></i> Auto-filled
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                )}

                {/* Email Field */}
                {showFields && (
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label className="text-white d-flex align-items-center gap-2 small">
                                <Mail size={14} /> Email <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-dark text-white border-secondary"
                                readOnly={isExist}
                                required
                            />
                            {isExist && (
                                <Form.Text className="text-success small">
                                    <i className="fa-solid fa-check me-1"></i> Auto-filled
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                )}
            </Row>

            {/* New user message */}
            {/* {showFields && !isExist && (
                <div className="alert alert-info bg-info bg-opacity-10 border-info text-info py-2 small mt-3 mb-0">
                    <i className="fa-solid fa-info-circle me-2"></i>
                    Please fill in your details to complete registration
                </div>
            )} */}
        </div>
    );
};

export default RegistrationBooking;
