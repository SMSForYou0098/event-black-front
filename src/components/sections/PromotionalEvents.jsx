import React from 'react';
import Image from 'next/image';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { api } from '@/lib/axiosInterceptor';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';
import CardStyle from '../cards/CardStyle';
import SectionSlider from '../slider/SectionSlider';

export const usePromotionalEvents = (options = {}) => {
  return useQuery({
    queryKey: ['eventsByOrg'],
    queryFn: async () => {
      const response = await api.get('/promote-orgs');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    ...options,
  });
};


const PromotionalEvents = () => {
  const { data = [], isLoading, isError, error } = usePromotionalEvents();
  const { createSlug } = useMyContext();
  
  if (isLoading) return <div className="text-center py-5">Loading...</div>;
  if (isError) return <div className="text-center py-5 text-danger">Error: {error?.message}</div>;

  return (
    <section className='promo-cards'>
      <SectionSlider list={data}>
        {(event, index) => (
          <CardStyle
            key={index}
            image={event?.image}
            link={`/events/${createSlug(event.org?.city).toLowerCase()}/${createSlug(event?.org?.organisation).toLowerCase()}`}
            countValue={index + 1}
          />
        )}
      </SectionSlider>
    </section>
  );
};

export default PromotionalEvents;