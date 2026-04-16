import { Ticket } from "lucide-react";
import NextImage from "next/image";
import React, { useCallback, useRef, useState } from "react";
import { Button, ButtonGroup, Card, Col, Nav, Row, Tab } from "react-bootstrap";
import CustomBtn from "../../../utils/CustomBtn";
import { useMyContext } from "../../../Context/MyContextProvider";

const EventTabs = ({ eventData }) => {
  const { formatDateRange, convertTo12HourFormat } = useMyContext();
  const tabItems = [
    { key: "description", label: "Description" },
    { key: "location", label: "Locate" },
    { key: "layout", label: "Layout" },
    // { key: "additional-info", label: "Event Info" },
    // { key: "organizer", label: "Organizer" },
    // { key: "terms", label: "Terms" },
  ];
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const lastTouchDist = useRef(null);
  const containerRef = useRef(null);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;

  // ── Zoom helpers ──────────────────────────────────────────────
  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const zoomIn = () => setScale((s) => clampScale(s + 0.25));
  const zoomOut = () => setScale((s) => clampScale(s - 0.25));
  const reset = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  // ── Mouse wheel zoom ──────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setScale((s) => clampScale(s + delta));
  }, []);

  // ── Mouse drag pan ────────────────────────────────────────────
  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
  };
  const onMouseMove = (e) => {
    if (!isDragging || !dragStart.current) return;
    setTranslate({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => { setIsDragging(false); dragStart.current = null; };

  // ── Touch: pinch-zoom + pan ───────────────────────────────────
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      dragStart.current = {
        x: e.touches[0].clientX - translate.x,
        y: e.touches[0].clientY - translate.y,
      };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastTouchDist.current != null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (dist - lastTouchDist.current) * 0.01;
      setScale((s) => clampScale(s + delta));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && dragStart.current) {
      setTranslate({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    }
  };
  const onTouchEnd = () => { lastTouchDist.current = null; dragStart.current = null; };

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
                    <Card.Body >
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
              {/* Date Range and Timings */}
              {/* <Row className="g-3">
                <Col md="4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2" style={{ fontSize: '14px' }}>
                        <i className="fa fa-calendar me-2"></i>Date Range
                      </h6>
                      <p className="mb-0" style={{ fontSize: '14px' }}>
                        {formatDateRange(eventData?.date_range)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2" style={{ fontSize: '14px' }}>
                        <i className="fa fa-clock me-2"></i>Timings
                      </h6>
                      <Row className="mb-0">
                        <Col xs={4}>
                          <span style={{ fontSize: '14px' }}><strong>Entry:</strong> {convertTo12HourFormat(eventData?.entry_time)}</span> <br />

                        </Col>
                        <Col xs={4}>
                          <span style={{ fontSize: '14px' }}><strong>Start:</strong> {convertTo12HourFormat(eventData?.start_time)}</span> <br />

                        </Col>
                        <Col xs={4}>
                          <span style={{ fontSize: '14px' }}><strong>End:</strong> {convertTo12HourFormat(eventData?.end_time)}</span>
                        </Col>
                      </Row>

                    </Card.Body>
                  </Card>
                </Col>
                <Col md="4">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-primary mb-2" style={{ fontSize: '14px' }}>
                        <i className="fa fa-map-marker-alt me-2"></i>
                        Location
                      </h6>
                      <p className="mb-3" style={{ fontSize: '14px' }}>
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
              </Row> */}
            </Tab.Pane>
            <Tab.Pane eventKey="layout" className="p-4 rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      {typeof eventData?.eventMedia?.layout_image === "string" ? (
                        <div>
                          {/* ── Zoom controls ── */}
                          {/* <div
                            className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 py-2 border-bottom gap-2"
                            style={{ userSelect: "none" }}
                          >
                            <small className="text-muted d-none d-md-block">
                              Scroll to zoom · Drag to pan · Pinch on mobile
                            </small>
                            <small className="text-muted d-md-none text-center" style={{ fontSize: '11px' }}>
                              Pinch to zoom · Drag to pan
                            </small>
                            <div className="d-flex align-items-center gap-2 justify-content-center w-100" style={{ maxWidth: '300px' }}>
                              <div className="d-flex border border-secondary rounded-3 overflow-hidden flex-fill">
                                <CustomBtn
                                  variant="dark"
                                  size="sm"
                                  HandleClick={zoomOut}
                                  buttonText="−"
                                  wrapperClassName="flex-fill m-0 p-0"
                                  className="border-0 rounded-0 w-100 h-100"
                                  hideIcon={true}
                                  style={{ padding: '4px 0' }}
                                />
                                <div className="d-flex align-items-center justify-content-center px-1 border-start border-end border-secondary" style={{ minWidth: 55, fontSize: '12px' }}>
                                  {Math.round(scale * 100)}%
                                </div>
                                <CustomBtn
                                  variant="dark"
                                  size="sm"
                                  HandleClick={zoomIn}
                                  buttonText="+"
                                  wrapperClassName="flex-fill m-0 p-0"
                                  className="border-0 rounded-0 w-100 h-100"
                                  hideIcon={true}
                                  style={{ padding: '4px 0' }}
                                />
                              </div>
                              <CustomBtn
                                variant="outline-secondary"
                                size="sm"
                                HandleClick={reset}
                                buttonText="↺ Reset"
                                className="border-0 shadow-sm"
                                hideIcon={true}
                              />
                            </div>
                          </div> */}

                          {/* ── Scrollable viewport ── */}
                          <div
                            ref={containerRef}
                            onWheel={onWheel}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            style={{
                              overflow: "hidden",
                              position: "relative",
                              width: "100%",
                              height: "clamp(250px, 50vh, 700px)", // adjusted for smaller screens
                              cursor: isDragging ? "grabbing" : "grab",
                              touchAction: "none", // disables browser default touch so pinch works
                              backgroundColor: "#00000003"
                            }}
                          >
                            {/* ── Transformed image wrapper ── */}
                            <div
                              className="d-flex align-items-center justify-content-center w-100 h-100"
                              style={{
                                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                                transformOrigin: "center center",
                                transition: isDragging ? "none" : "transform 0.15s ease",
                                willChange: "transform",
                              }}
                            >
                              <NextImage
                                src={eventData.eventMedia.layout_image}
                                alt="Event layout image"
                                width={800}
                                height={800}
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                style={{
                                  maxHeight: "100%",
                                  maxWidth: "100%",
                                  objectFit: "contain",
                                  pointerEvents: "none", // prevents image drag interfering with pan
                                  userSelect: "none",
                                }}
                                onError={(e) => console.error("Image failed to load", e)}
                                priority={false}
                                draggable={false}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-muted" style={{ fontSize: "14px" }}>
                          No layout image available.
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            <Tab.Pane eventKey="location" className="rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      {eventData?.venue?.aembeded_code ? (
                        <div
                          className="w-100"
                          dangerouslySetInnerHTML={{
                            __html: eventData.venue.aembeded_code.replace(
                              /width="[^"]*"/,
                              'width="100%"'
                            ),
                          }}
                        />
                      ) : (
                        <div className="p-3 text-muted text-center" style={{ fontSize: '14px' }}>No map available for this venue.</div>
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