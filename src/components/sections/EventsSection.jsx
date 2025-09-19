import {memo} from "react";
import EventsContainer from "@/utils/EventUtils/EventsContainer";

const EventsSection = memo(() => {

  return (
    <EventsContainer
      title="Events"
      className="recommended-block section-top-spacing streamit-block"
      loadingText="Loading Events..."
      errorText="Failed to load events. Please try again later."
      useReactQuery={false}
    />
  );
});

EventsSection.displayName = 'EventsSection';
export default EventsSection;