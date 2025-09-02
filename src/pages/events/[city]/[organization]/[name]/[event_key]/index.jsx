import { useRouter } from 'next/router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '../../../../../../services/events';
import EventDetailPage from '../../../../../../components/events/EventDetailPage';

const EventbyId = () => {
  const router = useRouter();
  const { city, event_key } = router.query;

  const {
    data: event,    // Renamed 'data' to 'event' for clarity
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['event', event_key],

    queryFn: async () => {
      const response = await getEventById(event_key);
      return response.events; // Return the nested event data directly
    },

    enabled: !!event_key,
  });

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

