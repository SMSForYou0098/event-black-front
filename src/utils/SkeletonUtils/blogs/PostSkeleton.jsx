import React from 'react';
import { Container, Row, Col, Card, Placeholder } from 'react-bootstrap';

const PostSkeleton = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col md={12} lg={12}>
          <Card className="border-0 shadow-sm">
            {/* Title placeholder */}
            <Card.Body className="p-4">
              <Placeholder as={Card.Title} animation="glow" className="mb-3">
                <Placeholder xs={10} size="lg" />
                <Placeholder xs={8} />
              </Placeholder>
              
              {/* Thumbnail placeholder */}
              <Placeholder animation="glow" className="mb-4">
                <Placeholder style={{ 
                  height: '400px', 
                  width: '100%', 
                  display: 'block',
                  borderRadius: '4px'
                }} />
              </Placeholder>
              
              {/* Category badges placeholder */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Placeholder as={Card.Text} animation="glow">
                  <Placeholder style={{width:'3rem'}}  xs={2} size="sm" />
                  <Placeholder style={{width:'3rem'}} xs={2} size="sm" className="ms-2" />
                  <Placeholder style={{width:'3rem'}} xs={2} size="sm" className="ms-2" />
                </Placeholder>
              </div>
              
              {/* Meta info placeholder */}
              <div className="text-muted mb-4 d-flex align-items-center gap-3 flex-wrap">
                <Placeholder animation="glow">
                  <Placeholder xs={3} size="sm" />
                </Placeholder>
                <Placeholder animation="glow">
                  <Placeholder xs={4} size="sm" />
                </Placeholder>
                <Placeholder animation="glow">
                  <Placeholder xs={2} size="sm" />
                </Placeholder>
              </div>
              
              {/* Content placeholder */}
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={12} />
                <Placeholder xs={10} />
                <Placeholder xs={11} />
                <Placeholder xs={9} />
                <Placeholder xs={12} className="mt-3" />
                <Placeholder xs={10} />
                <Placeholder xs={8} />
                <Placeholder xs={11} className="mt-3" />
                <Placeholder xs={7} />
                <Placeholder xs={9} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostSkeleton;