import React from "react";
import { Card } from "react-bootstrap";

const TermsAndConditionsCard = ({ ticketData }) => {
    if (!ticketData?.event?.online_ticket_terms && !ticketData?.event?.offline_ticket_terms) {
        return null;
    }

    return (
        <Card className="mt-5 shadow-sm border-0">
            <Card.Body>
                <h5 className="mb-4 fw-semibold">Terms & Conditions</h5>

                {ticketData?.event?.online_ticket_terms && (
                    <div className="mb-4">
                        <h6 className="fw-bold mb-2">Online Ticket Terms</h6>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: ticketData.event.online_ticket_terms,
                            }}
                        />
                    </div>
                )}

                {ticketData?.event?.offline_ticket_terms && (
                    <div>
                        <h6 className="fw-bold mb-2">Offline Ticket Terms</h6>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: ticketData.event.offline_ticket_terms,
                            }}
                        />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default TermsAndConditionsCard;
