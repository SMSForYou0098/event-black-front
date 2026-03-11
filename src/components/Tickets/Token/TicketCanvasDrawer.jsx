import React from "react";
import Image from "next/image";
import { Row, Col } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
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
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-3 bg-dark border-top">
                            <CustomBtn
                                buttonText="Generate Ticket"
                                variant="primary"
                                className="w-100"
                                wrapperClassName="w-100"
                                HandleClick={handleGenerateTicket}
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
                                                        preloadedImage={cardImageUrl}
                                                        ticketNumber={drawerType === "single" ? 1 : undefined}
                                                        ticketLabel={drawerType === "single" ? "(I)" : "(G)"}
                                                        onReady={() => setIsCanvasReady(true)}
                                                        ticketData={{
                                                            ticket: {
                                                                name: ticketData?.ticket?.name || "Event Ticket",
                                                                price: ticketData?.ticket?.price,
                                                                currency: ticketData?.ticket?.currency,
                                                                background_image: cardImageUrl,
                                                                event: {
                                                                    name: ticketData?.event?.name,
                                                                    date_range: ticketData?.event?.date_range,
                                                                    start_time: ticketData?.event?.start_time,
                                                                    entry_time: ticketData?.event?.entry_time,
                                                                    address: ticketData?.event?.address || "Venue not specified",
                                                                },
                                                            },
                                                            user: {
                                                                name: ticketData?.user?.name || "Guest",
                                                                number: ticketData?.user?.number || "N/A",
                                                            },
                                                            order_id:
                                                                drawerType === "single" && ticketData?.data?.[0]?.token
                                                                    ? ticketData.data[0].token
                                                                    : orderId,
                                                            booking_type: ticketData?.booking_type,
                                                            booking_date: ticketData?.data?.[0]?.booking_date,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            ticketData?.data?.length > 0 && (
                                                <Swiper
                                                    modules={[Navigation, Pagination]}
                                                    spaceBetween={20}
                                                    slidesPerView={1}
                                                    navigation
                                                    pagination={{ clickable: true }}
                                                    onSlideChange={(swiper) => setActiveSlideIndex(swiper.activeIndex)}
                                                    className="w-100 py-4"
                                                >
                                                    {ticketData?.data?.map((item, index) => (
                                                        <SwiperSlide key={item.token}>
                                                            <div className="text-center w-100 d-flex justify-content-center">
                                                                <TicketCanvasView
                                                                    ref={(el) => {
                                                                        swiperCanvasRefs.current[index] = el;
                                                                    }}
                                                                    showDetails={true}
                                                                    preloadedImage={cardImageUrl}
                                                                    ticketNumber={index + 1}
                                                                    ticketLabel="(I)"
                                                                    onReady={() => setIsCanvasReady(true)}
                                                                    ticketData={{
                                                                        ticket: {
                                                                            name: ticketData?.ticket?.name || "Event Ticket",
                                                                            price: ticketData?.ticket?.price,
                                                                            currency: ticketData?.ticket?.currency,
                                                                            background_image: cardImageUrl,
                                                                            event: {
                                                                                name: ticketData?.event?.name,
                                                                                date_range: ticketData?.event?.date_range,
                                                                                start_time: ticketData?.event?.start_time,
                                                                                entry_time: ticketData?.event?.entry_time,
                                                                                address: ticketData?.event?.address || "Venue not specified",
                                                                            },
                                                                        },
                                                                        user: {
                                                                            name: ticketData?.user?.name || "Guest",
                                                                            number: ticketData?.user?.number || "N/A",
                                                                        },
                                                                        attendee: item?.attendee || null,
                                                                        order_id: item.token,
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
