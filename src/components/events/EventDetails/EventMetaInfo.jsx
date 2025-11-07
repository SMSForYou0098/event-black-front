import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import BookingFooterLayout from "../../../utils/BookingFooterLayout";
import CustomBtn from "../../../utils/CustomBtn";
import CustomDrawer from "../../../utils/CustomDrawer";
import { CustomTooltip } from "../../../utils/CustomTooltip";
import CustomBadge from "../../../utils/ProfileUtils/getBadgeClass";
const EventMetaInfo = ({ metaInfo, event_key, eventData }) => {
  const { setShowHeaderBookBtn, isMobile } = useMyContext();
  const bookBtnRef = useRef(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const router = useRouter();

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

                  style={{ fontSize: "15px", fontWeight: 500 }}
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
            <Col
              sm="12"
              className="d-flex justify-content-between align-items-center border-dashed  rounded-3"
            >
              <h4 className="price mt-3 mb-3 d-flex gap-2 align-items-center">
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
                    //console.log(eventData)
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


              <Button
                ref={bookBtnRef}
                size="sm"
                className="fw-bold px-5 py-2 d-flex align-items-center rounded-3"
                onClick={handleBookNow}
                style={{ height: "3rem", fontSize: "16px" }}
              >
                <span className="me-2">Book</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </Col>
          </Row>

        </div>
      </div>

      {/* Mobile Sticky Button */}
      <div className="d-block d-sm-none">
        <BookingFooterLayout
          left={
            <span className="p-0 m-0">
              Starts From{" "}
              <h5 className=" fw-bold">
                ₹
                {eventData?.lowest_sale_price || eventData?.lowest_ticket_price}
              </h5>
            </span>
          }
          right={
            <Button
              onClick={handleBookNow}
              className="btn btn-primary btn-lg px-3"
              style={{ fontSize: "16px", fontWeight: "600" }}
            >
              <span className="me-2">Book</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Button>
          }
        />
      </div>

      {/* drawer */}
      <CustomDrawer title="Booking Info" showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}>
        <div>
          <p className="p-0 m-0">{eventData?.booking_notice}.</p>
          <CustomBtn variant="primary" buttonText="Continue" HandleClick={handleContinue} className="position-relative float-end" />
        </div>
      </CustomDrawer>
    </>
  );
};

export default EventMetaInfo;
