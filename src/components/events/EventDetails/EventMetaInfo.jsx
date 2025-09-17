import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Offcanvas, Row } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import BookingFooterLayout from "../../../utils/BookingFooterLayout";

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
    setShowOffcanvas(true);
  };

  return (
    <>
      <div className="product-meta-wrapper mt-2">
        <div className="event-meta-compact d-flex flex-wrap gap-3 mt-3">
          {metaInfo?.map((info ,i) => (
            <div
            key={i}
              className="custom-dark-content-bg d-flex align-items-start px-3 py-2 rounded-3 border"
            >
              <span className="me-3">
                {" "}
                <i className={info.icon}></i>
              </span>
              <span className="text-muted" style={{ fontSize: "13px" }}>
                {info.label}
              </span>
              <span
                className={info.valueClass}
                style={{ fontSize: "15px", fontWeight: 500 }}
              >
                {info.value}
              </span>
            </div>
          ))}
        </div>

        {/* Desktop Button - only show on non-mobile */}
        <div className="d-none d-sm-block">
          <Row className="mt-4 mb-3">
            <Col
              sm="12"
              className="d-flex justify-content-between align-items-center border-dashed p-3 rounded-3"
            >
              <h4 className="price mt-3 mb-3 d-flex gap-2">
                <div className="text-primary">Pricing </div>
                <span className=" fw-bold">
                  ₹
                  {eventData?.lowest_sale_price ||
                    eventData?.lowest_ticket_price}
                </span>{" "}
                Onwards
              </h4>
              <Button
                ref={bookBtnRef}
                size="sm"
                className="fw-bold px-5 py-2 d-flex align-items-center rounded-3"
                onClick={handleBookNow}
                style={{
                  height: "3rem",
                  fontSize: "16px",
                }}
              >
                <span className="me-2">Book Now</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </Col>
          </Row>
        </div>


        {/* Mobile: Add some bottom padding to prevent content being hidden behind sticky button */}
        {isMobile && <div style={{ paddingBottom: "80px" }} />}
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
              <span className="me-2">Book Now</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Button>
          }
        />
      </div>

      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement={isMobile ? "bottom" : "top"}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Booking Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div>
            {/* Your custom content here */}
            <p>Some content goes here. Confirm your booking details.</p>
            <Button variant="primary" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default EventMetaInfo;
