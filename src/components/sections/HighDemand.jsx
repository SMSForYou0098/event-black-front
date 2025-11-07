import { memo } from "react";
import EventsContainer from "@/utils/EventUtils/EventsContainer";
import { getFeatureEvents } from "@/services/home";

// Services

const HighDemand = memo(() => {
  return (
    <EventsContainer
      title="Popular Events"
      loadingText="Loading Popular Shows..."
      errorText="Failed to load popular shows. Please try again later."
      useReactQuery={true}
      queryKey={['featureEvents']}
      queryFn={getFeatureEvents}
      staleTime={5 * 60 * 1000}
      retry={2}
      isTopTenCard={true}
    />
  )
});

HighDemand.displayName = 'HighDemand';
export default HighDemand;