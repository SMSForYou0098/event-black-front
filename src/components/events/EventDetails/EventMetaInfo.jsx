import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Alert } from "react-bootstrap";
import { Share2, Star } from "lucide-react";
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
import ReviewForm from "../../reviews/ReviewForm";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import toast from "react-hot-toast";
import TermsAccordion from "./TermsAccordion";

const EventMetaInfo = ({ metaInfo, event_key, eventData, handleShare }) => {
  const { setShowHeaderBookBtn, isMobile, formatDateDDMMYYYY, UserData } = useMyContext();
  const bookBtnRef = useRef(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const router = useRouter();
  const [showTermsDrawer, setShowTermsDrawer] = useState(false);

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const handleWriteReview = () => {
    if (!UserData) {
      setShowLoginModal(true);
      return;
    }
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleSubmitReview = async ({ rating, review }) => {
    try {
      if (editingReview) {
        await updateReviewMutation.mutateAsync({
          reviewId: editingReview.id,
          eventId: eventData?.id,
          rating,
          review,
        });
        toast.success('Review updated');
      } else {
        await createReviewMutation.mutateAsync({
          eventId: eventData?.id,
          rating,
          review,
        });
        toast.success('Review submitted');
      }
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    }
  };

  const isSubmittingReview = createReviewMutation.isPending || updateReviewMutation.isPending;

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
    setShowTermsDrawer(false);
    router.push(`/events/cart/${event_key}`);
  };

  const handleBookingNoticeContinue = () => {
    setShowOffcanvas(false);

    // Check if any terms exist
    if (eventData?.online_ticket_terms || eventData?.offline_ticket_terms) {
      setTimeout(() => {
        setShowTermsDrawer(true);
      }, 300); // Slight delay for smoother drawer transition
    } else {
      handleContinue();
    }
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

    // if (eventData?.booking_notice?.trim()) {
    //   setShowOffcanvas(true);
    //   return;
    // }

    // if (eventData?.online_ticket_terms || eventData?.offline_ticket_terms) {
    //   setShowTermsDrawer(true);
    //   return;
    // }

    handleContinue();
  };

  return (
    <>
      <div className="product-meta-wrapper mt-2">

        {/* Event Meta Info */}
        <div className="event-meta-compact w-100 d-flex justify-content-between flex-wrap gap-3 ">
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
            <div className="rounded-3 p-3 d-inline-flex align-items-center justify-content-between gap-3 w-100 flex-wrap">

              {/* Pricing label */}
              <div className="d-flex gap-4">

                <h6 className="m-0 d-flex gap-2 align-items-center flex-wrap text-nowrap">
                  <span className="text-primary fw-bold">Pricing :</span>
                  <span>
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
                </h6>

                {/* Book */}
                <CustomBtn
                  size="sm"
                  className="fw-bold py-2 rounded-3"
                  wrapper
                  style={{ fontSize: "13px" }}
                  HandleClick={handleBookNow}
                  disabled={eventStatus.disabled}
                  buttonText={eventStatus.text}
                />
              </div>

              <div className='d-flex gap-2'>

                {/* Interested */}
                <InterestButton
                  eventId={eventData?.id}
                  eventData={eventData}
                  onLoginRequired={handleLoginRequired}
                />
                {/* Rate This */}

                <CustomBtn
                  HandleClick={handleWriteReview}
                  variant='outline-danger'
                  size="sm"
                  className="fw-bold py-2 rounded-3 d-flex align-items-center gap-2 justify-content-center"
                  style={{ fontSize: "13px" }}
                  buttonText="Rate This"
                  icon={<Star size={16} />}
                />
                <CustomBtn
                  HandleClick={handleShare}
                  variant='outline-danger'
                  size="sm"
                  className="fw-bold py-2 rounded-3 d-flex align-items-center gap-2 justify-content-center"
                  style={{ fontSize: "13px" }}
                  buttonText="Share"
                  icon={<Share2 size={16} />}
                />
              </div>

            </div>
          )}

          {eventStatus.disabled && (
            <Row className="mt-4 mb-3 align-items-center border-dashed rounded-3 g-2 p-3">
              <Col md={6}>
                <Button
                  size="sm"
                  className="fw-bold w-100 py-2 rounded-3"
                  onClick={() => router.push("/events")}
                >
                  View More Events
                </Button>
              </Col>
              <Col md={6}>
                <InterestButton
                  eventId={eventData?.id}
                  eventData={eventData}
                  onLoginRequired={handleLoginRequired}
                />
              </Col>
            </Row>
          )}
        </div>
      </div>


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
            <CustomBtn buttonText="Continue" HandleClick={handleBookingNoticeContinue} />
          </div>
        </TabletAndDesktop>

        <MobileOnly>
          <div className="position-fixed bottom-0 start-0 w-100 p-3 bg-body border-top">
            <CustomBtn
              wrapperClassName="w-100"
              buttonText="Continue"
              HandleClick={handleBookingNoticeContinue}
            />
          </div>
        </MobileOnly>
      </CustomDrawer>

      <TermsAccordion
        onlineTerms={eventData?.online_ticket_terms}
        offlineTerms={eventData?.offline_ticket_terms}
        show={showTermsDrawer}
        onClose={() => setShowTermsDrawer(false)}
        onAgree={handleContinue}
        showTrigger={false}
      />

      {/* Rate This Modal */}
      <ReviewForm
        show={showReviewForm}
        onHide={() => { setShowReviewForm(false); setEditingReview(null); }}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        editingReview={editingReview}
      />
    </>
  );
};

export default EventMetaInfo;
