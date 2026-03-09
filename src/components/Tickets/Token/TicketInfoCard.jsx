import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { CalendarRange, Clock, MapPin, Ticket, UserRound, User, Phone, Mail } from "lucide-react";

const TicketInfoCard = ({ ticketData, ticketCount, formattedDate }) => {
    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="p-4">
                <Row className="g-4">
                    {/* Event Details */}
                    <Col xs={12} md={4} className="border-end-md pe-md-4">
                        <h6 className="fw-semibold mb-3" style={{ fontSize: '16px' }}>Event Details</h6>

                        <div className="mb-3 d-flex align-items-start">
                            <CalendarRange size={14} className="me-2 mt-1 text-primary" />
                            <div>
                                <div className="text-muted" style={{ fontSize: '12px' }}>Event Name</div>
                                <div className="fw-semibold" style={{ fontSize: '14px' }}>{ticketData?.event?.name || "N/A"}</div>
                            </div>
                        </div>

                        <div className="mb-3 d-flex align-items-start">
                            <Ticket size={14} className="me-2 mt-1 text-primary" />
                            <div>
                                <div className="text-muted" style={{ fontSize: '12px' }}>Ticket Type</div>
                                <div className="fw-semibold" style={{ fontSize: '14px' }}>{ticketData?.ticket?.name || "N/A"}</div>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-3">
                            <div className="d-flex align-items-center">
                                <CalendarRange size={14} className="me-1 text-secondary" />
                                <span style={{ fontSize: '12px' }}>{formattedDate}</span>
                            </div>

                            <div className="d-flex align-items-center">
                                <Clock size={14} className="me-1 text-secondary" />
                                <span style={{ fontSize: '12px' }}>Entry: {ticketData?.event?.entry_time || "N/A"}</span>
                            </div>

                            <div className="d-flex align-items-center">
                                <Clock size={14} className="me-1 text-secondary" />
                                <span style={{ fontSize: '12px' }}>Start: {ticketData?.event?.start_time || "N/A"}</span>
                            </div>
                        </div>
                    </Col>

                    {/* Location */}
                    <Col xs={12} md={4} className="border-end-md px-md-4">
                        <h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ fontSize: '16px' }}>
                            <MapPin size={18} className="me-2 text-danger" />
                            Location
                        </h6>

                        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                            {ticketData?.event?.address || "Venue not specified"}
                        </p>
                    </Col>

                    {/* Order Summary */}
                    <Col xs={12} md={4} className="ps-md-4">
                        <h6 className="fw-semibold mb-3" style={{ fontSize: '16px' }}>Order Summary</h6>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted" style={{ fontSize: '12px' }}>Quantity</span>
                            <span className="fw-semibold" style={{ fontSize: '14px' }}>{ticketCount}</span>
                        </div>

                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted" style={{ fontSize: '12px' }}>Price per ticket</span>
                            <span className="fw-semibold" style={{ fontSize: '14px' }}>
                                {ticketData?.ticket?.price > 0
                                    ? `${ticketData?.ticket?.currency} ${ticketData?.ticket?.price}`
                                    : "Free"}
                            </span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between">
                            <span className="fw-semibold" style={{ fontSize: '14px' }}>Total</span>
                            <span className="fw-bold text-success" style={{ fontSize: '16px' }}>
                                {ticketData?.ticket?.amount > 0
                                    ? `${ticketData?.ticket?.currency || "INR"} ${ticketData?.ticket?.amount}`
                                    : "Free"}
                            </span>
                        </div>
                    </Col>
                </Row>

                {/* User Information */}
                {ticketData?.user && (
                    <div className="pt-4 mt-3 border-top">
                        <h6 className="fw-semibold mb-3 d-flex align-items-center" style={{ fontSize: '16px' }}>
                            <UserRound className="me-2 text-primary" size={18} />
                            Booked By
                        </h6>

                        <div className="row g-3">
                            <div className="col-md-4 d-flex align-items-center">
                                <User size={16} className="me-2 text-secondary" />
                                <span className="fw-medium" style={{ fontSize: '14px' }}>
                                    {ticketData.user?.name || "N/A"}
                                </span>
                            </div>

                            <div className="col-md-4 d-flex align-items-center">
                                <Phone size={16} className="me-2 text-secondary" />
                                <span className="fw-medium" style={{ fontSize: '14px' }}>
                                    {ticketData.user?.number || "N/A"}
                                </span>
                            </div>

                            <div className="col-md-4 d-flex align-items-center">
                                <Mail size={16} className="me-2 text-secondary" />
                                <span className="fw-medium text-break" style={{ fontSize: '14px' }}>
                                    {ticketData.user?.email || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default TicketInfoCard;
