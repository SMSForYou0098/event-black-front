import { Fragment, memo } from "react";
import { Container, Row, Col, Card, Nav, Tab, Placeholder } from "react-bootstrap";
import { useHeaderSimple } from "@/Context/HeaderContext";

const EventDetailPageSkeleton = memo(() => {
  useHeaderSimple({
    title: "Loading Event...",
  });

  return (
    <Fragment>
      <div className="section-padding-top product-detail py-0 py-sm-4">
        <Container>
          {/* Details Header Skeleton */}
          <DetailsHeaderSkeleton />
          
          {/* Event Crew Skeleton */}
          <EventCrewSkeleton />
          
          {/* Tabs Section Skeleton */}
          <EventTabsSkeleton />
        </Container>
      </div>
    </Fragment>
  );
});

EventDetailPageSkeleton.displayName = "EventDetailPageSkeleton";

// Skeleton for DetailsHeader component
const DetailsHeaderSkeleton = () => {
  return (
    <Row>
      <Col lg="3" md="12" className="mb-4 mb-lg-0">
        {/* Image Skeleton */}
        <div className="product-image-container d-flex justify-content-center align-items-center">
          <Placeholder animation="glow">
            <Placeholder style={{ 
              width: '300px', 
              height: '400px', 
              borderRadius: '16px',
              backgroundColor: '#e9ecef'
            }} />
          </Placeholder>
        </div>
      </Col>
      <Col lg="9" md="12" className="ps-lg-4">
        {/* Title Skeleton */}
        <div className="d-flex justify-content-between mb-3">
          <Placeholder animation="glow">
            <Placeholder xs={8} size="lg" bg="secondary" />
          </Placeholder>
          <Placeholder animation="glow">
            <Placeholder xs={2} bg="secondary" />
          </Placeholder>
        </div>

        {/* About Section Skeleton */}
        <Placeholder animation="glow" className="mb-3">
          <Placeholder xs={3} bg="primary" />
        </Placeholder>
        
        {/* Description Skeleton */}
        <div className="mb-4">
          <Placeholder animation="glow">
            <Placeholder xs={12} bg="secondary" className="mb-2" />
            <Placeholder xs={10} bg="secondary" className="mb-2" />
            <Placeholder xs={11} bg="secondary" className="mb-2" />
            <Placeholder xs={8} bg="secondary" />
          </Placeholder>
        </div>

        {/* Meta Info Skeleton */}
        <Row className="mb-4">
          {[1, 2, 3, 4].map((item) => (
            <Col key={item} md={6} className="mb-3">
              <div className="d-flex align-items-center">
                <Placeholder animation="glow">
                  <Placeholder xs={1} bg="secondary" className="me-2" />
                </Placeholder>
                <div>
                  <Placeholder animation="glow">
                    <Placeholder xs={6} bg="secondary" size="sm" />
                    <Placeholder xs={8} bg="secondary" className="mt-1" />
                  </Placeholder>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Other Locations Skeleton */}
        <Placeholder animation="glow">
          <Placeholder xs={4} bg="secondary" className="mb-2" />
          <Placeholder xs={12} bg="secondary" style={{ height: '40px', borderRadius: '8px' }} />
        </Placeholder>
      </Col>
    </Row>
  );
};

// Skeleton for EventCrew component
const EventCrewSkeleton = () => {
  return (
    <div className="event-crew-section my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Placeholder animation="glow">
          <Placeholder xs={4} bg="secondary" size="lg" />
        </Placeholder>
        <Placeholder animation="glow">
          <Placeholder xs={3} bg="secondary" size="sm" />
        </Placeholder>
      </div>
      
      <Row className="g-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <Col key={item} xs={6} sm={4} md={3} lg={2}>
            <div className="text-center">
              <Placeholder animation="glow" className="mb-3">
                <Placeholder 
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%',
                    backgroundColor: '#e9ecef'
                  }} 
                />
              </Placeholder>
              <Placeholder animation="glow">
                <Placeholder xs={7} bg="secondary" className="mb-1" />
                <Placeholder xs={5} bg="secondary" size="sm" />
              </Placeholder>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Skeleton for EventTabs component
const EventTabsSkeleton = () => {
  const tabItems = [
    { key: "description", label: "Description" },
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
                <Placeholder animation="glow">
                  <Placeholder 
                    style={{ 
                      width: '100px', 
                      height: '40px', 
                      borderRadius: '20px',
                      backgroundColor: '#e9ecef'
                    }} 
                  />
                </Placeholder>
              </Nav.Item>
            ))}
          </Nav>

          <Tab.Content className="tab-content">
            {/* Description Tab Skeleton */}
            <Tab.Pane eventKey="description" className="p-4 rounded">
              <Row>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                      <Placeholder animation="glow">
                        <Placeholder xs={12} bg="secondary" className="mb-2" />
                        <Placeholder xs={12} bg="secondary" className="mb-2" />
                        <Placeholder xs={12} bg="secondary" className="mb-2" />
                        <Placeholder xs={10} bg="secondary" className="mb-2" />
                        <Placeholder xs={11} bg="secondary" className="mb-2" />
                        <Placeholder xs={9} bg="secondary" className="mb-2" />
                        <Placeholder xs={12} bg="secondary" className="mb-2" />
                        <Placeholder xs={8} bg="secondary" />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Event Info Tab Skeleton */}
            <Tab.Pane eventKey="additional-info" className="p-4 rounded">
              <Row className="g-3">
                <Col md="6">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <Placeholder animation="glow">
                        <Placeholder xs={4} bg="primary" className="mb-2" />
                        <Placeholder xs={8} bg="secondary" />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="6">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <Placeholder animation="glow">
                        <Placeholder xs={4} bg="primary" className="mb-2" />
                        <Placeholder xs={10} bg="secondary" className="mb-1" />
                        <Placeholder xs={9} bg="secondary" className="mb-1" />
                        <Placeholder xs={8} bg="secondary" />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md="12">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <Placeholder animation="glow">
                        <Placeholder xs={4} bg="primary" className="mb-2" />
                        <Placeholder xs={10} bg="secondary" className="mb-3" />
                        <Placeholder 
                          style={{ 
                            width: '100%', 
                            height: '200px', 
                            borderRadius: '8px',
                            backgroundColor: '#e9ecef'
                          }} 
                        />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>

            {/* Organizer Tab Skeleton */}
            <Tab.Pane eventKey="organizer" className="p-4 rounded">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Placeholder animation="glow">
                    <Placeholder xs={5} bg="primary" className="mb-4" />
                    
                    <Row className="g-3">
                      {[1, 2, 3].map((item) => (
                        <Col sm="6" key={item}>
                          <div className="d-flex align-items-center">
                            <Placeholder animation="glow">
                              <Placeholder xs={1} bg="secondary" className="me-2" />
                            </Placeholder>
                            <div>
                              <Placeholder animation="glow">
                                <Placeholder xs={4} bg="secondary" size="sm" className="mb-1" />
                                <Placeholder xs={7} bg="secondary" />
                              </Placeholder>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Placeholder>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Terms Tab Skeleton */}
            <Tab.Pane eventKey="terms" className="p-4 rounded">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Placeholder animation="glow">
                    <Placeholder xs={4} bg="primary" className="mb-4" />
                    <Placeholder xs={12} bg="secondary" className="mb-2" />
                    <Placeholder xs={12} bg="secondary" className="mb-2" />
                    <Placeholder xs={10} bg="secondary" className="mb-2" />
                    <Placeholder xs={11} bg="secondary" className="mb-2" />
                    <Placeholder xs={9} bg="secondary" />
                  </Placeholder>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
};

export default EventDetailPageSkeleton;