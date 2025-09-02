import React from "react";
import { Card, Row, Col, Placeholder } from "react-bootstrap";

const TicketSkeleton = () => {
  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Row>
          <Col md={6}>
            <Placeholder as="h5" animation="wave">
              <Placeholder xs={8} />
            </Placeholder>
            <Placeholder animation="wave" className="mb-2">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder animation="wave" className="mb-2">
              <Placeholder xs={5} />
            </Placeholder>
            <Placeholder animation="wave" className="mb-2">
              <Placeholder xs={9} />
            </Placeholder>
          </Col>
          <Col md={6} className="text-md-end">
            <Placeholder as="h5" animation="wave">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder animation="wave" className="mb-2">
              <Placeholder xs={5} />
            </Placeholder>
            <Placeholder animation="wave" className="mb-2">
              <Placeholder xs={5} />
            </Placeholder>
            <Placeholder animation="wave">
              <Placeholder xs={4} />
            </Placeholder>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TicketSkeleton;
