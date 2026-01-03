import React, { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { Ticket, ChevronUp } from "lucide-react";

const TermsAccordion = ({ terms }) => {
    const [show, setShow] = useState(false);

    if (!terms) return null;

    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <>
            {/* Trigger Button */}
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

            {/* Bottom Drawer */}
            <Offcanvas
                show={show}
                onHide={handleClose}
                placement="bottom"
                className="terms-drawer"
                style={{ height: "70vh" }}
            >
                <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title className="d-flex align-items-center gap-2">
                        <Ticket size={24} className="text-primary" />
                        <span>Terms and Conditions</span>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="bg-dark text-white">
                    <div
                        className="description-content"
                        style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}
                        dangerouslySetInnerHTML={{ __html: terms }}
                    />
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default TermsAccordion;
