import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, Mail, Phone, Ticket, CreditCard, Crown } from 'lucide-react';
import CartSteps from '../../../../utils/BookingUtils/CartSteps';
import { CUSTOM_SECONDORY } from '../../../../utils/consts';
import {useRouter} from "next/router";
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

import { TicketDataSummary } from '../../../../components/events/CheckoutComps/checkout_utils';
import {api} from "@/lib/axiosInterceptor"
import { useQuery } from '@tanstack/react-query';
const BookingSummary = () => {
    const sectionIconStyle = {
        color: CUSTOM_SECONDORY,
        size: 20,
        style: { marginRight: '10px' }
    };
      const router = useRouter();
 
 const raw = router.query.sessionId;
 const sessionId = Array.isArray(raw) ? raw[0] : raw;
 const mutation = useMutation({
   mutationFn: async (sid) => {
     const res = await api.post("/verify-booking", { session_id: sid });
     return res.data;
   },
   onSuccess: (data) => {
     console.log("verify success", data);
     // handle data, redirect, toast, etc.
     // router.push('/somewhere') or show success UI
   },
   onError: (err) => {
     console.error("verify error", err);
   },
   // optional: retry, onSettled, etc.
 });

  // auto-rn when sessionId is available
  useEffect(() => {
    if (sessionId) mutation.mutate(sessionId);
  }, [sessionId]);

  if (!sessionId) return <p>Waiting for session id...</p>;
  if (mutation.isLoading) return <p>Verifying booking…</p>;
//   if (mutation.isError) return <p>Error verifying booking.</p>;


    return (
        <div className="cart-page section-padding">
            <Container className="">
                {/* Header */}
                <CartSteps id={'last'} />
                <Row>
                    {/* Left Column */}
                    <Col lg={6} className="mb-4">
                        {/* Event Details Card */}
                        <Card className="custom-dark-bg mb-4">
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
                        <Card className="custom-dark-bg">
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
                        <TicketDataSummary validatedData={null} />

                        {/* Payment Information Card */}
                        <Card className='custom-dark-bg'>
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-4">
                                    <CreditCard {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Payment Information</h5>
                                </div>

                                <div className="text-center">
                                    <div className='custom-dark-content-bg rounded-3 py-4 mb-4'>
                                        <CreditCard size={48} style={{
                                            color: '#b0b0b0',
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