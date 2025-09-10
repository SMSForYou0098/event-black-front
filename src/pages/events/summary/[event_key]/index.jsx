import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, Mail, Phone, Ticket, CreditCard, Crown } from 'lucide-react';
import CartSteps from '../../../../utils/BookingUtils/CartSteps';
import { CUSTOM_SECONDORY } from '../../../../utils/consts';
const cardStyle = {
    backgroundColor: '#111113',
    border: 'none',
    borderRadius: '8px'
};

const sectionIconStyle = {
    color: CUSTOM_SECONDORY,
    size: 20,
    style: { marginRight: '10px' }
};
const BookingSummary = () => {

    return (
        <div className="cart-page section-padding">
            <Container className="">
                {/* Header */}
                <CartSteps id={'last'}/>
                <Row>
                    {/* Left Column */}
                    <Col lg={6} className="mb-4">
                        {/* Event Details Card */}
                        <Card style={cardStyle} className="mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <Calendar {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Event Details</h5>
                                </div>

                                <h3 className="text-white fw-bold mb-4">
                                    Navratri Festival 2024
                                </h3>

                                <Row className="mb-4">
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Date</div>
                                                <div className="text-white fw-bold">October 15, 2024</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Time</div>
                                                <div className="text-white fw-bold">7:00 PM - 11:00 PM</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex align-items-start">
                                    <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                    <div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Venue</div>
                                        <div className="text-white fw-bold">Grand Convention Center</div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Mumbai, Maharashtra, India</div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Contact Information Card */}
                        <Card style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <User {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Contact Information</h5>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <User size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Full Name</div>
                                            <div className="text-white fw-bold">Priya Sharma</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <Mail size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Email Address</div>
                                            <div className="text-white fw-bold">priya.sharma@email.com</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="d-flex align-items-center">
                                        <Phone size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Phone Number</div>
                                            <div className="text-white fw-bold">+91 98765 43210</div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column */}
                    <Col lg={6}>
                        {/* Ticket Details Card */}
                        <Card style={cardStyle} className="mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <Ticket {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Ticket Details</h5>
                                </div>

                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <div className="text-white fw-bold fs-5">
                                            Navratri Festival
                                        </div>
                                        <div className="d-flex align-items-center mt-1">
                                            <Crown size={18} style={{ color: '#ffd700', marginRight: '8px' }} />
                                            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>Gold Tier</span>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div style={{ color: '#ff4757', fontSize: '1.5rem', fontWeight: 'bold' }}>₹1500</div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>per ticket</div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mt-4 pt-3" style={{ borderTop: '1px solid #3a3a3a' }}>
                                    <div className="d-flex align-items-center">
                                        <Ticket size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <span style={{ color: '#b0b0b0' }}>Quantity</span>
                                    </div>
                                    <span className="text-white fw-bold fs-4">2</span>
                                </div>

                                <hr style={{ backgroundColor: '#3a3a3a', margin: '1.5rem 0' }} />

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{ color: '#b0b0b0' }}>Subtotal</span>
                                    <span className="text-white fw-bold">₹3000</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span style={{ color: '#b0b0b0' }}>Processing Fee</span>
                                    <span className="text-white fw-bold">₹0</span>
                                </div>

                                <hr style={{ backgroundColor: '#3a3a3a' }} />

                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-white fw-bold fs-5">Total Amount</span>
                                    <span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '1.5rem' }}>₹3000</span>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Payment Information Card */}
                        <Card style={cardStyle}>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <CreditCard {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Payment Information</h5>
                                </div>

                                <div className="text-center">
                                    <div style={{
                                        backgroundColor: '#3a3a3a',
                                        borderRadius: '8px',
                                        padding: '2rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <CreditCard size={48} style={{
                                            color: '#b0b0b0',
                                            marginBottom: '1rem'
                                        }} />
                                    </div>

                                    <div className="text-white fw-bold mb-2">
                                        Secure payment processing via Stripe
                                    </div>
                                    <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                                        Your payment details will be collected on the next step
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingSummary;