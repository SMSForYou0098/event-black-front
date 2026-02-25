import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Ticket, ChevronUp, CheckCircle, AlertCircle } from "lucide-react";
import CustomDrawer from "../../../utils/CustomDrawer";
import CustomBtn from "../../../utils/CustomBtn";

const TermsAccordion = ({
    onlineTerms,
    offlineTerms,
    bookingNotice,
    show: externalShow,
    onClose,
    onAgree,
    showTrigger = true,
    loading = false
}) => {
    const [internalShow, setInternalShow] = useState(false);
    // 'notice' | 'terms'
    const [step, setStep] = useState('notice');

    // Use external control if provided, otherwise use internal state
    const isControlled = externalShow !== undefined;
    const show = isControlled ? externalShow : internalShow;

    const hasTerms = onlineTerms || offlineTerms;
    const hasNotice = !!bookingNotice?.trim();

    // Reset step when drawer opens
    useEffect(() => {
        if (show) {
            setStep(hasNotice ? 'notice' : 'terms');
        }
    }, [show, hasNotice]);

    // If no terms AND no notice, render nothing
    if (!hasTerms && !hasNotice) return null;

    const handleShow = () => isControlled ? null : setInternalShow(true);

    const handleClose = () => {
        if (isControlled && onClose) {
            onClose();
        } else {
            setInternalShow(false);
        }
    };

    const handleAgree = () => {
        if (onAgree) {
            onAgree();
        }
    };

    // Continue from notice → terms or directly process
    const handleContinueFromNotice = () => {
        if (hasTerms) {
            setStep('terms');
        } else {
            // No terms, proceed directly
            handleAgree();
        }
    };

    // Dynamic title based on current step
    const drawerTitle = step === 'notice' ? (
        <div className="d-flex align-items-center gap-2">
            <AlertCircle size={24} className="text-warning" />
            <span>Booking Note</span>
        </div>
    ) : (
        <div className="d-flex align-items-center gap-2">
            <Ticket size={24} className="text-primary" />
            <span>Terms and Conditions</span>
        </div>
    );

    return (
        <>
            {/* Trigger Button - only show when not controlled externally or showTrigger is true */}
            {(!isControlled && showTrigger) && (
                <div className="terms-trigger mb-4">
                    <Button
                        variant="outline-primary"
                        className="rounded-3 w-100 d-flex align-items-center justify-content-between py-3"
                        onClick={handleShow}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <Ticket size={20} />
                            <span className="fw-medium">Terms and Conditions</span>
                        </div>
                        <ChevronUp size={20} />
                    </Button>
                </div>
            )}

            {/* Single Drawer */}
            <CustomDrawer
                hideIndicator={true}
                title={drawerTitle}
                showOffcanvas={show}
                setShowOffcanvas={handleClose}
                showButton={true}
            >
                {/* Step 1: Booking Notice */}
                {step === 'notice' && hasNotice && (
                    <>
                        <div className="bg-dark text-white pb-5 mb-5 px-3">
                            <div
                                className="description-content"
                                style={{ whiteSpace: "pre-wrap" }}
                                dangerouslySetInnerHTML={{
                                    __html: bookingNotice.trim(),
                                }}
                            />
                        </div>

                        <div
                            className="position-fixed bottom-0 start-0 end-0 p-3 bg-dark border-top border-secondary-subtle"
                            style={{ zIndex: 1060 }}
                        >
                            <div className="">
                                <CustomBtn
                                    wrapperClassName="w-100"
                                    buttonText="Continue"
                                    HandleClick={handleContinueFromNotice}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2: Terms and Conditions */}
                {step === 'terms' && hasTerms && (
                    <>
                        <div style={{ paddingBottom: onAgree ? "80px" : "0" }}>
                            {onlineTerms && (
                                <div className={offlineTerms ? "mb-4" : ""}>
                                    <h6 className="fw-bold mb-3 text-primary">Online Ticket Terms</h6>
                                    <div
                                        className="description-content"
                                        style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
                                        dangerouslySetInnerHTML={{ __html: onlineTerms }}
                                    />
                                </div>
                            )}
                            {offlineTerms && (
                                <div>
                                    <h6 className="fw-bold mb-3 text-primary">Offline Ticket Terms</h6>
                                    <div
                                        className="description-content"
                                        style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
                                        dangerouslySetInnerHTML={{ __html: offlineTerms }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Agree Section */}
                        {onAgree && (
                            <div
                                className="terms-agree-section position-fixed bottom-0 start-0 end-0 p-3 bg-dark border-top"
                                style={{ zIndex: 1060 }}
                            >
                                <CustomBtn
                                    disabled={false}
                                    HandleClick={handleAgree}
                                    icon={<CheckCircle size={20} />}
                                    buttonText="I Agree & Continue"
                                    className="w-100"
                                    loading={loading}
                                />
                            </div>
                        )}
                    </>
                )}
            </CustomDrawer>
        </>
    );
};

export default TermsAccordion;
