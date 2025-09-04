import React from "react";
import { Col, Row } from "react-bootstrap";
import EnhancedTicketsSection from "./EnhancedTicketsSection";

const EventTicketInfo = ({ tickets }) => {
  return (
    <Row id="tickets-section">
      <Col>
        {/* <h2 className="mb-4">Available Tickets</h2> */}
        <EnhancedTicketsSection tickets={tickets} />
      </Col>
    </Row>
  );
};

export default EventTicketInfo;
