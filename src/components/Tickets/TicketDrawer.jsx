import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ArrowBigDownDash, Printer, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from "@/Context/MyContextProvider";
import TicketCanvasView from '../events/Tickets/TicketCanvasView';
import CustomBtn from '../../utils/CustomBtn';
import CustomDrawer from '../../utils/CustomDrawer';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// API fetch function for ticket background image
const fetchTicketImage = async (path) => {
    if (!path) return null;
    const response = await api.post(
        'get-image/retrive',
        { path },
        { responseType: 'blob' }
    );
    return URL.createObjectURL(response.data);
};

/**
 * TicketDrawer - Common drawer component for ticket display
 * Used by: summary page, bookings page
 * 
 * Props:
 * - show: boolean - whether drawer is open
 * - onClose: function - callback to close drawer
 * - ticketType: { type: 'individual' | 'combine', id: string }
 * - ticketData: object - booking data including tickets
 * - showPrintButton: boolean - whether to show print button
 * - showTicketDetails: boolean - whether to show ticket details on canvas
 */
const TicketDrawer = ({
    show,
    onClose,
    ticketType,
    ticketData,
    showPrintButton = false,
    showTicketDetails = true,
}) => {
    const { isMobile, formatDateRange } = useMyContext();

    // State for showing ticket after user confirms notice
    const [showTicket, setShowTicket] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Refs for canvas download functionality
    const singleCanvasRef = useRef(null);
    const swiperCanvasRefs = useRef({});

    // Get ticket background URL from first booking
    const ticketBgUrl = ticketData?.ticket?.background_image ||
        ticketData?.bookings?.[0]?.ticket?.background_image || '';

    // Pre-fetch and cache the ticket background image
    const { data: cachedBgImage, isLoading: isBgLoading, isError: isBgError } = useQuery({
        queryKey: ['ticket-drawer-bg', ticketBgUrl],
        queryFn: () => fetchTicketImage(ticketBgUrl),
        enabled: show && !!ticketBgUrl,
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });

    // Consider loading complete if error occurred (will use fallback bg)
    const isImageReady = !isBgLoading || isBgError || !ticketBgUrl;

    // Reset state when drawer opens/closes
    useEffect(() => {
        if (!show) {
            setShowTicket(false);
            setIsCanvasReady(false);
            setActiveSlideIndex(0);
        }
    }, [show]);

    // Handle generate ticket click
    const handleGenerateTicket = useCallback(() => {
        setShowTicket(true);
    }, []);

    // Handle download click
    const handleDownload = useCallback(() => {
        if (ticketType?.type === 'individual') {
            swiperCanvasRefs.current[activeSlideIndex]?.download();
        } else {
            singleCanvasRef.current?.download();
        }
    }, [ticketType, activeSlideIndex]);

    // Handle print click
    const handlePrint = useCallback(() => {
        if (ticketType?.type === 'individual') {
            swiperCanvasRefs.current[activeSlideIndex]?.print();
        } else {
            singleCanvasRef.current?.print();
        }
    }, [ticketType, activeSlideIndex]);

    // Drawer content - Notice before generating ticket
    const noticeContent = (
        <div className="p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={24} className="text-warning" />
                <h6 className="mb-0 fw-bold">Important Information</h6>
            </div>

            {ticketType?.type === 'individual' && (
                <div className="alert alert-warning mb-3">
                    <h6 className="alert-heading mb-2">Single Ticket</h6>
                    <p className="mb-0">
                        If you select single ticket, each attendee receives a personal QR code for entry,
                        and group tickets won&apos;t work.
                    </p>
                </div>
            )}

            {ticketType?.type === 'combine' && (
                <div className="alert alert-info mb-3">
                    <h6 className="alert-heading mb-2">Group Ticket</h6>
                    <p className="mb-0">
                        If you select group ticket, all attendees must arrive together and show the group ticket
                        at the venue for entry. Individual tickets will not work.
                    </p>
                </div>
            )}

            <CustomBtn
                buttonText="Generate Ticket"
                variant="primary"
                className="w-100 mt-3"
                HandleClick={handleGenerateTicket}
                loading={!isImageReady}
            />
        </div>
    );

    // Drawer content - Ticket display after user confirms
    const ticketContent = (
        <div className="p-3">
            {/* Loading state */}
            {!isImageReady && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Ticket Canvas */}
            {isImageReady && (
                <Row>
                    <Col lg="12">
                        {ticketType?.type === 'individual' ? (
                            ticketData?.bookings?.length > 0 && (
                                <Swiper
                                    autoplay={true}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    navigation
                                    onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                                >
                                    <div className="d-flex gap-2 flex-column justify-content-center">
                                        {ticketData.bookings.map((item, index) => (
                                            <SwiperSlide className="card-slide" key={index}>
                                                <Col lg={12} md={12} xl={12}>
                                                    <div>
                                                        <TicketCanvasView
                                                            ref={(el) => { swiperCanvasRefs.current[index] = el; }}
                                                            showDetails={showTicketDetails}
                                                            ticketData={item}
                                                            ticketNumber={index + 1}
                                                            ticketLabel="(I)"
                                                            onReady={() => setIsCanvasReady(true)}
                                                            preloadedImage={cachedBgImage}
                                                        />
                                                    </div>
                                                    <p className="text-center text-secondary">{index + 1} (I)</p>
                                                </Col>
                                            </SwiperSlide>
                                        ))}
                                    </div>
                                </Swiper>
                            )
                        ) : ticketType?.type === 'combine' ? (
                            <div style={{ height: "auto" }}>
                                <Col lg={12} md={12} xl={12}>
                                    <div>
                                        <TicketCanvasView
                                            ref={singleCanvasRef}
                                            showDetails={showTicketDetails}
                                            ticketData={ticketData}
                                            ticketNumber={1}
                                            ticketLabel="(G)"
                                            onReady={() => setIsCanvasReady(true)}
                                            preloadedImage={cachedBgImage}
                                        />
                                    </div>
                                    <p className="text-center text-secondary">(G)</p>
                                </Col>
                            </div>
                        ) : null}
                    </Col>
                </Row>
            )}

            {/* Footer info */}
            <div className="text-center text-secondary small p-3 mt-3">
                <p className="mb-0">No physical ticket needed! Download your Ticket & enjoy unlimited fun.</p>
            </div>
            {/* Download/Print Buttons */}
            <Row className="d-flex justify-content-center mt-3">
                <Col xs={12} sm={6} className="d-flex justify-content-center gap-2">
                    <CustomBtn
                        buttonText="Download"
                        icon={<ArrowBigDownDash size={14} />}
                        loading={!isCanvasReady}
                        className="flex-grow-1 btn-sm"
                        HandleClick={handleDownload}
                        disabled={!isCanvasReady}
                    />

                    {showPrintButton && (
                        <CustomBtn
                            buttonText="Print"
                            icon={<Printer size={18} />}
                            variant="secondary"
                            className="flex-grow-1"
                            HandleClick={handlePrint}
                            disabled={!isCanvasReady}
                        />
                    )}
                </Col>
            </Row>


        </div>
    );

    return (
        <CustomDrawer
            title={ticketType?.type === 'individual' ? 'Individual Tickets' : 'Group Ticket'}
            showOffcanvas={show}
            setShowOffcanvas={onClose}
            hideIndicator={true}

        >
            {showTicket ? ticketContent : noticeContent}
        </CustomDrawer>
    );
};

export default TicketDrawer;
