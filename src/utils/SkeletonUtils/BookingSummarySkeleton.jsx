import React from 'react';
import { Container, Row, Col, Card, Button, Placeholder } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, Mail, Phone, CreditCard } from 'lucide-react';
import { CUSTOM_SECONDORY } from '../consts';

const BookingSummarySkeleton = () => {
    const sectionIconStyle = {
        color: CUSTOM_SECONDORY,
        size: 20,
        style: { marginRight: '10px' }
    };

    return (
        <div className="cart-page section-padding">
            <Container className="">
                {/* Header */}
                {/* <CartSteps id={'last'} /> */}
                <Row>
                    {/* Left Column */}
                    <Col lg={6} className="mb-4">
                        {/* Event Details Card Skeleton */}
                        <Card className="custom-dark-bg mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <Calendar {...sectionIconStyle} />
                                    <Placeholder as="h5" animation="glow" className="mb-0">
                                        <Placeholder xs={4} bg="secondary" />
                                    </Placeholder>
                                </div>

                                <Placeholder as="h3" animation="glow" className="mb-4">
                                    <Placeholder xs={8} bg="secondary" />
                                </Placeholder>

                                <Row className="mb-4">
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Date</div>
                                                <Placeholder animation="glow">
                                                    <Placeholder xs={6} bg="secondary" />
                                                </Placeholder>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Time</div>
                                                <Placeholder animation="glow">
                                                    <Placeholder xs={5} bg="secondary" />
                                                </Placeholder>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex align-items-start">
                                    <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                    <div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Venue</div>
                                        <Placeholder animation="glow" className="mb-1">
                                            <Placeholder xs={7} bg="secondary" />
                                        </Placeholder>
                                        <Placeholder animation="glow">
                                            <Placeholder xs={9} bg="secondary" />
                                        </Placeholder>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Contact Information Card Skeleton */}
                        <Card className="custom-dark-bg">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <User {...sectionIconStyle} />
                                    <Placeholder as="h5" animation="glow" className="mb-0">
                                        <Placeholder xs={5} bg="secondary" />
                                    </Placeholder>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <User size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Full Name</div>
                                            <Placeholder animation="glow">
                                                <Placeholder xs={6} bg="secondary" />
                                            </Placeholder>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <Mail size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Email Address</div>
                                            <Placeholder animation="glow">
                                                <Placeholder xs={8} bg="secondary" />
                                            </Placeholder>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="d-flex align-items-center">
                                        <Phone size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Phone Number</div>
                                            <Placeholder animation="glow">
                                                <Placeholder xs={7} bg="secondary" />
                                            </Placeholder>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column */}
                    <Col lg={6}>
                        {/* Ticket Details Card Skeleton */}
                        <Card className="custom-dark-bg mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <CreditCard {...sectionIconStyle} />
                                    <Placeholder as="h5" animation="glow" className="mb-0">
                                        <Placeholder xs={5} bg="secondary" />
                                    </Placeholder>
                                </div>

                                <div className="mb-3">
                                    <Placeholder animation="glow" className="d-flex justify-content-between mb-2">
                                        <Placeholder xs={4} bg="secondary" />
                                        <Placeholder xs={3} bg="secondary" />
                                    </Placeholder>
                                    <Placeholder animation="glow" className="d-flex justify-content-between mb-2">
                                        <Placeholder xs={5} bg="secondary" />
                                        <Placeholder xs={2} bg="secondary" />
                                    </Placeholder>
                                    <Placeholder animation="glow" className="d-flex justify-content-between mb-2">
                                        <Placeholder xs={3} bg="secondary" />
                                        <Placeholder xs={2} bg="secondary" />
                                    </Placeholder>
                                </div>

                                <hr className="my-4" />

                                <Placeholder animation="glow" className="d-flex justify-content-between mb-3">
                                    <Placeholder xs={3} bg="secondary" />
                                    <Placeholder xs={4} bg="secondary" />
                                </Placeholder>
                            </Card.Body>
                        </Card>

                        {/* Payment Information Card Skeleton */}
                        <Card className='custom-dark-bg'>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <CreditCard {...sectionIconStyle} />
                                    <Placeholder as="h5" animation="glow" className="mb-0">
                                        <Placeholder xs={5} bg="secondary" />
                                    </Placeholder>
                                </div>

                                <div className="text-center">
                                    <div className='custom-dark-content-bg rounded-3 py-4 mb-4'>
                                        <CreditCard size={48} style={{ color: '#b0b0b0' }} />
                                    </div>

                                    <Placeholder animation="glow" className="mb-2">
                                        <Placeholder xs={6} bg="secondary" />
                                    </Placeholder>
                                    <Placeholder animation="glow" className="mb-3">
                                        <Placeholder xs={8} bg="secondary" />
                                    </Placeholder>
                                    <Placeholder animation="glow">
                                        <Placeholder xs={7} bg="secondary" />
                                    </Placeholder>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Attendees Button Skeleton */}
                        <Placeholder animation="glow" className="d-grid mt-3">
                            <Placeholder.Button xs={12} bg="primary" />
                        </Placeholder>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingSummarySkeleton;