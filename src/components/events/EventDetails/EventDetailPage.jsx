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

import TermsAccordion from "./TermsAccordion";

const EventDetailPage = memo(({ eventData, event_key }) => {
  // --- Data Processing ---
  const [startDate, endDate] = eventData?.date_range?.split(",") || [];
  const [showLoginModal, setShowLoginModal] = useState(false);
  useHeaderSimple({
    title: eventData?.name || "Event Details",
  });

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

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

          {/* Interest Button */}
          <div className="my-3">
            <InterestButton
              eventId={eventData?.id}
              eventData={eventData}
              onLoginRequired={handleLoginRequired}
            />
          </div>
          {/* Terms Accordion */}
          {eventData?.ticket_terms && (
            <TermsAccordion terms={eventData.ticket_terms} />
          )}

          {/* --- Tabs Section --- */}
          <EventTabs
            eventData={eventData}
            startDate={startDate}
            endDate={endDate}
          />
          {/* Add EventCrew component here */}
          <EventCrew crews={eventData?.artists_list} />
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