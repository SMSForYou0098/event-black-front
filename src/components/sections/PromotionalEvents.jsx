import React from 'react';
import Image from 'next/image';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { api } from '@/lib/axiosInterceptor';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';

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
  const router = useRouter();
  const {createSlug} = useMyContext();
  if (isLoading) return <div className="text-center py-5">Loading...</div>;
  if (isError) return <div className="text-center py-5 text-danger">Error: {error?.message}</div>;

  return (
    <section className="py-5">
      <Container>
        <div className="text-center mb-5">
          <h4 className="mb-3">Trending Organisations</h4>
          <p className="text-muted">Discover exciting events happening near you</p>
        </div>

        <Row className="row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-6 g-4">
          {data?.map((event) => (
            <Col key={event.id}>
              <Card 
                className="h-100 border-0 shadow-sm" 
                onClick={() => router.push(`/events/${createSlug(event.org?.city).toLowerCase()}/${createSlug(event?.org?.organisation).toLowerCase()}`)}
                role="button"
              >
                <Card.Body className="text-center p-3">
                  <div className="mb-3 d-inline-block">
                    {event?.image ? (
                      <Image
                        src={event?.image}
                        alt={`Organization ${event.org_id}`}
                        width={120}
                        height={120}
                        className="rounded-circle border border-3 border-light"
                        priority={event.id <= 2}
                      />
                    ) : (
                      <div 
                        className="rounded-circle border border-3 border-light d-flex align-items-center justify-content-center bg-light"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <span className="text-muted">No Image</span>
                      </div>
                    )}
                  </div>
                  <Card.Title as="h6" className="mb-2 fw-bold">
                    {event?.org?.organisation}
                  </Card.Title>
                  {/* <div className="small text-muted">
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <Calendar size={14} className="me-1 flex-shrink-0" />
                      <span>{new Date(event.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      <span className="badge bg-primary">ID: {event.org_id}</span>
                    </div>
                  </div> */}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default PromotionalEvents;

