import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Offcanvas, Row } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import StickyBottom from "../../../utils/StickyBottom";

const EventMetaInfo = ({ metaInfo, event_key }) => {
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
      <div className="product-meta-wrapper mt-4">
        <Row>
          {metaInfo.map((info, idx) => (
            <Col sm="6" xs={info.colSm ?? 12} className="mb-3" key={info.label}>
              <div className="border rounded-4 p-3 h-100">
                <h6 className="text-muted mb-1">{info.label}</h6>
                <p className={`mb-0 ${info.valueClass}`}>{info.value}</p>
              </div>
            </Col>
          ))}
        </Row>

        {/* Desktop Button - only show on non-mobile */}
        {!isMobile && (
          <Row>
            <Col sm="12" className="d-flex">
              <Button
                ref={bookBtnRef}
                onClick={handleBookNow}
                className="btn btn-primary btn-lg px-5 py-3"
              >
                <span className="me-2">Book Now</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Button>
            </Col>
          </Row>
        )}

        {/* Mobile: Add some bottom padding to prevent content being hidden behind sticky button */}
        {isMobile && <div style={{ paddingBottom: "80px" }} />}
      </div>

      {/* Mobile Sticky Button */}
      {isMobile && (
        <StickyBottom>
          <Button
            onClick={handleBookNow}
            className="btn btn-primary btn-lg w-100 py-3"
            style={{ fontSize: "16px", fontWeight: "600" }}
          >
            <span className="me-2">Book Now</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Button>
        </StickyBottom>
      )}

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
