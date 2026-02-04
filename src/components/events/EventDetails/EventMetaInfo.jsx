import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Alert } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import Image from "next/image";
import BookingFooterLayout from "../../../utils/BookingFooterLayout";
import CustomBtn from "../../../utils/CustomBtn";
import CustomDrawer from "../../../utils/CustomDrawer";
import { CustomTooltip } from "../../../utils/CustomTooltip";
import CustomBadge from "../../../utils/ProfileUtils/getBadgeClass";
import { MobileOnly, TabletAndDesktop } from "@/utils/ResponsiveRenderer";

const EventMetaInfo = ({ metaInfo, event_key, eventData }) => {
  const { setShowHeaderBookBtn, isMobile, formatDateDDMMYYYY } = useMyContext();
  const bookBtnRef = useRef(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const router = useRouter();
  const isHouseFull = eventData?.eventControls?.house_full;
  const isSoldOut = eventData?.eventControls?.is_sold_out;
  const isPostponed = eventData?.eventControls?.is_postponed;
  const isCancelled = eventData?.eventControls?.is_cancelled;
  const expectedDate = eventData?.eventControls?.expected_date;

  // Determine the event status and button text
  // Only house full has a stamp image, others just show text
  const getEventStatus = () => {
    if (eventData?.total_tickets === 0) return {
      disabled: true,
      text: 'No Tickets Available',
      showStamp: false,
      stampImage: null,
      message: 'No tickets are available for this event.'
    };
    if (eventData?.active_tickets === 0) return {
      disabled: true,
      text: 'No Active Tickets',
      showStamp: false,
      stampImage: null,
      message: 'No tickets are active for this event.'
    };
    if (isCancelled) return {
      disabled: true,
      text: 'Cancelled',
      showStamp: false,
      stampImage: null,
      message: 'This event has been cancelled'
      //  Refunds will be processed if applicable.'
    };
    if (isPostponed) return {
      disabled: true,
      text: 'Postponed',
      showStamp: false,
      stampImage: null,
      message: 'This event has been postponed.'
    };
    if (isSoldOut) return {
      disabled: true,
      text: 'Sold Out',
      showStamp: false,
      stampImage: null,
      message: 'All tickets for this event have been sold out.'
    };
    if (isHouseFull) return {
      disabled: true,
      text: 'Sold Out',
      showStamp: true,
      stampImage: '/assets/images/hfull.webp',
      message: 'All tickets for this event have been sold out.'
    };
    // Check if event has ended
    if (eventData?.date_range) {
      const dates = eventData.date_range.split(',');
      const lastDate = dates[dates.length - 1];
      const eventEndDate = new Date(lastDate);
      eventEndDate.setHours(23, 59, 59, 999);

      if (new Date() > eventEndDate) {
        return {
          disabled: true,
          text: 'Event has finished',
          showStamp: false,
          stampImage: null,
          message: 'The event has finished.'
        };
      }
    }

    return { disabled: false, text: 'Book', showStamp: false, stampImage: null, message: null };
  };

  const eventStatus = getEventStatus();

  const handleContinue = () => {
    // Continue logic here (e.g., navigate to checkout)
    setShowOffcanvas(false);
    router.push(`/events/cart/${event_key}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (bookBtnRef.current && !isMobile) {
        const rect = bookBtnRef.current.getBoundingClientRect();
        setShowHeaderBookBtn(rect.top < 0);
      }
    };

    if (!isMobile) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      setShowHeaderBookBtn(false); // Reset when component unmounts
    };
  }, [setShowHeaderBookBtn, isMobile]);

  const handleBookNow = () => {
    if (eventStatus.disabled) return; // Prevent booking if event is not available

    // Check if booking_notice exists and is not empty/blank
    if (eventData?.booking_notice && eventData?.booking_notice?.trim() !== '') {
      setShowOffcanvas(true);
    } else {
      handleContinue();
    }
  };

  return (
    <>
      <div className="product-meta-wrapper mt-2">
        <div className="event-meta-compact d-flex flex-wrap gap-3 mt-3">
          {metaInfo?.map((info, i) => {
            // Apply a colored badge only if event type is 'daily'
            const isDailyEvent =
              info.icon === "fa-regular fa-calendar" && info.value?.toLowerCase() === "daily";
            const isSeasonalEvent =
              info.icon === "fa-regular fa-calendar" && info.value?.toLowerCase() === "seasonal";

            const content = (
              <>
                <span className="me-3">
                  <i className={info.icon}></i>
                </span>
                <span
                  className={`${info.valueClass} ${isDailyEvent ? "bg-warning text-dark px-2 py-1 rounded-pill" : ""} ${isSeasonalEvent ? "bg-info text-dark px-2 py-1 rounded-pill" : ""}`}

                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {info.value}
                </span>
              </>
            );

            return (
              <div
                key={i}
                className="cursor-pointer custom-dark-content-bg d-flex align-items-start px-3 py-2 rounded-3 border"
              >
                <CustomTooltip text={info.description || ''} placement="bottom">
                  {info.link ? (
                    <a
                      href={info.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none text-reset"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </CustomTooltip>
              </div>
            );
          })}

        </div>

        {/* Desktop Button - only show on non-mobile */}
        <div className="d-none d-sm-block">
          <Row className="mt-4 mb-3">
            {!eventStatus.disabled &&
              <Col
                sm="12"
                className="d-flex justify-content-between align-items-center border-dashed rounded-3 position-relative"
              >
                {/* Event Status Stamp for Desktop */}
                {eventStatus.showStamp && (
                  <Image
                    src={eventStatus.stampImage}
                    alt={eventStatus.text}
                    width={100}
                    height={100}
                    className="position-absolute top-50 end-0 translate-middle-y z-3"
                    style={{
                      transform: "translateY(-50%) rotate(-15deg)",
                      marginRight: "120px",
                      pointerEvents: "none",
                      objectFit: "contain"
                    }}
                  />
                )}


                <h4 className="price mt-3 mb-3 d-flex gap-2 align-items-center flex-wrap">

                  <div className="text-primary fs-5">Pricing :</div>
                  <span className="fw-bold d-flex align-items-center gap-2 fs-5">
                    {(() => {
                      let displayPrice = 0;
                      let showSaleBadge = false;
                      // If event is on sale and has a sale price
                      if (eventData?.on_sale && eventData?.lowest_sale_price) {
                        displayPrice = Number(eventData.lowest_sale_price);
                        showSaleBadge = true;
                      }
                      // Otherwise use regular lowest ticket price

                      else if (eventData?.lowest_ticket_price) {
                        displayPrice = Number(eventData.lowest_ticket_price);
                      }

                      // Show "Free" if price is 0 or null
                      if (!displayPrice || displayPrice === 0) return <span>Free</span>;

                      return (
                        <>
                          ₹{displayPrice} <span className="fw-normal">Onwards</span>
                          {showSaleBadge && <CustomBadge variant="outline-primary" className="ms-2">On Sale</CustomBadge>}
                        </>
                      );
                    })()}
                  </span>
                </h4>

                {/* Status Message Alert */}


                <div ref={bookBtnRef} className="d-inline-block">
                  <CustomBtn
                    size="sm"
                    className="fw-bold px-5 py-2 d-flex align-items-center rounded-3"
                    HandleClick={handleBookNow}
                    disabled={eventStatus.disabled}
                    style={{
                      height: "3rem",
                      fontSize: "16px",
                      opacity: eventStatus.disabled ? 0.6 : 1,
                      cursor: eventStatus.disabled ? "not-allowed" : "pointer"
                    }}
                    buttonText={eventStatus.text}
                    icon={!eventStatus.disabled ? <i className="fa-solid fa-arrow-right"></i> : null}
                  />
                </div>
              </Col>
            }
          </Row>
        </div>
      </div>
      {eventStatus.message && (
        <Row>
          <Col>
            <Alert variant={isCancelled ? 'danger' : isPostponed ? 'warning' : 'info'} className="p-0 m-0">
              <i className={`fa-solid ${isCancelled ? 'fa-circle-xmark' : isPostponed ? 'fa-clock' : 'fa-circle-info'} me-2`}></i>
              {eventStatus.message}
            </Alert>
          </Col>
          <Col>
            <Button
              size="sm"
              className="fw-bold px-5 py-2 d-flex align-items-center rounded-3"
              onClick={() => router.push('/events')}
            >
              View More Events
            </Button>
          </Col>
        </Row>
      )}
      {isPostponed && expectedDate && (
        <div className="text-warning mt-2 fw-medium">
          {/* <i className="fa-solid fa-clock me-2"></i> */}
          {/* The event is expected to be held on {new Date(expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} */}
          The event is expected to be held on {formatDateDDMMYYYY(expectedDate)}
        </div>
      )}
      {/* Mobile Sticky Button */}
      <div className="d-block d-sm-none">
        {/* Status Message Alert for Mobile */}
        {eventStatus.message && (
          <div className="px-3 pb-3">
            <Alert variant={isCancelled ? 'danger' : isPostponed ? 'warning' : 'info'} className="mb-0">
              <i className={`fa-solid ${isCancelled ? 'fa-circle-xmark' : isPostponed ? 'fa-clock' : 'fa-circle-info'} me-2`}></i>
              {eventStatus.message}
            </Alert>
          </div>
        )}

        <BookingFooterLayout
          left={
            <span className="p-0 m-0 position-relative">
              {/* Event Status Stamp for Mobile */}
              {eventStatus.showStamp && (
                <Image
                  src={eventStatus.stampImage}
                  alt={eventStatus.text}
                  width={60}
                  height={60}
                  className="position-absolute"
                  style={{
                    transform: "rotate(-15deg) translate(-50%, -80%)",
                    left: "50%",
                    top: "0",
                    pointerEvents: "none",
                    objectFit: "contain",
                    zIndex: 10
                  }}
                />
              )}
              Starts From{" "}
              <h5 className="fw-bold">
                ₹
                {eventData?.on_sale ? eventData?.lowest_sale_price : eventData?.lowest_ticket_price}
              </h5>
            </span>
          }
          right={
            <CustomBtn
              HandleClick={handleBookNow}
              disabled={eventStatus.disabled}
              size="sm"
              className="btn btn-primary btn-lg px-3"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                opacity: eventStatus.disabled ? 0.6 : 1,
                cursor: eventStatus.disabled ? "not-allowed" : "pointer"
              }}
              buttonText={eventStatus.text}
            // icon={!eventStatus.disabled ? <i className="fa-solid fa-arrow-right"></i> : null}
            />
          }
        />
      </div>

      {/* drawer */}
      <CustomDrawer title="" showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}>
        <div style={{ paddingBottom: '80px' }}>
          <p className="p-0 m-0" dangerouslySetInnerHTML={{ __html: eventData?.booking_notice }} />
          <TabletAndDesktop>
            <div className="mt-0 d-flex justify-content-end">
              <CustomBtn size="sm" variant="primary" buttonText="Continue" HandleClick={handleContinue} className="position-relative float-end" />
            </div>
          </TabletAndDesktop>
        </div>

        {/* Sticky Button for Mobile */}
        <MobileOnly>
          <div
            className="position-fixed bottom-0 start-0 w-100 p-3"
            style={{
              zIndex: 1050,
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              backgroundColor: "rgba(var(--bs-body-bg-rgb), 0.8)",
              borderTop: "1px solid var(--bs-border-color)"
            }}
          >
            <CustomBtn
              wrapperClassName="w-100"
              size="sm"
              variant="primary"
              buttonText="Continue"
              HandleClick={handleContinue}
              className="w-100"
            />
          </div>
        </MobileOnly>
      </CustomDrawer>
    </>
  );
};

export default EventMetaInfo;