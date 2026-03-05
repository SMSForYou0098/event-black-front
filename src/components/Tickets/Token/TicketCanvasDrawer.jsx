import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { AlertCircle, ArrowBigDownDash } from "lucide-react";
import CustomDrawer from "@/utils/CustomDrawer";
import CustomBtn from "@/utils/CustomBtn";
import TicketCanvasView from "@/components/events/Tickets/TicketCanvasView";
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
            title={drawerType === "combine" ? "Group Ticket" : drawerType === "single" ? "" : "Individual Tickets"}
            bodyClassName="p-0"
            hideIndicator={isMobile ? false : true}
        >
            <div className="d-flex flex-column h-100" style={{ flex: 1, minHeight: 0 }}>
                {!showTicketInDrawer ? (
                    <>
                        {/* Scrollable Content Area */}
                        <div className="flex-grow-1 overflow-auto p-3">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={24} className="text-warning" />
                                <h6 className="mb-0 fw-bold">Important Information</h6>
                            </div>

                            {drawerType === "combine" && (
                                <div className="alert alert-info mb-3 text-start">
                                    <h6 className="alert-heading mb-2">Group Ticket</h6>
                                    <p className="mb-0">
                                        If you select group ticket, all attendees must arrive together and show the group ticket
                                        at the venue for entry. Individual tickets will not work.
                                    </p>
                                </div>
                            )}

                            {drawerType === "single" && (
                                <div className="alert alert-success mb-3 text-start">
                                    <p className="mb-0">
                                        Your ticket is ready to download. Use the QR code at the entry gate for quick access.
                                    </p>
                                </div>
                            )}

                            {drawerType === "download" && (
                                <div className="alert alert-warning mb-3 text-start">
                                    <h6 className="alert-heading mb-2">Single Ticket</h6>
                                    <p className="mb-0">
                                        If you select single ticket, each attendee receives a personal QR code for entry,
                                        and group tickets won't work.
                                    </p>
                                </div>
                            )}
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
                        <div className="flex-grow-1 overflow-auto p-3 bg-black">
                            <div className="d-flex align-items-center justify-content-center h-100">
                                {drawerType === "combine" || drawerType === "single" ? (
                                    <div className="text-center w-100">
                                        {imageLoaded ? (
                                            <div className="d-flex flex-column align-items-center">
                                                <TicketCanvasView
                                                    ref={singleCanvasRef}
                                                    showDetails={true}
                                                    preloadedImage={cardImageUrl}
                                                    ticketNumber={drawerType === "single" ? 1 : undefined}
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
                                        ) : (
                                            <div className="text-center py-5">
                                                <Image src={imgLoader} alt="Loading..." width={100} height={100} unoptimized />
                                                <p className="text-white mt-2">Loading image...</p>
                                            </div>
                                        )}
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
                                                        {imageLoaded ? (
                                                            <TicketCanvasView
                                                                ref={(el) => {
                                                                    swiperCanvasRefs.current[index] = el;
                                                                }}
                                                                showDetails={true}
                                                                preloadedImage={cardImageUrl}
                                                                ticketNumber={index + 1}
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
                                                        ) : (
                                                            <div className="text-center py-5">
                                                                <Image src={imgLoader} alt="Loading..." width={100} height={100} unoptimized />
                                                                <p className="text-white mt-2">Loading image...</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-3 bg-dark border-top">
                            <CustomBtn
                                buttonText={"Download"}
                                icon={<ArrowBigDownDash size={18} />}
                                loading={!isCanvasReady}
                                className="w-100"
                                HandleClick={() => {
                                    if (drawerType === "combine" || drawerType === "single") {
                                        singleCanvasRef.current?.download();
                                    } else {
                                        swiperCanvasRefs.current[activeSlideIndex]?.download();
                                    }
                                }}
                                disabled={!isCanvasReady}
                            />
                        </div>
                    </>
                )}
            </div>
        </CustomDrawer>
    );
};

export default TicketCanvasDrawer;
