import { Fragment, memo, useState } from "react";
// react-bootstrap
import { Container } from "react-bootstrap";
// import LoginModal from "../../auth/LoginModal";
import LoginModal from "../../auth/LoginOffCanvas";
import EventTabs from "./EventTabs";
import DetailsHeader from "./DetailsHeader";
import EventCrew from "./EventCrew";
import { useHeaderSimple } from "../../../Context/HeaderContext";
import { EventSEO } from "../SEO/index";
import { getEventSSR, withCache } from "../../../utils/seo/ssr";
import EventPhotoGallery from "./ImageGallery";
import { ReviewsSection, InterestButton } from "../../reviews";
import CustomBtn from "../../../utils/CustomBtn";
import ReviewForm from "../../reviews/ReviewForm";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import { useMyContext } from "@/Context/MyContextProvider";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import TermsAccordion from "./TermsAccordion";

const EventDetailPage = memo(({ eventData, event_key }) => {
  // --- Data Processing ---
  const [startDate, endDate] = eventData?.date_range?.split(",") || [];
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const { UserData } = useMyContext();
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  useHeaderSimple({
    title: eventData?.name || "Event Details",
  });

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

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

  return (
    <Fragment>
      <EventSEO eventData={eventData} event_key={event_key} />

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        eventKey={event_key}
        redirectPath={window.location.pathname}
      />

      <div className="section-padding-top product-detail py-0 py-sm-4">
        <Container>

          <DetailsHeader eventData={eventData} event_key={event_key} />

          {/* Interest Button + Rate This — mobile only */}
          <div className="my-3 m-2 d-flex d-sm-none align-items-center gap-3 justify-content-between">
            <InterestButton
              eventId={eventData?.id}
              eventData={eventData}
              onLoginRequired={handleLoginRequired}
            />
            <CustomBtn
              HandleClick={handleWriteReview}
              variant='outline-primary'
              size="sm"
              style={{ fontSize: '13px' }}
              buttonText="Review"
              icon={<Star size={16} />}
              iconPosition="left"
            />
          </div>

          {/* Rate This Modal */}
          <ReviewForm
            show={showReviewForm}
            onHide={() => { setShowReviewForm(false); setEditingReview(null); }}
            onSubmit={handleSubmitReview}
            isSubmitting={isSubmittingReview}
            editingReview={editingReview}
          />

          {/* Terms Accordion */}
          {/* {eventData?.ticket_terms && (
            <TermsAccordion terms={eventData.ticket_terms} />
          )} */}

          {/* --- Tabs Section --- */}
          <EventCrew crews={eventData?.artists_list} />
          <EventTabs
            eventData={eventData}
            startDate={startDate}
            endDate={endDate}
          />
          {/* Add EventCrew component here */}
          <EventPhotoGallery eventPhotos={eventData?.eventMedia?.images || []} />

          {/* Reviews Section */}
          <ReviewsSection
            eventId={eventData?.id}
            onLoginRequired={handleLoginRequired}
          />
        </Container>
      </div>
    </Fragment>
  );
});

EventDetailPage.displayName = "EventDetailPage";

// SSR function for fetching event data
export const getServerSideProps = withCache(getEventSSR, 300);

export default EventDetailPage;