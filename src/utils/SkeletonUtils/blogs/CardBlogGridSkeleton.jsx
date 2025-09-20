import React from 'react';
import { Card, Placeholder, Row, Col } from 'react-bootstrap';

const CardBlogGridSkeleton = ({ count = 6, columns = 3 }) => {
  // Calculate how many rows we need
  const rows = Math.ceil(count / columns);
  
  return (
    <Row>
      {[...Array(count)].map((_, index) => (
        <Col 
          key={index} 
          lg={12 / columns} 
          md={6} 
          sm={12} 
          className="mb-4"
        >
          <Card className="h-100 border-0 iq-blog-box">
            <div className="iq-blog-image border-0 clearfix mb-1">
              <Placeholder animation="glow">
                <Placeholder 
                  style={{ 
                    height: '240px', 
                    width: '100%',
                    borderRadius: '8px',
                    display: 'block'
                  }} 
                />
              </Placeholder>
              <div className="iq-blog-meta d-flex position-absolute bottom-0 start-0 z-2 mx-2">
                <Placeholder animation="glow">
                  <Placeholder 
                    xs={3} 
                    style={{ height: '24px', width:'3rem', borderRadius: '4px' }} 
                    className="me-1" 
                  />
                  <Placeholder 
                    xs={3} 
                    style={{ height: '24px', width:'3rem', borderRadius: '4px' }} 
                  />
                </Placeholder>
              </div>
            </div>
            <div className="iq-blog-detail px-2">
              <div className="blog-title mb-2">
                <Placeholder animation="glow" as="h5">
                  <Placeholder xs={10} style={{ height: '24px' }} />
                </Placeholder>
              </div>
              <div className="mb-2">
                <div className="iq-button link-button d-flex justify-content-between">
                  <small className="d-flex align-items-center gap-2">
                    <Placeholder animation="glow">
                      <Placeholder xs={4} style={{ height: '16px' }} />
                    </Placeholder>
                  </small>
                  <small className="d-flex align-items-center gap-2">
                    <Placeholder animation="glow">
                      <Placeholder xs={5} style={{ height: '16px' }} />
                    </Placeholder>
                  </small>
                </div>
                <Placeholder animation="glow">
                  <Placeholder 
                    xs={12} 
                    style={{ height: '38px', borderRadius: '8px' }} 
                    className="mt-2"
                  />
                </Placeholder>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

CardBlogGridSkeleton.displayName = "CardBlogGridSkeleton";
export default CardBlogGridSkeleton;