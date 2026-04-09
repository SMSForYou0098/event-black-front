import React, { useCallback, useMemo } from 'react';
import { Container, Dropdown, Button } from 'react-bootstrap';
import { AlertCircle } from 'lucide-react';
import { PRIMARY } from '../../../../utils/consts';
import { useRouter } from "next/router";
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import ReactDOMServer from "react-dom/server";
import { AttendeesOffcanvas } from '../../../../components/events/CheckoutComps/checkout_utils';
import CommonTicketInfoSection from '../../../../components/events/CheckoutComps/CommonTicketInfoSection';
import { api } from "@/lib/axiosInterceptor"
import { useMyContext } from "@/Context/MyContextProvider";
import { getErrorMessage } from "@/utils/errorUtils";

import BookingSummarySkeleton from '../../../../utils/SkeletonUtils/BookingSummarySkeleton';
import { FaWhatsapp, FaSms } from "react-icons/fa";
import { MdEmail, } from "react-icons/md";
import Swal from 'sweetalert2';
import CustomBtn from '../../../../utils/CustomBtn';
import TicketDrawer from '../../../../components/Tickets/TicketDrawer';

const BookingSummary = () => {
    // All useState hooks at the top
    const [showAttendees, setShowAttendees] = useState(false);
    const [show, setShow] = useState(false);
    const [ticketType, setTicketType] = useState({ type: '', id: '' });

    // Context and router hooks
    const { ErrorAlert, formatDateRange, setTicketActions } = useMyContext();
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
            const normalizedResponse = res?.data?.data ?? res?.data;

            if (normalizedResponse?.status) {
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

                return normalizedResponse;
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
                ErrorAlert(getErrorMessage(err, "An error occurred"));
            }

        },
    });

    // useEffect hook
    useEffect(() => {
        if (sessionId) mutation.mutate(sessionId);
    }, [sessionId]);

    // Handle back button interception to redirect to Cart page instead of Checkout
    useEffect(() => {
        if (!event_key) return;

        const handleBackButton = (e) => {
            // Prevent default back behavior
            e.preventDefault();
            // Redirect to cart page
            router.replace(`/events/cart/${event_key}`);
        };

        // Push a state to history so we can trap the back action
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', handleBackButton);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [event_key, router]);

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
    const rawBookingTax =
        mutation.data?.bookings_tax ??
        mutation.data?.booking_tax ??
        mutation.data?.bookings?.bookings_tax ??
        mutation.data?.bookings?.booking_tax ??
        mutation.data?.data?.bookings_tax ??
        mutation.data?.data?.booking_tax ??
        mutation.data?.bookings?.bookings?.[0]?.bookings_tax ??
        mutation.data?.bookings?.bookings?.[0]?.booking_tax ??
        mutation.data?.taxes ??
        mutation.data?.bookings?.taxes ??
        mutation.data?.data?.taxes ??
        {};
    const bookingTax = Array.isArray(rawBookingTax) ? rawBookingTax[0] || {} : rawBookingTax;
    const toAmount = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    // For display purposes (user info, dates etc), use first individual booking
    const booking = isMaster ? mutation.data?.bookings?.bookings?.[0] || {} : mutation.data?.bookings || {};

    const seat_name = isMaster
        ? mutation.data?.bookings?.bookings
            ?.map((booking) => booking.seat_name)
            ?.filter(Boolean) // removes undefined, null, empty
            .join(", ")
        : mutation.data?.bookings?.seat_name;    // For TicketModal, transform the booking data to ensure each individual booking
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

    useEffect(() => {
        if (!mutation.isSuccess || isApprovalRequired || !booking?.id) {
            setTicketActions(null);
            return;
        }
        const bookingId = booking.id;
        setTicketActions({
            ticketCount: quantity,
            disableCombineButton: quantity > 1,
            imageLoaded: true,
            cardImageUrl: null,
            showIndividualDownload: quantity > 1 ? isMaster : undefined,
            handleDownloadClick: (type) => {
                if (type === 'single') handleTicketPreview('single', bookingId);
                else if (type === 'combine') handleTicketPreview('combine', bookingId);
                else if (type === 'download') handleTicketPreview('individual', bookingId);
            },
            handleTransferClick: () => {},
            ticketData: null,
        });
        return () => setTicketActions(null);
    }, [
        mutation.isSuccess,
        isApprovalRequired,
        quantity,
        isMaster,
        booking?.id,
        setTicketActions,
        handleTicketPreview,
    ]);

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
                showTicketDetails={false}
            />
            <Container >
                {/* <CartSteps id={'last'} /> */}
                <CommonTicketInfoSection
                    summaryProps={{
                        eventName: event?.name,
                        ticketName: ticket?.name,
                        price: ticket?.price,
                        quantity,
                        hidePrices: false,
                        handleOpen,
                        attendees,
                        sale_price: ticket?.sale_price,
                        currency: ticket?.currency,
                        showAttBtn: true,
                        subTotal: toAmount(bookingTax.base_amount ?? bookingTax.total_base_amount, 0),
                        processingFee:
                            toAmount(bookingTax.total_tax ?? bookingTax.total_tax_total, 0) +
                            toAmount(bookingTax.convenience_fee ?? bookingTax.total_convenience_fee, 0),
                        total: toAmount(bookingTax.final_amount ?? bookingTax.total_final_amount, 0),
                    }}
                    metadataProps={{
                        eventDates: getEventDates(),
                        bookingDate: formatDate(booking?.created_at),
                        seatName: seat_name,
                        bookedForDate: booking?.booking_date ? formatDate(booking?.booking_date) : null,
                        entryTime: event?.entry_time,
                        startTime: event?.start_time,
                        venueAddress: venue?.address || event?.address,
                        userName: user?.name,
                        userNumber: user?.number,
                    }}
                    leftExtra={
                        <>
                            <AttendeesOffcanvas
                                show={showAttendees}
                                handleClose={handleClose}
                                attendees={attendees}
                                title="Event Attendees"
                            />
                            {attendees?.length !== 0 && (
                                <div className="d-block d-sm-none text-center my-3">
                                    <CustomBtn
                                        size="sm"
                                        variant="primary"
                                        HandleClick={handleOpen}
                                        buttonText="View Attendees"
                                    />
                                </div>
                            )}
                        </>
                    }
                    rightExtra={
                        <>
                            {isApprovalRequired && (
                                <div className="alert alert-warning d-flex align-items-start gap-2 mb-3" role="alert">
                                    <AlertCircle size={20} className="flex-shrink-0 mt-1" />
                                    <div>
                                        <strong>Booking Pending Approval</strong>
                                        <p className="mb-0 small">Your booking is awaiting approval from the event organizer. You will receive your tickets once approved.</p>
                                    </div>
                                </div>
                            )}
                            <div className=" d-none d-sm-flex gap-2 justify-content-center align-items-center">
                                {!isApprovalRequired && (
                                    quantity === 1 ? (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="iq-button fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2"
                                            onClick={() => handleTicketPreview('single', booking?.id)}
                                        >
                                            <i className="fa-solid fa-download"></i> Download
                                        </Button>
                                    ) : (
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
                                    )
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
                        </>
                    }
                />
            </Container>
        </div>
    );
};

export default BookingSummary;