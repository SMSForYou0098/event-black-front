// components/events/Profile/UserProfileModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { X, Save, LoaderCircle, ArrowLeft } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";
import { CustomHeader } from "../../../utils/ModalUtils/CustomModalHeader";
import { api } from "@/lib/axiosInterceptor";
import toast from "react-hot-toast";
import { useMyContext } from "@/Context/MyContextProvider";

const MODAL_VIEWS = {
  EDIT_FORM: "edit_form",
  OTP_VERIFICATION: "otp_verification",
};

const UserProfileModal = ({
  isEditing,
  formValues,
  originalValues,
  handleChange,
  handleCloseEdit,
  handleEditSubmit,
  updateMutation,
}) => {
  // Check if form values have changed from original
  const hasChanges =
    formValues.name?.trim() !== originalValues?.name?.trim() ||
    formValues.email?.trim() !== originalValues?.email?.trim();
  const [currentView, setCurrentView] = useState(MODAL_VIEWS.EDIT_FORM);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const { UserData } = useMyContext();

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isEditing) {
      setCurrentView(MODAL_VIEWS.EDIT_FORM);
      setOtp("");
      setOtpSent(false);
      setCountdown(0);
      setErrors({ name: "", email: "", phone: "", otp: "" });
    }
  }, [isEditing]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validate = () => {
    const next = { name: "", email: "", phone: "", otp: "" };
    let ok = true;

    if (!formValues.name?.trim()) {
      next.name = "Name is required";
      ok = false;
    }

    if (!formValues.email?.trim()) {
      next.email = "Email is required";
      ok = false;
    } else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(formValues.email)) {
        next.email = "Enter a valid email";
        ok = false;
      }
    }

    setErrors(next);
    return ok;
  };

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: "Please enter a valid 6-digit OTP" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, otp: "" }));
    return true;
  };

  // API call to send OTP
  const sendOtp = async () => {
    setOtpLoading(true);
    try {
      const response = await api.post('/user/otp', {
        number: UserData?.number,
        // email: formValues?.email,
      });

      if (response.data.status) {
        toast.success(response.data.message || "OTP sent to your email");
        setCurrentView(MODAL_VIEWS.OTP_VERIFICATION);
        setOtpSent(true);
        setCountdown(30);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // API call to verify OTP
  const verifyOtp = async () => {
    if (!validateOtp()) return;

    setVerifyLoading(true);
    try {
      const response = await api.post('user/otp/verify', {
        number: UserData?.number,
        // email: formValues?.email,
        otp: otp,
      });

      if (response.data.status) {
        toast.success(response.data.message || "OTP verified successfully");
        // Pass the session_id to handleEditSubmit for the update payload
        const sessionId = response.data.session_id;
        handleEditSubmit({ preventDefault: () => { } }, sessionId);
      } else {
        setErrors((prev) => ({ ...prev, otp: response.data.message || "Invalid OTP" }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: error?.response?.data?.message || "OTP verification failed",
      }));
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle form submission - send OTP first
  const onSubmit = (e) => {
    e.preventDefault();
    if (updateMutation?.isPending || otpLoading) return;
    if (!validate()) return;
    sendOtp();
  };

  // Handle OTP verification submission
  const onVerifySubmit = (e) => {
    e.preventDefault();
    if (verifyLoading || updateMutation?.isPending) return;
    verifyOtp();
  };

  // Handle back button
  const handleBack = () => {
    setCurrentView(MODAL_VIEWS.EDIT_FORM);
    setOtp("");
    setErrors((prev) => ({ ...prev, otp: "" }));
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    if (countdown > 0) return;
    sendOtp();
  };

  // Handle modal close
  const onClose = () => {
    setCurrentView(MODAL_VIEWS.EDIT_FORM);
    setOtp("");
    handleCloseEdit();
  };

  return (
    <Modal show={isEditing} onHide={onClose} centered>
      {currentView === MODAL_VIEWS.EDIT_FORM ? (
        <Form onSubmit={onSubmit} noValidate>
          <CustomHeader title="Edit Profile" closable onClose={onClose} />
          <Modal.Body className="p-3">
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formValues.name}
                onChange={(e) => {
                  if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  handleChange(e);
                }}
                className="card-glassmorphism__input"
                placeholder="Enter name"
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                className="card-glassmorphism__input"
                type="email"
                value={formValues.email}
                onChange={(e) => {
                  if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  handleChange(e);
                }}
                placeholder="Enter email"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-muted text-center small">
              To change your photo, click the camera icon below the profile picture.
            </div>
          </Modal.Body>
          <Modal.Footer>
            <CustomBtn
              type="button"
              className="btn-sm"
              variant="secondary"
              disabled={otpLoading}
              icon={<X size={20} />}
              buttonText="Cancel"
              HandleClick={onClose}
            />

            <CustomBtn
              type="submit"
              variant="primary"
              className="btn-sm"
              disabled={otpLoading || !hasChanges}
              icon={
                otpLoading ? (
                  <LoaderCircle className="spin" size={20} />
                ) : (
                  <Save size={20} />
                )
              }
              buttonText={otpLoading ? "Sending OTP..." : "Continue"}
            />
          </Modal.Footer>
        </Form>
      ) : (
        <Form onSubmit={onVerifySubmit} noValidate>
          <CustomHeader title="Verify OTP" closable onClose={onClose} />
          <Modal.Body className="p-3">
            <p className="text-center text-muted mb-4">
              We've sent a 6-digit OTP to your email <strong>{formValues.email}</strong>.
              Please enter it below to verify your identity.
            </p>

            <Form.Group className="mb-3" controlId="formOtp">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                  if (errors.otp) setErrors((p) => ({ ...p, otp: "" }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && otp.length === 6) {
                    onVerifySubmit(e);
                  }
                }}
                className="card-glassmorphism__input text-center"
                placeholder="Enter 6-digit OTP"
                isInvalid={!!errors.otp}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">
                {errors.otp}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-muted mb-0">
                  Resend OTP in <strong>{countdown}s</strong>
                </p>
              ) : (
                <CustomBtn
                  type="button"
                  variant="link"
                  className="p-0"
                  HandleClick={handleResendOtp}
                  disabled={otpLoading}
                  icon={otpLoading ? <LoaderCircle className="spin" size={14} /> : null}
                  buttonText={otpLoading ? "Sending..." : "Resend OTP"}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <CustomBtn
              type="button"
              className="btn-sm"
              variant="secondary"
              disabled={verifyLoading || updateMutation?.isPending}
              icon={<ArrowLeft size={20} />}
              buttonText="Back"
              HandleClick={handleBack}
            />

            <CustomBtn
              type="submit"
              variant="primary"
              className="btn-sm"
              disabled={verifyLoading || updateMutation?.isPending || otp.length !== 6}
              icon={
                verifyLoading || updateMutation?.isPending ? (
                  <LoaderCircle className="spin" size={20} />
                ) : (
                  <Save size={20} />
                )
              }
              buttonText={
                verifyLoading
                  ? "Verifying..."
                  : updateMutation?.isPending
                    ? "Saving..."
                    : "Verify & Save"
              }
            />
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
};

export default UserProfileModal;
