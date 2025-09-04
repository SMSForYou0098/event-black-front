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

const EventDetailPage = memo(({ eventData, event_key }) => {
  // --- Data Processing ---
  const [startDate, endDate] = eventData?.date_range?.split(",") || [];
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const descRef = useRef(null);
  const { convertTo12HourFormat, formatDateRange } = useMyContext();



  const tickets =
    eventData?.tickets?.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      salePrice: ticket.sale === 1 ? Number(ticket.sale_price) : null,
      onSale: ticket.sale === 1,
      soldOut: ticket.sold_out === 1,
    })) || [];

  const metaInfo = [
    {
      label: "Category",
      colSm: 6,
      value: eventData?.category?.title,
      valueClass: "text-primary fw-semibold",
    },
    {
      label: "Event Type",
      value: eventData?.event_type,
      colSm: 6,
      valueClass: "text-primary fw-semibold text-capitalize",
    },
    {
      label: "Location",
      value: `${eventData?.city}, ${eventData?.state}`,
      valueClass: "fw-semibold",
    },
    {
      label: "Date & Time",
      value:
        formatDateRange(eventData?.date_range) +
        " | " +
        `${convertTo12HourFormat(eventData?.start_time)}`,
      valueClass: "fw-semibold",
    },
  ];

  const handleReadMore = () => {
    const el = document.getElementById("event-details");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // window.scrollBy(0, 80); // scroll slightly down if needed
    }
  };

  const getShortDesc = (html, wordLimit = 45) => {
    // Remove HTML tags and get plain text
    const text = html.replace(/<[^>]+>/g, "");
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return html;
    return words.slice(0, wordLimit).join(" ") + "...";
  };
  return (
    <Fragment>
      <div className="section-padding-top product-detail py-4">
        <Container>
          <Row>
            {/* Login Modal */}
            <LoginModal
              show={showLoginModal}
              onHide={() => setShowLoginModal(false)}
              eventKey={event_key}
              redirectPath={`/events/process/${event_key}`}
            />
            <Col lg="3" md="12" className="mb-4 mb-lg-0">
              {/* --- Single Event Image --- */}
              <div className="product-image-container d-flex justify-content-center align-items-center">
                <img
                  src={eventData?.thumbnail}
                  alt={eventData?.name}
                  className="img-fluid rounded-4"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </div>
            </Col>
            <Col lg="9" md="12" className="ps-lg-4">
              {/* --- Main Event Info --- */}
              <h2 className="mb-3">{capitalize(eventData?.name)}</h2>

              <h4 className="price mt-3 mb-3">
                Starts from{" "}
                <span className="text-primary fw-bold">
                  ₹
                  {eventData?.lowest_sale_price ||
                    eventData?.lowest_ticket_price}
                </span>
              </h4>

              {/* Event Description */}
              <h2 className="text-primary">About The Event</h2>
              <div ref={descRef}>
                <div
                  className="mt-3 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: showFullDesc
                      ? eventData?.description || ""
                      : getShortDesc(eventData?.description || ""),
                  }}
                />
                {!showFullDesc && eventData?.description && (
                  <a
                    href="#"
                    className="text-primary fw-semibold"
                    onClick={(e) => {
                      e.preventDefault();
                      handleReadMore();
                    }}
                  >
                    Read More
                  </a>
                )}
              </div>

              {/* Event Meta Information */}
              <EventMetaInfo metaInfo={metaInfo} event_key={event_key} />
            </Col>
          </Row>

          {/* --- Tickets Section --- */}
          <EventTicketInfo tickets={tickets} />
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
