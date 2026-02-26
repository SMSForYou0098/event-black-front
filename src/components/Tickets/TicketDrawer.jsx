import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import { ArrowBigDownDash, Printer, AlertCircle, Ticket } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from "@/Context/MyContextProvider";
import TicketCanvasView from '../events/Tickets/TicketCanvasView';
import CustomBtn from '../../utils/CustomBtn';
import CustomDrawer from '../../utils/CustomDrawer';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { TbBrandInstagramFilled, TbBrandYoutubeFilled } from 'react-icons/tb';

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
        <div className="p-3 pt-0">

            {ticketType?.type === 'individual' && (
                <div className="alert alert-info mb-3">
                    <p className="mb-0 text-success" style={{ fontSize: '12px' }}>
                        No <Ticket size={12} /> physical ticket needed! Download your Ticket & enjoy unlimited fun.
                    </p>
                    <p className="mt-2" style={{ fontSize: '12px' }}>
                        If you select single ticket, each attendee receives a personal QR code for entry,
                        and group tickets won&apos;t work.
                    </p>
                </div>
            )}

            {ticketType?.type === 'combine' && (
                <div className="alert alert-info mb-3" >
                    <p className="mb-0 text-success" style={{ fontSize: '12px' }}>
                        No <Ticket size={12} /> physical ticket needed! Download your Ticket & enjoy unlimited fun.
                    </p>
                    <p className="mt-2 text-white" style={{ fontSize: '12px' }}>
                        If you select group ticket, all attendees must arrive together and show the group ticket
                        at the venue for entry. Individual tickets will not work.
                    </p>

                </div>
            )}
            <div className="d-flex justify-content-center align-items-center gap-4 mt-3 mb-1">
                <a
                    href="https://www.youtube.com/@Get-Your-Ticket"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-white d-flex align-items-center"
                    style={{ gap: 6, marginRight: 10 }}
                >
                    <TbBrandYoutubeFilled style={{ fontSize: 20 }} />
                    <span className="small fw-semibold">YouTube</span>
                </a>
                <a
                    href="https://www.instagram.com/getyourticket.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-white d-flex align-items-center"
                    style={{ gap: 6 }}
                >
                    <TbBrandInstagramFilled style={{ fontSize: 20 }} />
                    <span className="small fw-semibold">Instagram</span>
                </a>
            </div>

            <CustomBtn
                buttonText="Generate Ticket"
                variant="primary"
                className="w-100 mt-3"
                wrapperClassName="w-100"
                HandleClick={handleGenerateTicket}
                loading={!isImageReady}
            />
        </div>
    );

    // Drawer content - Ticket display after user confirms
    const ticketContent = (
        <div className="p-3 pb-5 position-relative" style={{ minHeight: '100%' }}>
            {/* Loading state */}
            {!isImageReady && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '750px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Ticket Canvas */}
            {isImageReady && (
                <Row className="mb-5">
                    <Col lg="12">
                        {ticketType?.type === 'individual' ? (
                            ticketData?.bookings?.length > 0 && (
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    spaceBetween={10}
                                    slidesPerView={1}
                                    navigation
                                    pagination={{ clickable: true }}
                                    onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                                    className="ticket-swiper"
                                >
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
                                                <p className="text-center text-secondary mt-2">{index + 1} (I)</p>
                                            </Col>
                                        </SwiperSlide>
                                    ))}
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

            {/* Sticky Footer */}
            <div className="position-fixed bottom-0 start-0 w-100 bg-black border-top border-secondary p-3 z-3">
                {/* Footer info */}
                <div className="text-center text-secondary small mb-3">
                    {/* <p className="mb-0">No physical ticket needed! Download your Ticket & enjoy unlimited fun.</p> */}
                </div>
                {/* Download/Print Buttons */}
                <Row className="d-flex justify-content-center">
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
        </div>
    );

    return (
        <CustomDrawer
            title={ticketType?.type === 'individual' ? 'Individual Tickets' : 'Group Ticket'}
            showOffcanvas={show}
            setShowOffcanvas={onClose}
            hideIndicator={true}
            style={isMobile ? { height: "85vh" } : {}}
            bodyClassName="pt-0"

        >
            {showTicket ? ticketContent : noticeContent}
        </CustomDrawer>
    );
};

export default TicketDrawer;
