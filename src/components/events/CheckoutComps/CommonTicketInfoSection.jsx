import React from "react";
import { Row, Col } from "react-bootstrap";
import { ETicketAlert, TicketDataSummary, BookingMetadataCard } from "./checkout_utils";

const CommonTicketInfoSection = ({
  showAlert = true,
  summaryProps,
  metadataProps,
  leftExtra = null,
  rightExtra = null,
}) => {
  return (
    <>
      {showAlert && <ETicketAlert />}
      <Row>
        <Col lg={8}>
          <TicketDataSummary {...summaryProps} />
          {leftExtra}
        </Col>
        <Col lg={4}>
          <BookingMetadataCard {...metadataProps} />
          {rightExtra}
        </Col>
      </Row>
    </>
  );
};

export default CommonTicketInfoSection;
