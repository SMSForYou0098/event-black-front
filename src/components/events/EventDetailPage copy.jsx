import React, { Fragment, memo, useState } from "react";

// react-bootstrap
import {
  Container,
  Row,
  Col,
  Tab,
  Nav,
  Form,
  Button,
  Card,
  Badge,
  ListGroup,
  Table,
} from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { capitalize } from "lodash";
// next/link
import Link from "next/link";
import { Ticket } from "lucide-react";
import LoginModal from "../auth/LoginModal";
import { useRouter } from "next/router";

const EventDetailPage = memo(({ eventData, event_key }) => {
  // --- Data Processing ---
  const [startDate, endDate] = eventData?.date_range?.split(",") || [];
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useMyContext();
  const tickets =
    eventData?.tickets?.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      salePrice: ticket.sale === 1 ? Number(ticket.sale_price) : null,
      onSale: ticket.sale === 1,
      soldOut: ticket.sold_out === 1,
    })) || [];
  const handleBookNow = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      router.push(`/events/process/${event_key}`);
    }
  };
  const metaInfo = [
    {
      label: "Category",
      value: eventData?.category?.title,
      valueClass: "text-primary fw-semibold",
    },
    {
      label: "Event Type",
      value: eventData?.event_type,
      valueClass: "text-primary fw-semibold text-capitalize",
    },
    {
      label: "Location",
      value: `${eventData?.city}, ${eventData?.state}`,
      valueClass: "fw-semibold",
    },
  ];

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
            <Col lg="6" md="12" className="mb-4 mb-lg-0">
              {/* --- Single Event Image --- */}
              <div className="product-image-container">
                <img
                  src={eventData?.thumbnail}
                  alt={eventData?.name}
                  className="img-fluid rounded-4"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </div>
            </Col>
            <Col lg="6" md="12" className="ps-lg-4">
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
              <div
                className="mt-3 mb-4"
                dangerouslySetInnerHTML={{
                  __html: eventData?.description || "",
                }}
              />

              {/* Event Meta Information */}
              <div className="product-meta-wrapper mt-4">
                <Row>
                  {metaInfo.map((info, idx) => (
                    <Col sm="6" className="mb-3" key={info.label}>
                      <div className="border rounded-4 p-3 h-100">
                        <h6 className="text-muted mb-1">{info.label}</h6>
                        <p className={`mb-0 ${info.valueClass}`}>
                          {info.value}
                        </p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>
          </Row>

          {/* --- Tickets Section --- */}
          <Row id="tickets-section" className="my-5">
            <Col>
              <h2 className="mb-4">Available Tickets</h2>
              <Row xs={1} md={2} lg={3} className="g-4">
                {tickets.map((ticket) => (
                  <Col key={ticket?.id}>
                    <Card className="h-100 shadow-sm border-0">
                      <Card.Body className="d-flex flex-column p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Card.Title className="h5 mb-0">
                            {ticket?.name}
                          </Card.Title>
                          {ticket.soldOut ? (
                            <Badge bg="danger">Sold Out</Badge>
                          ) : ticket.onSale ? (
                            <Badge bg="success">On Sale</Badge>
                          ) : null}
                        </div>

                        <Card.Text className="mb-4">
                          {ticket?.onSale ? (
                            <div>
                              <span className="text-decoration-line-through text-muted me-2">
                                ₹{ticket?.price}
                              </span>
                              <strong className="text-primary fs-4">
                                ₹{ticket?.salePrice}
                              </strong>
                              <div className="text-success small mt-1">
                                Save ₹{ticket?.price - ticket?.salePrice}
                              </div>
                            </div>
                          ) : (
                            <strong className="text-primary fs-4">
                              ₹{ticket?.price}
                            </strong>
                          )}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Single Book Now Button */}
              <div className="text-center mt-4">
                <Button
                  onClick={handleBookNow}
                  className="btn btn-primary btn-lg px-5 py-3"
                >
                  <span className="me-2">Book Now</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </div>
            </Col>
          </Row>

          {/* --- Tabs Section --- */}
          <div className="section-padding px-0">
            <div className="product-detail-tab">
              <Tab.Container defaultActiveKey="description">
                <Nav
                  variant="pills"
                  className="justify-content-center mb-4 flex-column flex-md-row"
                  style={{ gap: "10px" }}
                >
                  <Nav.Item>
                    <Nav.Link eventKey="description" className="px-4 py-2">
                      Description
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="additional-info" className="px-4 py-2">
                      Event Info
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="organizer" className="px-4 py-2">
                      Organizer
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="terms" className="px-4 py-2">
                      Terms
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="tab-content">
                  <Tab.Pane eventKey="description" className="p-4  rounded">
                    <Row>
                      <Col md="12">
                        <Card className="border-0 shadow-sm">
                          <Card.Body>
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
                                <small className="text-muted">
                                  Contact Person
                                </small>
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
                          {eventData?.ticket_terms ||
                            "No ticket terms available."}
                        </div>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

EventDetailPage.displayName = "EventDetailPage";
export default EventDetailPage;
