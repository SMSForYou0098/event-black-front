import React, { Fragment, memo, useEffect, useRef, useState } from "react";

// react-bootstrap
import { Container, Row, Col } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { capitalize } from "lodash";
// next/link

import LoginModal from "../../auth/LoginModal";
import { useRouter } from "next/router";
import EventTabs from "./EventTabs";
import EventTicketInfo from "./EventTicketInfo";
import EventMetaInfo from "./EventMetaInfo";
import DetailsHeader from "./DetailsHeader";
import EventCrew from "./EventCrew";

const EventDetailPage = memo(({ eventData, event_key }) => {
  // --- Data Processing ---
  const [startDate, endDate] = eventData?.date_range?.split(",") || [];
  const [showLoginModal, setShowLoginModal] = useState(false);


  const tickets =
    eventData?.tickets?.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      salePrice: ticket.sale === 1 ? Number(ticket.sale_price) : null,
      onSale: ticket.sale === 1,
      soldOut: ticket.sold_out === 1,
    })) || [];


  return (
    <Fragment>
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        eventKey={event_key}
        redirectPath={`/events/process/${event_key}`}
      />
      <div className="section-padding-top product-detail py-4">
        <Container>
          <DetailsHeader eventData={eventData} event_key={event_key} />
          {/* --- Tickets Section --- */}
          {/* <EventTicketInfo tickets={tickets} /> */}

          {/* Add EventCrew component here */}
          <EventCrew crews={eventData?.crews} />
          {/* --- Tabs Section --- */}
          <EventTabs
            eventData={eventData}
            startDate={startDate}
            endDate={endDate}
          />
        </Container>
      </div>
    </Fragment>
  );
});

EventDetailPage.displayName = "EventDetailPage";
export default EventDetailPage;
