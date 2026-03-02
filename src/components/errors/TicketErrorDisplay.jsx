import React from "react";
import { Card } from "react-bootstrap";
import { AlertCircle, Home, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomBtn from "@/utils/CustomBtn";

const TicketErrorDisplay = ({
    errorMessage = "Something went wrong",
    onRetry = null,
    showHomeLink = true,
    showEventsLink = true
}) => {
    const router = useRouter();

    return (
        <Card
            className="text-center py-5 px-4 border-0 shadow-lg mx-auto bg-dark rounded-4"
            style={{ maxWidth: "500px" }}
        >
            <Card.Body>
                {/* Error Icon */}
                <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 border border-danger border-opacity-25"
                    style={{ width: "80px", height: "80px" }}
                >
                    <AlertCircle size={40} className="text-danger" />
                </div>

                {/* Error Title */}
                <h4 className="mb-3 text-white fw-bold">Oops! Unable to Load Ticket</h4>

                {/* Error Message */}
                <p className="text-secondary mb-4 fs-6">
                    {errorMessage}
                </p>

                {/* Divider */}
                <hr className="my-4 border-secondary opacity-25" />

                {/* Helper Text */}
                <p className="text-muted small mb-4">
                    The ticket link may be invalid or expired. Please check your booking confirmation or try again.
                </p>

                {/* Action Buttons */}
                <div className="d-flex flex-column gap-3">
                    {onRetry && (
                        <CustomBtn
                            variant="outline-primary"
                            HandleClick={onRetry}
                            buttonText="Try Again"
                            icon={<RefreshCw size={18} />}
                            iconPosition="left"
                            className="w-100"
                        />
                    )}

                    {showEventsLink && (
                        <CustomBtn
                            variant="primary"
                            HandleClick={() => router.push("/")}
                            buttonText="Browse Events"
                            icon={<Calendar size={18} />}
                            iconPosition="left"
                            className="w-100"
                        />
                    )}

                    {showHomeLink && (
                        <CustomBtn
                            variant="outline-warning"
                            HandleClick={() => router.push("/")}
                            buttonText="Go to Home"
                            icon={<Home size={18} />}
                            iconPosition="left"
                            className="w-100"
                        />
                    )}
                </div>

                {/* Contact Support */}
                <p className="text-muted small mt-4 mb-0">
                    Need help? <Link href="/contact" className="text-primary text-decoration-none">Contact Support</Link>
                </p>
            </Card.Body>
        </Card>
    );
};

export default TicketErrorDisplay;

