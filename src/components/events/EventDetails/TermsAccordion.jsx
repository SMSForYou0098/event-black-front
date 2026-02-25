import React, { useState } from "react";
import { Offcanvas, Button, Form } from "react-bootstrap";
import { Ticket, ChevronUp, CheckCircle } from "lucide-react";
import CustomDrawer from "../../../utils/CustomDrawer";
import CustomBtn from "../../../utils/CustomBtn";

const TermsAccordion = ({
    onlineTerms,
    offlineTerms,
    show: externalShow,
    onClose,
    onAgree,
    showTrigger = true,
    loading = false
}) => {
    const [internalShow, setInternalShow] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // Use external control if provided, otherwise use internal state
    const isControlled = externalShow !== undefined;
    const show = isControlled ? externalShow : internalShow;
    const setShow = isControlled ? (val) => {
        if (!val && onClose) onClose();
    } : setInternalShow;

    const hasTerms = onlineTerms || offlineTerms;
    if (!hasTerms) return null;

    const handleShow = () => isControlled ? null : setInternalShow(true);
    const handleClose = () => {
        setAgreed(false);
        if (isControlled && onClose) {
            onClose();
        } else {
            setInternalShow(false);
        }
    };

    const handleAgree = () => {
        // Since checkbox is temporarily commented out, proceed directly
        if (onAgree) {
            onAgree();
            setAgreed(false);
        }
    };

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

            {/* Bottom Drawer */}
            <CustomDrawer title={
                <div className="d-flex align-items-center gap-2">
                    <Ticket size={24} className="text-primary" />
                    <span>Terms and Conditions</span>
                </div>
            } showOffcanvas={show} setShowOffcanvas={handleClose} showButton={true}>

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

                {/* Agree Section - only show when onAgree callback is provided */}
                {onAgree && (
                    <div
                        className="terms-agree-section position-fixed bottom-0 start-0 end-0 p-3 bg-dark border-top"
                        style={{ zIndex: 1060 }}
                    >
                        {/* Temporarily commented out checkbox
                        <Form.Check
                            type="checkbox"
                            id="terms-agree-checkbox"
                            label="I have read and agree to the Terms and Conditions"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mb-3 text-light"
                        />
                        */}
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
            </CustomDrawer>
            {/* <CustomDrawer
                showOffcanvas={show}
                setShowOffcanvas={setShow}
                placement="bottom"
                className="terms-drawer"
            >
                <div closeButton className="border-bottom">
                    <div className="d-flex align-items-center gap-2">
                        <Ticket size={24} className="text-primary" />
                        <span>Terms and Conditions</span>
                    </div>
                </div>
                <div className="bg-dark text-white">
                    <div
                        className="description-content"
                        style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
                        dangerouslySetInnerHTML={{ __html: terms }}
                    />
                </div>
            </CustomDrawer> */}
        </>
    );
};

export default TermsAccordion;
