import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import TicketCanvasView from '../events/Tickets/TicketCanvasView';
import { FaInstagram, FaTimes, FaYoutube } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useMyContext } from "@/Context/MyContextProvider";
import { ArrowBigDownDash, Printer } from 'lucide-react';
import CustomBtn from '../../utils/CustomBtn';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';

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

const TicketModal = (props) => {
    const { convertTo12HourFormat, isMobile } = useMyContext()
    const { showPrintButton, showTicketDetails, show, handleCloseModal, ticketType, ticketData, formatDateRange } = props;
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Refs for canvas download functionality
    const singleCanvasRef = useRef(null);
    const swiperCanvasRefs = useRef({});

    // Get ticket background URL from first booking (all tickets share the same background)
    const ticketBgUrl = ticketData?.ticket?.background_image || 
                        ticketData?.bookings?.[0]?.ticket?.background_image || '';

    // Pre-fetch and cache the ticket background image using TanStack Query
    // This prevents multiple API calls when rendering multiple individual tickets
    const { data: cachedBgImage, isLoading: isBgLoading } = useQuery({
        queryKey: ['ticket-modal-bg', ticketBgUrl],
        queryFn: () => fetchTicketImage(ticketBgUrl),
        enabled: show && !!ticketBgUrl,
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1,
    });

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!show) {
            setIsCanvasReady(false);
            setActiveSlideIndex(0);
        }
    }, [show]);

    // Handle download click
    const handleDownload = () => {
        if (ticketType?.type === 'individual') {
            swiperCanvasRefs.current[activeSlideIndex]?.download();
        } else {
            singleCanvasRef.current?.download();
        }
    };

    // Handle print click
    const handlePrint = () => {
        if (ticketType?.type === 'individual') {
            swiperCanvasRefs.current[activeSlideIndex]?.print();
        } else {
            singleCanvasRef.current?.print();
        }
    };

    return (
        <Modal show={show} onHide={() => handleCloseModal()}>
            <Modal.Body>
                <button
                    type="button"
                    onClick={() => handleCloseModal()}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        zIndex: '99999',
                        fontSize: '24px',
                        cursor: 'pointer',
                    }}
                >
                    <FaTimes />
                </button>
                <Row>
                    <Col lg="12">
                        {/* Show loading spinner while fetching background image */}
                        {isBgLoading && (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}

                        {/* Only render tickets when background is ready */}
                        {!isBgLoading && ticketType?.type === 'individual' ? (
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
                        ) : !isBgLoading && ticketType?.type === 'combine' ? (
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

                {/* Download/Print Buttons */}
                <Row className="d-flex justify-content-center mt-3">
                    <Col xs={12} sm={6} className="d-flex justify-content-center gap-2">
                        <CustomBtn
                            buttonText={"Download"}
                            icon={<ArrowBigDownDash size={14} />}
                            loading={!isCanvasReady || isBgLoading}
                            className="flex-grow-1 btn-sm"
                            HandleClick={handleDownload}
                            disabled={!isCanvasReady || isBgLoading}
                        />
                        {showPrintButton && (
                            <button
                                className="btn btn-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                onClick={handlePrint}
                                disabled={!isCanvasReady || isBgLoading}
                            >
                                <span>Print</span>
                                <Printer size={18} />
                            </button>
                        )}
                    </Col>
                </Row>

                <Modal.Footer>
                    <div className="text-center text-secondary small p-0">
                        <p>No physical ticket needed! Download your Ticket & enjoy unlimited fun.</p>
                        <span className="fw-semibold">
                            Watch the video to get entry without any hassle
                            <a
                                href="https://www.youtube.com/watch?v=QIVkT5Iie3c"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-underline ms-1 me-2"
                            >
                                <FaYoutube className="me-1" />
                            </a>
                            &
                            <a
                                href="https://www.instagram.com/getyourticket.in/p/DQZXxmHCNYU/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-underline ms-2"
                            >
                                <FaInstagram className="me-1" />
                            </a>
                        </span>
                    </div>
                </Modal.Footer>
            </Modal.Body >
        </Modal >
    );
}

export default TicketModal;