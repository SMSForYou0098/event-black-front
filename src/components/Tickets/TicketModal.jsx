import React, { useEffect, useState, useRef } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import TicketCanvasView from '../events/Tickets/TicketCanvasView';
import { FaInstagram, FaTimes, FaYoutube } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useMyContext } from "@/Context/MyContextProvider";
import { ArrowBigDownDash, Printer } from 'lucide-react';

import AmusementTicket from '../events/Tickets/AmusementTicket';
import TicketCanvasBatch from '../events/Tickets/TicketCanvasBatch';
import { api } from '@/lib/axiosInterceptor';
import IDCardDragAndDrop from '../../components/CustomComponents/IDCardDragAndDrop';
import CustomBtn from '../../utils/CustomBtn';

// Helper functions defined outside component to prevent re-creation
const RetriveName = (data) => {
    return data?.attendee?.Name ||
        data?.bookings?.[0]?.attendee?.Name ||
        data?.user?.name ||
        data?.bookings?.[0]?.user?.name ||
        'N/A';
};

const RetriveUser = (data) => {
    return data?.attendee ||
        data?.bookings?.[0]?.attendee ||
        data?.user ||
        data?.bookings?.[0]?.user ||
        data ||
        'N/A';
};

const RetriveNumber = (data) => {
    return data?.attendee?.Mo ||
        data?.bookings?.[0]?.attendee?.Mo ||
        data?.user?.number ||
        data?.bookings?.[0]?.user?.number ||
        'N/A';
};

const getTicketDisplayData = (ticketData, convertTo12HourFormat, formatDateRange) => {
    // Normalize primary data source (parent or first booking)
    const primaryData = ticketData?.ticket ? ticketData : (ticketData?.bookings?.[0] || {});
    const event = primaryData?.ticket?.event || {};
    const ticket = primaryData?.ticket || {};

    return {
        category: event.category || 'Category',
        title: event.name || 'Event Name',
        ticketName: ticket.name || 'Ticket Name',
        ticketBG: ticket.background_image || '',
        date: formatDateRange && formatDateRange(primaryData.booking_date || event.date_range) || 'Date Not Available',
        city: event.city || 'City',
        address: event.address || 'Address Not Specified',
        time: (convertTo12HourFormat && convertTo12HourFormat(event.start_time)) || 'Time Not Set',
        orderId: ticketData?.order_id || ticketData?.token || 'N/A',
        userNumber: RetriveNumber(ticketData),
        userName: RetriveName(ticketData),
        userData: RetriveUser(ticketData),
        userPhoto: primaryData?.attendee?.Photo || 'N/A'
    };
};

const TicketModal = (props) => {
    const { convertTo12HourFormat, isMobile } = useMyContext()
    const { showPrintButton, showTicketDetails, show, handleCloseModal, ticketType, ticketData, formatDateRange, isAccreditation, isIdCard, card_url, bgRequired, eventId } = props;
    const [savedLayout, setSavedLayout] = useState({});
    const [userPhoto, setUserPhoto] = useState();
    const [idCardBg, setIdCardBg] = useState();
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    // Refs for canvas download functionality
    const singleCanvasRef = useRef(null);
    const swiperCanvasRefs = useRef({});
    const category = ticketData?.ticket?.event?.category || (ticketData?.bookings && ticketData?.bookings[0]?.ticket?.event?.category)
    const isAmusementTicket = category === 18

    // Check if we should use special ticket components
    const useSpecialComponent = isIdCard || isAmusementTicket;

    const getSpecialTicketComponent = () => {
        if (isIdCard) return IDCardDragAndDrop;
        if (isAmusementTicket) return AmusementTicket;
        return null;
    };

    const SpecialTicket = useSpecialComponent ? getSpecialTicketComponent() : null;

    const fetchLayout = async () => {
        try {
            const response = await api.get(`layout/${eventId}`);

            const layoutData = response.data?.layout || {};
            setSavedLayout(layoutData);
        } catch (error) {
            console.error("❌ Error fetching layout:", error);
            setSavedLayout({});
        }
    };

    const fetchImage = async (bg, setBg) => {
        try {
            const response = await api.post(
                'get-image/retrive',
                { path: bg },
                { responseType: 'blob' }
            );
            const imageUrl = URL.createObjectURL(response.data);
            setBg(imageUrl);
        } catch (error) {
            console.error('Image fetch error:', error);
        }
    };

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!show) {
            setIsCanvasReady(false);
            setActiveSlideIndex(0);
        }
    }, [show]);

    useEffect(() => {
        if (show && isIdCard) {
            if (ticketData?.Photo) {
                fetchImage(ticketData.Photo, setUserPhoto);
            }

            if (bgRequired && card_url) {
                fetchImage(card_url, setIdCardBg);
                fetchLayout()
            }
        }
    }, [show, ticketData, card_url, bgRequired, isIdCard]);

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

    // Render regular ticket canvas (uses TicketCanvasView)
    const renderTicketCanvas = (ticketProps, ref, onReady) => (
        <TicketCanvasView
            ref={ref}
            showDetails={ticketProps.showDetails}
            ticketData={ticketProps.ticketData}
            ticketNumber={ticketProps.ticketNumber}
            ticketLabel={ticketProps.ticketLabel}
            onReady={onReady}
        />
    );

    return (
        <Modal show={show} onHide={() => handleCloseModal()} size={ticketType?.type === 'zip' ? 'xl' : ''}>
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
                                        {ticketData.bookings.map((item, index) => {
                                            const displayData = getTicketDisplayData(item, convertTo12HourFormat, formatDateRange);
                                            return (
                                                <SwiperSlide className="card-slide" key={index}>
                                                    <Col lg={12} md={12} xl={12}>
                                                        <div>
                                                            {useSpecialComponent && SpecialTicket ? (
                                                                <SpecialTicket
                                                                    showDetails={showTicketDetails}
                                                                    showPrintButton={showPrintButton}
                                                                    category={displayData.category}
                                                                    title={displayData.title}
                                                                    number={displayData.userNumber}
                                                                    user={displayData.userData}
                                                                    ticketBG={displayData.ticketBG}
                                                                    ticketName={displayData.ticketName}
                                                                    date={displayData.date}
                                                                    city={displayData.city}
                                                                    address={displayData.address}
                                                                    time={displayData.time}
                                                                    OrderId={displayData.orderId}
                                                                    quantity={1}
                                                                    idCardBg={idCardBg}
                                                                    bgRequired={bgRequired}
                                                                    ticketNumber={index + 1}
                                                                />
                                                            ) : (
                                                                renderTicketCanvas({
                                                                    showDetails: showTicketDetails,
                                                                    ticketData: item,
                                                                    ticketNumber: index + 1,
                                                                    ticketLabel: "(I)"
                                                                }, (el) => { swiperCanvasRefs.current[index] = el; }, () => setIsCanvasReady(true))
                                                            )}
                                                        </div>
                                                        <p className="text-center text-secondary">{index + 1} (I)</p>
                                                    </Col>
                                                </SwiperSlide>
                                            );
                                        })}
                                    </div>
                                </Swiper>
                            )
                        ) : ticketType?.type === 'combine' ? (
                            <div style={{ height: "auto" }}>
                                <Col lg={12} md={12} xl={12}>
                                    <div>
                                        {(() => {
                                            const displayData = getTicketDisplayData(ticketData, convertTo12HourFormat, formatDateRange);
                                            return useSpecialComponent && SpecialTicket ? (
                                                <SpecialTicket
                                                    userPhoto={userPhoto}
                                                    showDetails={showTicketDetails}
                                                    showPrintButton={showPrintButton}
                                                    number={displayData.userNumber}
                                                    userName={displayData.userName}
                                                    user={displayData.userData}
                                                    photo={displayData.userPhoto}
                                                    ticketName={displayData.ticketName}
                                                    category={displayData.category}
                                                    ticketBG={displayData.ticketBG}
                                                    title={displayData.title}
                                                    date={displayData.date}
                                                    city={displayData.city}
                                                    address={displayData.address}
                                                    time={displayData.time}
                                                    OrderId={displayData.orderId}
                                                    orderId={displayData.orderId}
                                                    quantity={ticketData?.bookings?.length || 1}
                                                    finalImage={idCardBg}
                                                    {...(savedLayout ? { savedLayout } : {})}
                                                    userData={displayData.userData}
                                                    userImage={userPhoto}
                                                    bgRequired={bgRequired}
                                                    isEdit={false}
                                                    download={true}
                                                    print={true}
                                                    isCircle={savedLayout?.user_photo?.isCircle || false}
                                                    handleCloseModal={handleCloseModal}
                                                />
                                            ) : (
                                                renderTicketCanvas({
                                                    showDetails: true,
                                                    ticketData: ticketData,
                                                    ticketNumber: 1,
                                                    ticketLabel: "(G)"
                                                }, singleCanvasRef, () => setIsCanvasReady(true))
                                            );
                                        })()}
                                    </div>

                                    <p className="text-center text-secondary">(G)</p>
                                </Col>
                            </div>
                        ) : ticketType?.type === 'zip' ? (
                            <TicketCanvasBatch
                                isMobile={isMobile}
                                ticketData={ticketData}
                                formatDateRange={formatDateRange}
                                convertTo12HourFormat={convertTo12HourFormat}
                            />
                        ) : null}
                    </Col>
                </Row>

                {/* Download/Print Buttons - Only show for regular tickets */}
                {
                    !useSpecialComponent && ticketType?.type !== 'zip' && (
                        <Row className="d-flex justify-content-center mt-3">
                            <Col xs={12} sm={6} className="d-flex justify-content-center gap-2">
                                <CustomBtn
                                    buttonText={"Download"}
                                    icon={<ArrowBigDownDash size={14} />}
                                    loading={!isCanvasReady}
                                    className="flex-grow-1 btn-sm"
                                    HandleClick={handleDownload}
                                    disabled={!isCanvasReady}
                                />
                                {showPrintButton && (
                                    <button
                                        className="btn btn-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handlePrint}
                                        disabled={!isCanvasReady}
                                    >
                                        <span>Print</span>
                                        <Printer size={18} />
                                    </button>
                                )}
                            </Col>
                        </Row>
                    )
                }

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