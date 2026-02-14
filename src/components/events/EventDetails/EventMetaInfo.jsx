import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Alert } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import BookingFooterLayout from "../../../utils/BookingFooterLayout";
import LoginModal from "../../auth/LoginOffCanvas";
import { InterestButton } from "../../reviews";
import CustomBtn from "../../../utils/CustomBtn";
import CustomDrawer from "../../../utils/CustomDrawer";
import { CustomTooltip } from "../../../utils/CustomTooltip";
import CustomBadge from "../../../utils/ProfileUtils/getBadgeClass";
import { MobileOnly, TabletAndDesktop } from "@/utils/ResponsiveRenderer";

const EventMetaInfo = ({ metaInfo, event_key, eventData }) => {
  const { setShowHeaderBookBtn, isMobile, formatDateDDMMYYYY } = useMyContext();
  const bookBtnRef = useRef(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const isHouseFull = eventData?.eventControls?.house_full === true;
  const isSoldOut = eventData?.eventControls?.is_sold_out;
  const isPostponed = eventData?.eventControls?.is_postponed;
  const isCancelled = eventData?.eventControls?.is_cancelled;
  const expectedDate = eventData?.eventControls?.expected_date;

  const getEventStatus = () => {
    if (eventData?.total_tickets === 0)
      return { disabled: true, text: "No Tickets Available" };

    if (isCancelled)
      return { disabled: true, text: "Cancelled" };

    if (isPostponed)
      return { disabled: true, text: "Postponed" };

    if (isSoldOut || isHouseFull)
      return { disabled: true, text: "Sold Out" };

    if (eventData?.date_range) {
      const dates = eventData.date_range.split(",");
      const lastDate = new Date(dates[dates.length - 1]);
      lastDate.setHours(23, 59, 59, 999);
      if (new Date() > lastDate)
        return { disabled: true, text: "Event has finished" };
    }

    return { disabled: false, text: "Book" };
  };

  const eventStatus = getEventStatus();

  const handleContinue = () => {
    setShowOffcanvas(false);
    router.push(`/events/cart/${event_key}`);
  };

  const handleLoginRequired = () => setShowLoginModal(true);

  useEffect(() => {
    const handleScroll = () => {
      if (bookBtnRef.current && !isMobile) {
        const rect = bookBtnRef.current.getBoundingClientRect();
        setShowHeaderBookBtn(rect.top < 0);
      }
    };

    if (!isMobile) window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      setShowHeaderBookBtn(false);
    };
  }, [setShowHeaderBookBtn, isMobile]);

  const handleBookNow = () => {
    if (eventStatus.disabled) return;
    if (eventData?.booking_notice?.trim()) setShowOffcanvas(true);
    else handleContinue();
  };

  return (
    <>
      <div className="product-meta-wrapper mt-2">

        {/* Event Meta Info */}
        <div className="event-meta-compact d-flex flex-wrap gap-3 mt-3">
          {metaInfo?.map((info, i) => (
            <div
              key={i}
              className="custom-dark-content-bg d-flex align-items-start px-3 py-2 rounded-3 border"
            >
              <CustomTooltip text={info.description || ""}>
                <>
                  <span className="me-2">
                    <i className={info.icon}></i>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>
                    {info.value}
                  </span>
                </>
              </CustomTooltip>
            </div>
          ))}
        </div>

        {/* Desktop Pricing + Book Button */}
        <div className="d-none d-sm-block">
          {!eventStatus.disabled && (
            <Row className="mt-4 mb-3 align-items-center border-dashed rounded-3 g-2 p-3">

              {/* Pricing */}
              <Col md={8}>
                <h4 className="m-0 d-flex gap-2 align-items-center flex-wrap">
                  <span className="text-primary">Pricing :</span>
                  <span className="fw-bold">
                    {(() => {
                      let displayPrice = 0;
                      let showSaleBadge = false;

                      if (eventData?.on_sale && eventData?.lowest_sale_price) {
                        displayPrice = Number(eventData.lowest_sale_price);
                        showSaleBadge = true;
                      } else if (eventData?.lowest_ticket_price) {
                        displayPrice = Number(eventData.lowest_ticket_price);
                      }

                      if (!displayPrice) return "Free";

                      return (
                        <>
                          ₹{displayPrice} Onwards
                          {showSaleBadge && (
                            <CustomBadge className="ms-2">
                              On Sale
                            </CustomBadge>
                          )}
                        </>
                      );
                    })()}
                  </span>
                </h4>
              </Col>

              {/* Book Button */}
              <Col md={4}>
                <CustomBtn
                  size="sm"
                  className="fw-bold w-100 py-2 rounded-3"
                  HandleClick={handleBookNow}
                  disabled={eventStatus.disabled}
                  buttonText={eventStatus.text}
                />
              </Col>
            </Row>
          )}
        </div>
      </div>

      {/* Desktop Interest Section */}
      <Row className="d-none d-sm-flex align-items-center g-2 mt-2">
        {eventStatus.disabled && (
          <Col md={6}>
            <Button
              size="sm"
              className="fw-bold w-100 py-2 rounded-3"
              onClick={() => router.push("/events")}
            >
              View More Events
            </Button>
          </Col>
        )}

        <Col md={eventStatus.disabled ? 6 : 12}>
          <InterestButton
            eventId={eventData?.id}
            eventData={eventData}
            onLoginRequired={handleLoginRequired}
          />
        </Col>
      </Row>

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        eventKey={event_key}
      />

      {/* Postponed Notice */}
      {isPostponed && expectedDate && (
        <div className="text-warning mt-2 fw-medium">
          Expected on {formatDateDDMMYYYY(expectedDate)}
        </div>
      )}

      {/* Mobile Footer */}
      <div className="d-block d-sm-none">
        {eventStatus.disabled ? (
          <BookingFooterLayout>
            <CustomBtn
              size="sm"
              className="btn btn-primary w-100"
              HandleClick={() => router.push("/events")}
              buttonText="View More Events"
            />
          </BookingFooterLayout>
        ) : (
          <BookingFooterLayout
            left={
              <>
                Starts From
                <h5 className="fw-bold">
                  ₹
                  {eventData?.on_sale
                    ? eventData?.lowest_sale_price
                    : eventData?.lowest_ticket_price}
                </h5>
              </>
            }
            right={
              <CustomBtn
                HandleClick={handleBookNow}
                size="sm"
                buttonText={eventStatus.text}
              />
            }
          />
        )}
      </div>

      {/* Drawer */}
      <CustomDrawer showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas}>
        <p dangerouslySetInnerHTML={{ __html: eventData?.booking_notice }} />

        <TabletAndDesktop>
          <div className="text-end">
            <CustomBtn buttonText="Continue" HandleClick={handleContinue} />
          </div>
        </TabletAndDesktop>

        <MobileOnly>
          <div className="position-fixed bottom-0 start-0 w-100 p-3 bg-body border-top">
            <CustomBtn
              wrapperClassName="w-100"
              buttonText="Continue"
              HandleClick={handleContinue}
            />
          </div>
        </MobileOnly>
      </CustomDrawer>
    </>
  );
};

export default EventMetaInfo;
