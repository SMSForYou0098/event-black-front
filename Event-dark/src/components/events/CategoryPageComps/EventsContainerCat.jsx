import React from "react";
import CardStyle from "@/components/cards/CardStyle";
import { useMyContext } from "@/Context/MyContextProvider";
import { Col, Container, Row } from "react-bootstrap";
import SkeletonLoader from '../../../utils/SkeletonUtils/SkeletonLoader'

const EventsContainerCat = ({ events = [], loading = false, title }) => {
  const { createSlug } = useMyContext();
  if (loading) {
    return <SkeletonLoader />
  }

  if (!events.length) {
    return <div>No events found</div>;
  }

  return (
    <div>

       <h5 className="main-title text-capitalize mb-0">{title}</h5>
    <Row className="row-cols-xl-6 row-cols-md-4 row-cols-2">
      {events.map((data, index) => (
        <Col key={index} className="  ">
          <CardStyle
            key={data.id}
            image={data.thumbnail}
            title={data.name}
            movieTime={data.date_range}
            watchlistLink="/play-list"
            link={`/events/${createSlug(data.city)}/${createSlug(
              data.organisation
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
