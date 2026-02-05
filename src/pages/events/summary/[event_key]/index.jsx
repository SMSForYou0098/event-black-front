import React, { useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { Calendar, Clock, Mail, MapPin, User, AlertCircle } from 'lucide-react';
import CartSteps from '../../../../utils/BookingUtils/CartSteps';
import { CUSTOM_SECONDORY, PRIMARY } from '../../../../utils/consts';
import { useRouter } from "next/router";
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactDOMServer from "react-dom/server";
import { AttendeesOffcanvas, ETicketAlert, TicketDataSummary } from '../../../../components/events/CheckoutComps/checkout_utils';
import { api } from "@/lib/axiosInterceptor"
import { useMyContext } from "@/Context/MyContextProvider";
import BookingSummarySkeleton from '../../../../utils/SkeletonUtils/BookingSummarySkeleton';
import { FaWhatsapp, FaSms } from "react-icons/fa";
import { MdEmail, } from "react-icons/md";
import Swal from 'sweetalert2';
import CustomBtn from '../../../../utils/CustomBtn';
import TicketDrawer from '../../../../components/Tickets/TicketDrawer';
import BookingFooterLayout from '../../../../utils/BookingFooterLayout';

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
                    html: `<p style="display:flex;justify-content:center;align-items:center;gap:10px">
                            Tickets sent via:
                            ${whatsappIcon}
                            ${smsIcon}
                            ${emailIcon}
                        </p>
                        <p class='text-warning'>Please do not share your tickets</p>`,
                    icon: 'success',
                    confirmButtonText: 'View Summary',
                    confirmButtonColor: PRIMARY
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

    const handleCloseDrawer = useCallback(() => {
        setTicketType({ type: '' });
        setShow(false);
    }, []);

    // Derived data from mutation (before conditional returns)
    const isMaster = mutation.data?.isMaster || false;

    // For display purposes (user info, dates etc), use first individual booking
    const booking = isMaster ? mutation.data?.bookings?.bookings?.[0] || {} : mutation.data?.bookings || {};

    // For TicketModal, transform the booking data to ensure each individual booking
    // has the token needed for QR code display
    // NOTE: Individual tickets use their own 'token' for QR, group tickets use 'order_id'
    const fullBookingData = useMemo(() => {
        const masterBooking = mutation.data?.bookings || {};

        if (!isMaster) return masterBooking;

        // For individual bookings, ensure token exists (fallback to order_id only if no token)
        // Do NOT add order_id to individual bookings - we want QR from token
        if (masterBooking.bookings && Array.isArray(masterBooking.bookings)) {
            return {
                ...masterBooking,
                bookings: masterBooking.bookings.map(b => ({
                    ...b,
                    // Only set token fallback, don't add order_id to individual bookings
                    token: b.token || masterBooking.order_id
                }))
            };
        }

        return masterBooking;
    }, [mutation.data, isMaster]);

    const quantity = isMaster ? mutation.data?.bookings?.bookings?.length || 0 : 1;
    // For master bookings, get the first booking from the bookings array to extract ticket/event data
    const firstBooking = isMaster && booking?.bookings?.length > 0 ? booking.bookings[0] : null;

    const ticket = firstBooking?.ticket || booking?.ticket || mutation?.data?.ticket || {};
    const event = ticket?.event || mutation?.data?.event || {};
    const venue = event?.venue || {};
    const isApprovalRequired = event?.event_controls?.is_approval_required;

    // User data can be in booking directly, in the first booking's user, or in a separate user object
    const user = {
        name: booking?.user?.name || booking?.name || mutation?.data?.user?.name,
        number: booking?.user?.number || booking?.number || mutation?.data?.user?.number,
        email: booking?.user?.email || booking?.email || mutation?.data?.user?.email,
    };
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
        if (!event.start_time && !event.entry_time) return 'N/A';
        const entryTime = event.entry_time || '';
        const startTime = event.start_time || '';
        if (entryTime && startTime) {
            return `${entryTime} - ${startTime}`;
        }
        return entryTime || startTime;
    };


    return (
        <div className="cart-page">
            <TicketDrawer
                show={show}
                onClose={handleCloseDrawer}
                ticketType={ticketType}
                ticketData={fullBookingData}
                showTicketDetails={true}
            />
            <Container className="">
                <CartSteps id={'last'} />
                <ETicketAlert />
                <Row>
                    {/* Right Column */}
                    <Col lg={8}>
                        <TicketDataSummary
                            eventName={event?.name}
                            ticketName={ticket?.name}
                            price={ticket?.price}
                            quantity={quantity}
                            hidePrices={false}
                            handleOpen={handleOpen}
                            attendees={attendees}
                            sale_price={ticket?.sale_price}
                            currency={ticket?.currency}
                            showAttBtn={true}
                            subTotal={mutation?.data?.taxes?.base_amount ?? 0}
                            processingFee={mutation?.data?.taxes?.total_tax ?? 0}
                            total={mutation?.data?.taxes?.final_amount ?? 0}
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
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Date</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{getEventDates()}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Booking Date</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{formatDate(booking?.created_at) || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    {
                                        booking?.booking_date && (
                                            <Col xs={6}>
                                                <div className="d-flex align-items-start">
                                                    <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                                    <div>
                                                        <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Booked For Date</div>
                                                        <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{formatDate(booking?.booking_date) || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </Col>
                                        )
                                    }
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Entry Time</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{event?.entry_time}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-center">
                                            <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Start Time</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{event?.start_time}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12}>
                                        <div className="d-flex align-items-start">
                                            <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Venue</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{venue?.address || event?.address || 'Venue Address'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <User size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Name</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{user?.name || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <User size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Contact Number</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{user?.number || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col>
                                    {/* <Col xs={6}>
                                        <div className="d-flex align-items-start">
                                            <Mail size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                                            <div>
                                                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Email</div>
                                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{user?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </Col> */}

                                </Row>

                            </Card.Body>
                        </Card>
                        {/* Pending Approval Message */}
                        {isApprovalRequired && (
                            <div className="alert alert-warning d-flex align-items-start gap-2 mb-3" role="alert">
                                <AlertCircle size={20} className="flex-shrink-0 mt-1" />
                                <div>
                                    <strong>Booking Pending Approval</strong>
                                    <p className="mb-0 small">Your booking is awaiting approval from the event organizer. You will receive your tickets once approved.</p>
                                </div>
                            </div>
                        )}

                        <div className='d-block d-sm-none'>
                            <BookingFooterLayout
                                center={<div className='d-flex gap-2 justify-content-center align-items-center d-sm-none'>
                                    {!isApprovalRequired && (
                                        <Dropdown>
                                            <Dropdown.Toggle
                                                variant="primary"
                                                size="sm"
                                                className="iq-button fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
                                            >
                                                <i className="fa-solid fa-download"></i> Download
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end" className="custom-dropdown-menu">
                                                <Dropdown.Item onClick={() => handleTicketPreview('combine', booking?.id)} className="custom-dropdown-item">
                                                    Group Ticket
                                                </Dropdown.Item>
                                                {isMaster && (
                                                    <Dropdown.Item onClick={() => handleTicketPreview('individual', booking?.id)} className="custom-dropdown-item">
                                                        Single Ticket
                                                    </Dropdown.Item>
                                                )}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    )}
                                    {attendees?.length !== 0 && (
                                        <CustomBtn
                                            size="sm"
                                            variant="primary"
                                            HandleClick={handleOpen}
                                            buttonText="View Attendees"
                                        />
                                    )}
                                </div>}
                            />
                        </div>

                        {/* <div className='d-none d-sm-flex gap-2 justify-content-center align-items-center'> */}
                        <div
                            className=" d-none d-sm-flex gap-2 justify-content-center align-items-center"
                        >
                            {!isApprovalRequired && (
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="primary"
                                        size="sm"
                                        className="iq-button fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
                                    >
                                        <i className="fa-solid fa-download"></i> Download
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align="end" className="custom-dropdown-menu">
                                        <Dropdown.Item onClick={() => handleTicketPreview('combine', booking?.id)} className="custom-dropdown-item">
                                            Group Ticket
                                        </Dropdown.Item>
                                        {isMaster && (
                                            <Dropdown.Item onClick={() => handleTicketPreview('individual', booking?.id)} className="custom-dropdown-item">
                                                Single Ticket
                                            </Dropdown.Item>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            )}
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