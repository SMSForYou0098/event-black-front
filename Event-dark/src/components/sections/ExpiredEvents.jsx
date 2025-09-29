import { memo } from "react";
import { expiredEvents } from "@/services/home";
import EventsContainer from "@/utils/EventUtils/EventsContainer";


const ExpiredEvents = memo(() => {
  return (
        <EventsContainer
          title="Past Events"
          loadingText="Loading Past Events..."
          errorText="Failed to load past events. Please try again later."
          useReactQuery={true}
          queryKey={['pastEvents']}
          queryFn={expiredEvents}
          staleTime={5 * 60 * 1000}
          retry={2}        />
  );
})

ExpiredEvents.displayName = 'ExpiredEvents';
export default ExpiredEvents;
