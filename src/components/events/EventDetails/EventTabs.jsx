import { Ticket } from "lucide-react";
import NextImage from "next/image";
import React from "react";
import { Card, Col, Nav, Row, Tab } from "react-bootstrap";

const EventTabs = ({ eventData, startDate, endDate }) => {
  const tabItems = [
    { key: "description", label: "Description" },
    { key: "location", label: "Location" },
    { key: "layout", label: "Layout" },
    { key: "additional-info", label: "Event Info" },
    { key: "organizer", label: "Organizer" },
    { key: "terms", label: "Terms" },
  ];
  return (
    <div className="px-0">
      <div className="product-detail-tab" id="event-details">
        <Tab.Container defaultActiveKey="description">
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
            <Tab.Pane eventKey="layout" className="p-4  rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      {/* <Image  /> */}
                      {typeof eventData?.event_media?.layout_image === "string" ? (
                        <NextImage
                          src={eventData.event_media.layout_image}
                          alt="Event layout image"
                          width={800}
                          height={600}
                          quality={75}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // keep your tiny base64
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ width: "100%", height: "auto", objectFit: "cover" }}
                          // onLoad={() => console.log("Image loaded")}
                          onError={(e) => console.error("Image failed to load", e)}
                          priority={false}
                        />
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

          {/* Venue Thumbnail */}

          {/* thumbnail and images of venue */}
          {/* {typeof eventData?.venue?.thumbnail === "string" && eventData.venue.thumbnail ? (
            <NextImage
              src={eventData.venue.thumbnail}
              alt="Venue thumbnail"
              width={1200}
              height={675}
              quality={75}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // tiny base64
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
              onLoad={() => console.log("Thumbnail loaded")}
              onError={(e) => console.error("Thumbnail failed to load", e)}
              priority={false}
            />
          ) : (
            <div className="p-4 text-muted">No layout image available.</div>
          )}

          {(() => {
            let images = [];
            const raw = eventData?.venue?.venue_images;

            try {
              if (Array.isArray(raw)) {
                images = raw;
              } else if (typeof raw === "string" && raw.trim()) {
                images = JSON.parse(raw);
              }
            } catch (e) {
              console.error("Invalid venue_images format", e);
            }

            if (Array.isArray(images) && images.length > 0) {
              return (
                <Row className="g-3 p-3">
                  {images.map((img, idx) => {
                    const src = String(img || "")
                      .replace(/\\\//g, "/")     // unescape slashes
                      .replace(/^"+|"+$/g, "");  // strip stray quotes

                    if (!src) return null;

                    return (
                      <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                        <div className="position-relative" style={{ width: "100%", aspectRatio: "4 / 3" }}>
                          <NextImage
                            src={src}
                            alt={`Venue image ${idx + 1}`}
                            fill
                            sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            quality={75}
                            loading="lazy"
                            placeholder="empty"
                            style={{ objectFit: "cover" }}
                            onError={(e) => console.error(`Venue image ${idx + 1} failed`, e)}
                          />
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              );
            }

            return null;
          })()} */}

          {/* Embedded Map */}
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
