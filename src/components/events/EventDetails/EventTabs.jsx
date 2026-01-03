import { Ticket } from "lucide-react";
import NextImage from "next/image";
import React from "react";
import { Card, Col, Nav, Row, Tab } from "react-bootstrap";

const EventTabs = ({ eventData, startDate, endDate }) => {
  const tabItems = [
    { key: "description", label: "Description" },
    { key: "location", label: "Locate" },
    { key: "layout", label: "Layout" },
    // { key: "additional-info", label: "Event Info" },
    // { key: "organizer", label: "Organizer" },
    // { key: "terms", label: "Terms" },
  ];
  return (
    <div className="mt-3">
      <div className="product-detail-tab" id="event-details">
        <Tab.Container defaultActiveKey="description">
          <Nav
            variant="pills"
            // className="nav nav-pills mb-3 mb-md-5"
            className="iq-custom-tab tab-bg-gredient-center d-flex nav nav-pills align-items-center text-center mb-0 justify-content-center list-inline"
          >
            <Row className="w-100 g-2">
              {tabItems.map((item) => (
                <Col
                  xs={4}
                  md="auto"
                  key={item.key}
                  className="flex-md-fill"
                >
                  <Nav.Item className="w-100">
                    <Nav.Link
                      eventKey={item.key}
                      className="d-flex align-items-center justify-content-center w-100 rounded-3"
                    >
                      {item.label}
                    </Nav.Link>
                  </Nav.Item>
                </Col>
              ))}
            </Row>

          </Nav>

          <Tab.Content className="tab-content">
            <Tab.Pane eventKey="description" className="  rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="">
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
              <Row className="g-3">
                <Col md="4">
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
                <Col md="4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2">
                        <i className="fa fa-clock me-2"></i>Timings
                      </h6>
                      <Row className="mb-0">
                        <Col xs={4}>
                          <strong>Entry:</strong> {eventData?.entry_time} <br />

                        </Col>
                        <Col xs={4}>
                          <strong>Start:</strong> {eventData?.start_time} <br />

                        </Col>
                        <Col xs={4}>
                          <strong>End:</strong> {eventData?.end_time}
                        </Col>
                      </Row>

                    </Card.Body>
                  </Card>
                </Col>
                <Col md="4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2">
                        <i className="fa fa-map-marker-alt me-2"></i>
                        Location
                      </h6>
                      <p className="mb-3">
                        {eventData?.venue?.address}, {eventData?.venue?.city},{" "}
                        {eventData?.venue?.state}, {eventData?.venue?.country}
                      </p>

                      {eventData?.map_code && (
                        <div className="ratio ratio-16x9">
                          <iframe
                            src={eventData?.map_code}
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
            <Tab.Pane eventKey="layout" className="p-4  rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      {typeof eventData?.eventMedia?.layout_image === "string" ? (
                        <div className="text-center">
                          <NextImage
                            src={eventData.eventMedia.layout_image}
                            alt="Event layout image"
                            width={400}
                            height={600}
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // keep your tiny base64
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ height: "auto", objectFit: "cover" }}
                            onError={(e) => console.error("Image failed to load", e)}
                            priority={false}
                          />
                        </div>
                      ) : (
                        <div className="p-4 text-muted">No layout image available.</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="location" className="p-4 rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      {eventData?.venue?.aembeded_code ? (
                        <div
                          className="ratio ratio-16x9"
                          dangerouslySetInnerHTML={{ __html: eventData.venue.aembeded_code }}
                        />
                      ) : (
                        <div className="p-3 text-muted text-center">No map available for this venue.</div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* <Tab.Pane eventKey="additional-info" className="p-4  rounded">
              
            </Tab.Pane> */}

            {/* <Tab.Pane eventKey="organizer" className="p-4  rounded">
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
            </Tab.Pane> */}

            {/* <Tab.Pane eventKey="terms" className="p-4  rounded">
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
                  <div
                    className="description-content"
                    dangerouslySetInnerHTML={{
                      __html: eventData?.ticket_terms || ""
                        .truncatedHtml,
                    }}
                  />
                </Card.Body>
              </Card>
            </Tab.Pane> */}
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default EventTabs;