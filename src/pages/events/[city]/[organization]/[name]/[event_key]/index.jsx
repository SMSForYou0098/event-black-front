import { useRouter } from 'next/router';
import { getEventById, getEventData, useEventData } from '../../../../../../services/events';
import EventDetailPage from '../../../../../../components/events/EventDetails/EventDetailPage';

const EventbyId = () => {
  const router = useRouter();
  const { event_key } = router.query;

  const { data: event, isLoading, isError, error } = useEventData(event_key);
  // 4. Handle UI States
  if (isLoading) {
    return <div className='mt-5 pt-5'>Loading event details...</div>;
  }

  if (isError) {
    return <div className='mt-5 pt-5'>Error fetching event: {error.message}</div>;
  }

  return (
    <div className='mt-5 pt-5'>
      <EventDetailPage eventData={event} event_key={event_key} />
    </div>
  );
};

export default EventbyId;

