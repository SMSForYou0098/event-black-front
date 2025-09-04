import { Ticket } from "lucide-react";
import React from "react";
import { Card, Col, Nav, Row, Tab } from "react-bootstrap";

const EventTabs = ({ eventData, startDate, endDate }) => {
  const tabItems = [
    { key: "description", label: "Description" },
    { key: "additional-info", label: "Event Info" },
    { key: "organizer", label: "Organizer" },
    { key: "terms", label: "Terms" },
  ];
  return (
    <div className="px-0">
      <div className="product-detail-tab" id="event-details">
        <Tab.Container defaultActiveKey="description ">
          <Nav
            variant="pills"
            className="iq-custom-tab tab-bg-gredient-center d-flex nav nav-pills align-items-center text-center mb-5 justify-content-center list-inline"
            style={{ gap: "10px" }}
          >
            {tabItems.map((item) => (
              <Nav.Item key={item.key}>
                <Nav.Link eventKey={item.key} className="d-flex align-items-center">
                  {item.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          <Tab.Content className="tab-content">
            <Tab.Pane eventKey="description" className="p-4  rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            eventData?.description ||
                            "No description available.",
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="additional-info" className="p-4  rounded">
              <Row className="g-3">
                <Col md="6">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2">
                        <i className="fa fa-calendar me-2"></i>Date Range
                      </h6>
                      <p className="mb-0">
                        {startDate} to {endDate}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="6">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2">
                        <i className="fa fa-clock me-2"></i>Timings
                      </h6>
                      <p className="mb-0">
                        Entry: {eventData?.entry_time}
                        <br />
                        Start: {eventData?.start_time}
                        <br />
                        End: {eventData?.end_time}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2">
                        <i className="fa fa-map-marker-alt me-2"></i>
                        Location
                      </h6>
                      <p className="mb-3">
                        {eventData?.address}, {eventData?.city},{" "}
                        {eventData?.state}, {eventData?.country}
                      </p>

                      {eventData?.map_code && (
                        <div className="ratio ratio-16x9">
                          <iframe
                            src={eventData.map_code}
                            className="rounded"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="organizer" className="p-4  rounded">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h4 className="text-primary mb-4">
                    <i className="fa fa-building me-2"></i>
                    {eventData?.user?.organisation}
                  </h4>

                  <Row className="g-3">
                    <Col sm="6">
                      <div className="d-flex align-items-center">
                        <i className="fa fa-user text-muted me-2"></i>
                        <div>
                          <small className="text-muted">Contact Person</small>
                          <p className="mb-0 fw-semibold">
                            {eventData?.user?.name}
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col sm="6">
                      <div className="d-flex align-items-center">
                        <i className="fa fa-envelope text-muted me-2"></i>
                        <div>
                          <small className="text-muted">Email</small>
                          <p className="mb-0 fw-semibold">
                            {eventData?.user?.email}
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col sm="6">
                      <div className="d-flex align-items-center">
                        <i className="fa fa-phone text-muted me-2"></i>
                        <div>
                          <small className="text-muted">Phone</small>
                          <p className="mb-0 fw-semibold">
                            {eventData?.user?.number}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            <Tab.Pane eventKey="terms" className="p-4  rounded">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h4 className="text-primary mb-4">
                    <Ticket size={30} className="me-2" />
                    Ticket terms
                  </h4>
                  <div
                    className="text-white"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {eventData?.ticket_terms || "No ticket terms available."}
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default EventTabs;
