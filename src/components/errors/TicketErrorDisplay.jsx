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
            className="text-center py-5 px-4 border-0 shadow-lg"
            style={{
                background: "linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)",
                borderRadius: "1rem",
                maxWidth: "500px",
                margin: "0 auto"
            }}
        >
            <Card.Body>
                {/* Error Icon */}
                <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "rgba(220, 53, 69, 0.15)",
                        border: "2px solid rgba(220, 53, 69, 0.3)"
                    }}
                >
                    <AlertCircle size={40} className="text-danger" />
                </div>

                {/* Error Title */}
                <h4 className="mb-3 text-white fw-bold">Oops! Unable to Load Ticket</h4>

                {/* Error Message */}
                <p className="text-secondary mb-4" style={{ fontSize: "1rem" }}>
                    {errorMessage}
                </p>

                {/* Divider */}
                <div
                    className="my-4"
                    style={{
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                    }}
                />

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
                            variant="outline-secondary"
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
                    Need help? <Link href="/contact" className="text-primary">Contact Support</Link>
                </p>
            </Card.Body>
        </Card>
    );
};

export default TicketErrorDisplay;

