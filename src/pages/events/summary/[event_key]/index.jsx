import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, Mail, Phone, Ticket, CreditCard, Crown, MessageSquare } from 'lucide-react';
import CartSteps from '../../../../utils/BookingUtils/CartSteps';
import { CUSTOM_SECONDORY } from '../../../../utils/consts';
import { useRouter } from "next/router";
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactDOMServer from "react-dom/server";
import { AttendeesOffcanvas, TicketDataSummary } from '../../../../components/events/CheckoutComps/checkout_utils';
import { api } from "@/lib/axiosInterceptor"
import { useMyContext } from "@/Context/MyContextProvider"; //done
import BookingSummarySkeleton from '../../../../utils/SkeletonUtils/BookingSummarySkeleton';
import { FaWhatsapp, FaSms } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Swal from 'sweetalert2';

const BookingSummary = () => {
    const sectionIconStyle = {
        color: CUSTOM_SECONDORY,
        size: 20,
        style: { marginRight: '10px' }
    };
    const [showAttendees, setShowAttendees] = useState(false);
    const { ErrorAlert } = useMyContext();
    const handleOpen = () => setShowAttendees(true);
    const handleClose = () => setShowAttendees(false);
    const router = useRouter();
    const raw = router.query.session_id;
    const sessionId = Array.isArray(raw) ? raw[0] : raw;
    const { event_key } = router.query; // Get eventId from URL params (e.g., AA00001)

const whatsappIcon = ReactDOMServer.renderToString(<FaWhatsapp size={20} color="#25D366" />);
const smsIcon = ReactDOMServer.renderToString(<FaSms size={20} color="#007bff" />);
const emailIcon = ReactDOMServer.renderToString(<MdEmail size={20} color="#ff0000" />);

    const mutation = useMutation({
        mutationFn: async (sid) => {
            if (sid === undefined || sid === 'undefined') {
                throw new Error('Invalid Session');
            }

            const res = await api.post("/verify-booking", { session_id: sid });

            if (res.data.status) {
                Swal.fire({
                    title: 'Booking Confirmed',
                    html: `<p>Booking details sent via:</p>
                            <div style="display:flex;justify-content:center;gap:1rem;margin-top:0.5rem;">
                            ${whatsappIcon}
                            ${smsIcon}
                            ${emailIcon}
                            </div>
                        `,
                    icon: 'success',
                    confirmButtonText: 'View Summary',
                    confirmButtonColor: '#ff0000'
                });

                return res.data;
            }

            throw new Error('Booking verification failed');
        },
        onError: (err) => {
            console.error("verify error", err);

            if (err?.message === 'Invalid Session') {
                // Handle invalid session with countdown
                let countdown = 5;
                let timerInterval;

                Swal.fire({
                    title: 'Invalid Session',
                    html: `Session ID is invalid or undefined.<br/>Redirecting to checkout in <b>${countdown}</b> seconds...`,
                    icon: 'error',
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        timerInterval = setInterval(() => {
                            countdown -= 1;
                            Swal.getHtmlContainer().querySelector('b').textContent = countdown;

                            if (countdown === 0) {
                                clearInterval(timerInterval);
                                Swal.close();
                                router.push(`/events/cart/${event_key}`);
                            }
                        }, 1000);
                    },
                    willClose: () => {
                        clearInterval(timerInterval);
                    }
                });
            } else {
                ErrorAlert(err?.response?.data?.message || err?.response?.data?.error || err?.message || "An error occurred");
            }
        },
    });

    // auto-run when sessionId is available
    useEffect(() => {
        if (sessionId) mutation.mutate(sessionId);
    }, [sessionId]);

    if (!sessionId) return <p>Waiting for session id...</p>;
    if (mutation.isPending) return <BookingSummarySkeleton />;
    if (mutation.isError) return <p>Error verifying booking.</p>;

    const booking = mutation.data?.bookings || {};

    const ticket = mutation?.data?.ticket || {};
    const event = mutation?.data?.event || {};
    // const organizer = event.user || {};
    const user = mutation?.data?.user || {};
    const attendees = mutation?.data?.attendee || [];

    // Format date and time
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Parse event date range
    const getEventDates = () => {
        if (!event.date_range) return 'N/A';
        const dates = event.date_range.split(',');
        if (dates.length === 2) {
            return `${formatDate(dates[0])} to ${formatDate(dates[1])}`;
        }
        return formatDate(dates[0]);
    };

    // Get event times
    const getEventTimes = () => {
        if (!event.start_time || !event.end_time) return 'N/A';
        return `${event.start_time} - ${event.end_time}`;
    };

    return (
        <div className="cart-page">
            <Container className="">
                {/* Header */}
                <CartSteps id={'last'} />
                <Row>
                    {/* Left Column */}
                    <Col lg={4} className="mb-4">
                        {/* Event Details Card */}
                        <Card className="custom-dark-bg mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center mb-3">
                                    <Calendar {...sectionIconStyle} />
                                    <h5 className="text-white mb-0 fw-bold">Event Details</h5>
                                </div>

                                <h3 className="text-white fw-bold mb-4">
                                    {event.name || 'Event Name'}
                                </h3>

                                <Row className="mb-4">
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Date</div>
                                                <div className="text-white fw-bold">{getEventDates()}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Time</div>
                                                <div className="text-white fw-bold">{getEventTimes()}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex align-items-start">
                                    <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                    <div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Venue</div>
                                        <div className="text-white fw-bold">{event.address || 'Venue Address'}</div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                                            {event.city || 'City'}, {event.state || 'State'}, {event.country || 'Country'}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Contact Information Card */}
                        {/* <Card className="custom-dark-bg">
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
                                            <div className="text-white fw-bold">{user.name || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <Mail size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Email Address</div>
                                            <div className="text-white fw-bold">{user.email || booking.email || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="d-flex align-items-center">
                                        <Phone size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                        <div>
                                            <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Phone Number</div>
                                            <div className="text-white fw-bold">{user.number ? `+${user.number}` : booking.number ? `+${booking.number}` : 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card> */}
                    </Col>

                    {/* Right Column */}
                    <Col lg={8}>
                        {/* Ticket Details Card */}
                        <TicketDataSummary
                            eventName={event?.name}
                            ticketName={ticket?.name}
                            price={ticket?.price}
                            quantity={booking?.bookings?.length || 1}
                            hidePrices={false}
                            handleOpen={handleOpen}
                            attendees={attendees}
                            sale_price={ticket?.sale_price}
                            currency={ticket?.currency}
                            showAttBtn={true}
                            subTotal={mutation?.data?.taxes?.base_amount}
                            processingFee={mutation?.data?.taxes?.total_tax}
                            total={mutation?.data?.taxes?.final_amount || booking?.amount} />
                        {/* Payment Information Card */}
                        {/* <Card className='custom-dark-bg'>
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
                                        {booking.payment_status === "1" ? "Payment Successful" : "Payment Pending"}
                                    </div>
                                    <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                                        {booking.payment_method === "online" ? "Paid online via secure payment gateway" :
                                            booking.payment_method === "offline" ? "Offline payment" :
                                                "Payment method not specified"}
                                    </div>
                                    {booking.amount && booking.amount !== "0.00" && (
                                        <div className="text-white fw-bold mt-3">
                                            Amount Paid: ₹{booking.amount}
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card> */}
                        {/* Pass boolean state and close handler plus attendees */}
                        <AttendeesOffcanvas
                            show={showAttendees}
                            handleClose={handleClose}
                            attendees={attendees}
                            title="Event Attendees"
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingSummary;