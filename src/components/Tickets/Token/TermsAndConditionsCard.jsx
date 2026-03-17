import React from "react";
import { Card } from "react-bootstrap";

const TermsAndConditionsCard = ({ ticketData }) => {
    if (!ticketData?.event?.online_ticket_terms && !ticketData?.event?.offline_ticket_terms) {
        return null;
    }

    return (
        <Card className="mt-0 mt-sm-2 shadow-sm border-0">
            <Card.Body>
                <h5 className="mb-4 fw-semibold" style={{ fontSize: '16px' }}>Terms & Conditions</h5>

                {ticketData?.booking_type === 'online' && ticketData?.event?.online_ticket_terms && (
                    <div className="mb-4">
                        {/* <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Online Ticket Terms</h6> */}
                        <div
                            style={{ fontSize: '14px' }}
                            dangerouslySetInnerHTML={{
                                __html: ticketData.event.online_ticket_terms,
                            }}
                        />
                    </div>
                )}

                {ticketData?.booking_type !== 'online' && ticketData?.event?.offline_ticket_terms && (
                    <div>
                        {/* <h6 className="fw-bold mb-2" style={{ fontSize: '14px' }}>Offline Ticket Terms</h6> */}
                        <div
                            style={{ fontSize: '14px' }}
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
