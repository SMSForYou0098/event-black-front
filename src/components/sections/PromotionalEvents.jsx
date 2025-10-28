// hooks/usePromotionalEvents.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';

export const usePromotionalEvents = (options = {}) => {
  return useQuery({
    queryKey: ['eventsByOrg'],
    queryFn: async () => {
      const response = await api.get('/event-by-org');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    ...options,
  });
};

import React from 'react';

const PromotionalEvents = () => {
//   const { data: events = [], isLoading, isError, error } = usePromotionalEvents();

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h5>Promotional Events </h5>
      {/* {events.map((event) => (
        <div key={event.id}>
          <h3>{event.title}</h3>
        </div>
      ))} */}
    </div>
  );
};

export default PromotionalEvents;
