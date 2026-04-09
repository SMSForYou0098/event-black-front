import React from "react";
import Image from "next/image";
import { Row, Col } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import { useQuery } from "@tanstack/react-query";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AlertCircle, ArrowBigDownDash, Ticket } from "lucide-react";
import CustomDrawer from "@/utils/CustomDrawer";
import CustomBtn from "@/utils/CustomBtn";
import TicketCanvasView from "@/components/events/Tickets/TicketCanvasView";
import MobileTwoButtonFooter from "@/utils/MobileTwoButtonFooter";
import { TbBrandInstagramFilled, TbBrandYoutubeFilled } from 'react-icons/tb';
import imgLoader from "../../../assets/event/stock/loader111.gif";
import { YOUTUBE_LINK, INSTAGRAM_LINK } from "@/utils/consts";
import { api } from "@/lib/axiosInterceptor";

const fetchTicketImage = async (path) => {
    if (!path) return null;
    const response = await api.post(
        "get-image/retrive",
        { path },
        { responseType: "blob" }
    );
    return URL.createObjectURL(response.data);
};

const TicketCanvasDrawer = ({
    showDrawer,
    setShowDrawer,
    setShowTicketInDrawer,
    drawerType,
    showTicketInDrawer,
    handleGenerateTicket,
    imageLoaded,
    singleCanvasRef,
    cardImageUrl,
    setIsCanvasReady,
    ticketData,
    orderId,
    swiperCanvasRefs,
    setActiveSlideIndex,
    activeSlideIndex,
    isCanvasReady,
    isMobile,
}) => {
    const handleCanvasReady = React.useCallback(() => {
        setIsCanvasReady(true);
    }, [setIsCanvasReady]);

    const normalizedBookings = Array.isArray(ticketData?.bookings) && ticketData.bookings.length > 0
        ? ticketData.bookings
        : (Array.isArray(ticketData?.data) ? ticketData.data : []);

    const firstBooking = normalizedBookings[0] || {};
    const mergedTicket = firstBooking?.ticket || ticketData?.ticket || {};
    const mergedEvent = mergedTicket?.event || ticketData?.event || {};
    const mergedUser = firstBooking?.user || firstBooking?.attendee || ticketData?.user || {};
    const defaultBg = mergedTicket?.background_image || ticketData?.card_url || "";
    const ticketBgUrl = defaultBg;

    // Match summary page behavior: prefetch background immediately on drawer open.
    const {
        data: cachedBgImage,
        isLoading: isBgLoading,
        isError: isBgError,
    } = useQuery({
        queryKey: ["token-ticket-drawer-bg", ticketBgUrl],
        queryFn: () => fetchTicketImage(ticketBgUrl),
        enabled: !!showDrawer && !!ticketBgUrl,
        staleTime: 1000 * 60 * 30,
        retry: 1,
    });

    const drawerPreloadedImage = cardImageUrl || cachedBgImage || undefined;
    const isDrawerImageReady = !isBgLoading || isBgError || !ticketBgUrl;

    const combinedCanvasData = {
        ...ticketData,
        ticket: {
            ...mergedTicket,
            event: mergedEvent,
            background_image: mergedTicket?.background_image || defaultBg,
        },
        event: mergedEvent,
        user: mergedUser,
        bookings: normalizedBookings,
        booking_date: firstBooking?.booking_date || ticketData?.booking_date,
        seat_name:
            firstBooking?.seat_name ||
            firstBooking?.event_seat_status?.seat_name ||
            ticketData?.seat_name,
        order_id:
            drawerType === "single"
                ? (firstBooking?.token || ticketData?.token || orderId)
                : (ticketData?.order_id || orderId),
    };

    return (
        <CustomDrawer
            showOffcanvas={showDrawer}
            setShowOffcanvas={(val) => {
                setShowDrawer(val);
                if (!val) setShowTicketInDrawer(false);
            }}
            title={drawerType === "combine" ? "Group Ticket" : drawerType === "single" ? "Single Ticket" : "Single Tickets"}
            bodyClassName="p-0"
            hideIndicator={isMobile ? false : true}
            style={isMobile ? { height: "100vh" } : { height: "100vh" }}
        >
            <div className="d-flex flex-column" style={{ flex: 1, minHeight: 0 }}>
                {!showTicketInDrawer ? (
                    <>
                        {/* Scrollable Content Area */}
                        <div className="flex-grow-1 overflow-auto p-3">
                            {/* <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={24} className="text-warning" />
                                <h6 className="mb-0 fw-bold">Important Information</h6>
                            </div> */}

                            {drawerType === "combine" && (
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

                            {drawerType === "single" && (
                                <div className="alert alert-info mb-3">
                                    <ul className="mt-2 ps-3" style={{ fontSize: "12px" }}>
                                        <li>
                                            To ensure a smooth and hassle-free entry, please scan your ticket before arriving at the venue.
                                        </li>
                                        <li>
                                            Kindly watch the video guide for step-by-step instructions on how to scan your ticket easily.
                                        </li>
                                        <li>
                                            Thank you, and we look forward to welcoming you!
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {drawerType === "download" && (
                                <div className="alert alert-info mb-3 text-start">
                                    <h6 className="alert-heading mb-2">Single Ticket</h6>
                                    <p className="mb-0">
                                        If you select single ticket, each attendee receives a personal QR code for entry,
                                        and group tickets won&apos;t work.
                                    </p>
                                </div>
                            )}

                            <div className="d-flex justify-content-center align-items-center gap-4 mt-3 mb-1">
                                <a
                                    href={YOUTUBE_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none text-white d-flex align-items-center gap-2"
                                >
                                    <TbBrandYoutubeFilled style={{ fontSize: 22 }} />
                                    <span className="small fw-semibold">YouTube</span>
                                </a>
                                <a
                                    href={INSTAGRAM_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none text-white d-flex align-items-center gap-2"
                                >
                                    <TbBrandInstagramFilled style={{ fontSize: 22 }} />
                                    <span className="small fw-semibold">Instagram</span>
                                </a>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-3 bg-dark border-top">
                            <CustomBtn
                                buttonText="Generate Ticket"
                                variant="primary"
                                className="w-100"
                                wrapperClassName="w-100"
                                HandleClick={handleGenerateTicket}
                                loading={!isDrawerImageReady}
                            />
                        </div>
                    </>
                ) : (
                    // Ticket Display in Drawer
                    <>
                        <div className="flex-grow-1 p-3 bg-black" style={{ minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                            {/* Loading state handled by imageLoaded */}
                            {!imageLoaded && (
                                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            {imageLoaded && (
                                <Row className="justify-content-center">
                                    <Col lg={12}>
                                        {drawerType === "combine" || drawerType === "single" ? (
                                            <div className="text-center w-100">
                                                <div className="d-flex flex-column align-items-center">
                                                    <TicketCanvasView
                                                        ref={singleCanvasRef}
                                                        showDetails={false}
                                                        preloadedImage={drawerPreloadedImage}
                                                        ticketNumber={drawerType === "single" ? 1 : undefined}
                                                        ticketLabel={drawerType === "single" ? "(I)" : "(G)"}
                                                        onReady={handleCanvasReady}
                                                        ticketData={combinedCanvasData}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            normalizedBookings.length > 0 && (
                                                <Swiper
                                                    modules={[Navigation, Pagination]}
                                                    spaceBetween={20}
                                                    slidesPerView={1}
                                                    navigation
                                                    pagination={{ clickable: true }}
                                                    onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                                                    className="w-100 py-4"
                                                >
                                                    {normalizedBookings.map((item, index) => (
                                                        <SwiperSlide key={item?.token || item?.id || index}>
                                                            <div className="text-center w-100 d-flex justify-content-center">
                                                                <TicketCanvasView
                                                                    ref={(el) => {
                                                                        swiperCanvasRefs.current[index] = el;
                                                                    }}
                                                                    showDetails={false}
                                                                    preloadedImage={drawerPreloadedImage}
                                                                    ticketNumber={index + 1}
                                                                    ticketLabel="(I)"
                                                                    onReady={handleCanvasReady}
                                                                    ticketData={{
                                                                        ...item,
                                                                        ticket: item?.ticket || mergedTicket,
                                                                        event: item?.ticket?.event || mergedEvent,
                                                                        user: item?.user || item?.attendee || mergedUser,
                                                                        attendee: item?.attendee || null,
                                                                        seat_name: item?.seat_name || item?.event_seat_status?.seat_name,
                                                                        order_id: item?.token || item?.order_id || orderId,
                                                                        booking_type: ticketData?.booking_type || "individual",
                                                                        booking_date: item?.booking_date,
                                                                    }}
                                                                />
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>
                                            )
                                        )}
                                    </Col>
                                </Row>
                            )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="bg-dark border-top">
                            <MobileTwoButtonFooter
                                leftButton={
                                    <CustomBtn
                                        buttonText="Download"
                                        icon={<ArrowBigDownDash size={14} />}
                                        loading={!isCanvasReady}
                                        className="w-100 btn-sm"
                                        HandleClick={() => {
                                            if (drawerType === "combine" || drawerType === "single") {
                                                singleCanvasRef.current?.download();
                                            } else {
                                                swiperCanvasRefs.current[activeSlideIndex]?.download();
                                            }
                                        }}
                                        disabled={!isCanvasReady}
                                        size="sm"
                                    />
                                }
                                rightButton={null}
                            />
                        </div>
                    </>
                )}
            </div>
        </CustomDrawer>
    );
};

export default TicketCanvasDrawer;
