// pages/.../index.jsx
import EventDetailPage from '../../../../../../components/events/EventDetails/EventDetailPage';
import { useEventData, getEventById } from '../../../../../../services/events';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import EventDetailPageSkeleton from '../../../../../../utils/SkeletonUtils/EventDetailPageSkeleton';

const queryKey = (event_key) => ['event', event_key];

const EventById = ({ event_key }) => {
  const { data: event,isLoading } = useEventData(event_key); // instantly hydrated
  console.log('loading',isLoading);
  if(isLoading){
    return <EventDetailPageSkeleton />
  }
  if (!event) return <div className="mt-5 pt-5">Event not found.</div>;
  return (
    <section>
      <EventDetailPage eventData={event} event_key={event_key} />
    </section>
  );
};

export const getServerSideProps = async (ctx) => {
  const { event_key } = ctx.params || {};
  const qc = new QueryClient();

  try {
    await qc.prefetchQuery({
      queryKey: queryKey(event_key),
      queryFn: () => getEventById(event_key), // or getEventData(event_key)
    });

    const dehydratedState = dehydrate(qc);

    // ensure the same key is used in your useEventData hook
    return {
      props: {
        dehydratedState,
        event_key,
      },
    };
  } catch (e) {
    return { notFound: true };
  }
};

export default EventById;
