// components/events/Profile/UserProfileModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { X, Save, LoaderCircle, ArrowLeft, Target } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";
import { CustomHeader } from "../../../utils/ModalUtils/CustomModalHeader";
import { api } from "@/lib/axiosInterceptor";
import toast from "react-hot-toast";
import { useMyContext } from "@/Context/MyContextProvider";
import { getErrorMessage } from "@/utils/errorUtils";
import OtpInput from "@/components/common/OtpInput";
import { validateProfileData } from "@/utils/validations";
import { EmailInputField, NameInputField, AddressInputField } from "../../CustomComponents/FormsFields"

const MODAL_VIEWS = {
  EDIT_FORM: "edit_form",
  OTP_VERIFICATION: "otp_verification",
};

const UserProfileModal = ({
  isEditing,
  formValues,
  setFormValues,
  originalValues,
  handleChange,
  handleCloseEdit,
  handleEditSubmit,
  updateMutation,
}) => {
  // Check if form values have changed from original
  const hasChanges =
    formValues.name?.trim() !== originalValues?.name?.trim() ||
    formValues.email?.trim() !== originalValues?.email?.trim() ||
    formValues.address?.trim() !== (originalValues?.address?.trim() ?? "");

  // If only address changed (no name/email change), skip OTP
  const onlyAddressChanged =
    formValues.name?.trim() === originalValues?.name?.trim() &&
    formValues.email?.trim() === originalValues?.email?.trim() &&
    formValues.address?.trim() !== (originalValues?.address?.trim() ?? "");
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

  console.log(formValues, "formValues");


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

  // validate otp
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
        toast.error(getErrorMessage({ response: { data: response.data } }, "Failed to send OTP"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send OTP"));
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
        setErrors((prev) => ({ ...prev, otp: getErrorMessage({ response: { data: response.data } }, "Invalid OTP") }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: getErrorMessage(error, "OTP verification failed"),
      }));
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle form submission - send OTP first (skip OTP if only address changed)
  const onSubmit = (e) => {
    // prevent default
    e.preventDefault();
    // if mutation is pending or otp is loading
    if (updateMutation?.isPending || otpLoading) return;

    // validate form data
    const validation = validateProfileData(formValues);
    // set errors
    setErrors(validation.errors);
    // if form is not valid
    if (!validation.isValid) return;

    // if only address changed
    if (onlyAddressChanged) {
      handleEditSubmit(e);
    } else {
      sendOtp();
    }
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
      {/* Edit Modal */}
      {currentView === MODAL_VIEWS.EDIT_FORM ? (
        <Form onSubmit={onSubmit} noValidate>
          <CustomHeader title="Edit Profile" closable onClose={onClose} />
          <Modal.Body className="p-3">
            {/* Name Input Field (Full name) */}
            <div className="mb-2">
              <NameInputField
                name="name"
                value={formValues.name}
                setValue={(val) => {
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                  setFormValues((prev) => ({ ...prev, name: val }))
                }}
                externalError={errors.name}
              />
            </div>

            <div className="mb-2">
              {/* Email Input Field */}
              <EmailInputField
                name="email"
                value={formValues.email}
                setValue={(val) => {
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  setFormValues((prev) => ({ ...prev, email: val }))
                }}
                externalError={errors.email}
              />
            </div>

            {/* Address Input Field */}
            <div className="mb-3">
              <AddressInputField
                name="address"
                value={formValues.address}
                setValue={(val) => {
                  if (errors.address) setErrors(prev => ({ ...prev, address: "" }));
                  setFormValues((prev) => ({ ...prev, address: val }))
                }}
                externalError={errors.address}
              />
            </div>

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
              size="sm"
            />

            <CustomBtn
              type="submit"
              variant="primary"
              className="btn-sm"
              disabled={otpLoading || !hasChanges}
              size="sm"
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
              <OtpInput
                value={otp}
                onChange={(value) => {
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
