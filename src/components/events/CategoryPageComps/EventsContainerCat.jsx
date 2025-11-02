import React from "react";
import CardStyle from "@/components/cards/CardStyle";
import { useMyContext } from "@/Context/MyContextProvider";
import { Col, Container, Row } from "react-bootstrap";
import SkeletonLoader from '../../../utils/SkeletonUtils/SkeletonLoader'
import { Ticket } from "lucide-react";
import CustomBtn from "../../../utils/CustomBtn";
import { useRouter } from "next/router";

const EventsContainerCat = ({ events = [], loading = false, title }) => {
  const { createSlug } = useMyContext();
  if (loading) {
    return <SkeletonLoader />
  }
  const router = useRouter();
  if (!events.length) {
    return (
      <Container className="text-center py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Ticket className="text-warning" />
            <h4 className="fw-semibold text-secondary">No Active Events</h4>
            <p className="text-muted mt-2">
              There are currently no active events. Please check back later or try refreshing.
            </p>
            <CustomBtn
              variant="primary"
              disabled={loading}
              size="sm"
              HandleClick={() => router.push('/events')}
              buttonText={'Browse Other Events'}
            />
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div>
      <Row className="">
        <Col xs={12}>
          {title && <h5 className="main-title text-capitalize mb-3">{title}</h5>}
        </Col>
        {events.map((data, index) => (
          <Col xs={6} md={2} key={index}>
            <CardStyle
              key={data.id}
              image={data.thumbnail || data?.event_media?.thumbnail}
              title={data.name}
              movieTime={data.date_range}
              watchlistLink="/play-list"
              link={`/events/${createSlug(data.city)}/${createSlug(
                data.organisation || data?.organizer?.organisation
              )}/${createSlug(data.name)}/${data.event_key}`}
              lowest_ticket_price={data.lowest_ticket_price}
              lowest_sale_price={data.lowest_sale_price}
              on_sale={data.on_sale}
              countValue={index + 1}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default EventsContainerCat;
