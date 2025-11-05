import React, { useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, } from 'lucide-react';
import CartSteps from '../../../../utils/BookingUtils/CartSteps';
import { CUSTOM_SECONDORY } from '../../../../utils/consts';
import { useRouter } from "next/router";
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactDOMServer from "react-dom/server";
import { AttendeesOffcanvas, ETicketAlert, TicketDataSummary } from '../../../../components/events/CheckoutComps/checkout_utils';
import { api } from "@/lib/axiosInterceptor"
import { useMyContext } from "@/Context/MyContextProvider";
import BookingSummarySkeleton from '../../../../utils/SkeletonUtils/BookingSummarySkeleton';
import { FaWhatsapp, FaSms } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Swal from 'sweetalert2';
import CustomBtn from '../../../../utils/CustomBtn';
import TicketModal from '../../../../components/Tickets/TicketModal';

const BookingSummary = () => {
    // All useState hooks at the top
    const [showAttendees, setShowAttendees] = useState(false);
    const [show, setShow] = useState(false);
    const [ticketType, setTicketType] = useState({ type: '', id: '' });
    
    // Context and router hooks
    const { ErrorAlert, formatDateRange } = useMyContext();
    const router = useRouter();
    
    // Derived values from router
    const raw = router.query.session_id;
    const sessionId = Array.isArray(raw) ? raw[0] : raw;
    const { event_key } = router.query;

    // Static icon strings
    const whatsappIcon = ReactDOMServer.renderToString(<FaWhatsapp size={20} color="#25D366" />);
    const smsIcon = ReactDOMServer.renderToString(<FaSms size={20} color="#007bff" />);
    const emailIcon = ReactDOMServer.renderToString(<MdEmail size={20} color="#ff0000" />);

    // useMutation hook
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

    // useEffect hook
    useEffect(() => {
        if (sessionId) mutation.mutate(sessionId);
    }, [sessionId]);

    // useCallback hooks
    const handleOpen = useCallback(() => setShowAttendees(true), []);
    const handleClose = useCallback(() => setShowAttendees(false), []);

    const handleTicketPreview = useCallback((type, id) => {
        setTicketType({ type, id });
        setShow(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setTicketType({ type: '' });
        setShow(false);
    }, []);

    // Derived data from mutation (before conditional returns)
    const isMaster = mutation.data?.isMaster || false;
    const booking = mutation.data?.bookings || {};
    const ticket = mutation?.data?.ticket || {};
    const event = mutation?.data?.event || {};
    const user = mutation?.data?.user || {};
    const attendees = mutation?.data?.attendee || [];

    // NOW conditional returns AFTER all hooks
    if (!sessionId) return <p>Waiting for session id...</p>;
    if (mutation.isPending) return <BookingSummarySkeleton />;
    if (mutation.isError) return <p>Error verifying booking.</p>;

    // Helper functions (these are fine after conditional returns since they're not hooks)
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
            day: 'numeric'
        });
    };

    const getEventDates = () => {
        if (!event.date_range) return 'N/A';
        const dates = event.date_range.split(',');
        if (dates.length === 2) {
            return `${formatDate(dates[0])} to ${formatDate(dates[1])}`;
        }
        return formatDate(dates[0]);
    };

    const getEventTimes = () => {
        if (!event.start_time || !event.end_time) return 'N/A';
        return `${event.start_time} - ${event.end_time}`;
    };

    const HandleDownload = () => {
        Swal.fire({
            title: 'Download Ticket',
            text: "Choose how you want to download your ticket. Once a ticket type is selected, it can't be changed!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Group',
            cancelButtonText: isMaster ? 'Individual' : 'Cancel',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                 handleTicketPreview('combine', booking?.id);
            } else if (result.dismiss === Swal.DismissReason.cancel && isMaster) {
                 handleTicketPreview('individual', booking?.id);
            }
        });
    };

    return (
        <div className="cart-page">
            <TicketModal
                show={show}
                handleCloseModal={handleCloseModal}
                ticketType={ticketType}
                ticketData={booking}
                isAccreditation={booking?.type === 'AccreditationBooking'}
                showTicketDetails={booking?.type === 'AccreditationBooking'}
                formatDateRange={formatDateRange}
            />
            <Container className="">
                <CartSteps id={'last'} />
                <ETicketAlert/>
                <Row>
                    {/* Right Column */}
                    <Col lg={8}>
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
                            total={mutation?.data?.taxes?.final_amount || booking?.amount} 
                        />
                        <AttendeesOffcanvas
                            show={showAttendees}
                            handleClose={handleClose}
                            attendees={attendees}
                            title="Event Attendees"
                        />
                    </Col>

                    {/* Left Column */}
                    <Col lg={4}>
                        <Card className="custom-dark-bg mb-4">
                            <Card.Body className="p-4">
                                <Row className="g-3 mb-3">
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
                                    <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Booking Date</div>
                                                <div className="text-white fw-bold">{formatDate(booking?.created_at) || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <User size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Contact Number</div>
                                                <div className="text-white fw-bold">{user?.number || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex align-items-start">
                                    <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                    <div>
                                        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Venue</div>
                                        <div className="text-white fw-bold">{event.address || 'Venue Address'}</div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        <div
                            className="d-flex gap-2 justify-content-center align-items-center"
                        >
                            <CustomBtn
                                size="sm"
                                variant="primary"
                                HandleClick={HandleDownload}
                                buttonText="Download Tickets"
                                icon={<i className="fa-solid fa-download"></i>}
                            />
                            {attendees?.length !== 0 && (
                                <CustomBtn
                                    size="sm"
                                    variant="primary"
                                    HandleClick={handleOpen}
                                    buttonText="View Attendees"
                                />
                            )}
                        </div>

                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BookingSummary;