import React,{ memo } from 'react'
import { Placeholder } from 'react-bootstrap';

const CardStyleSkeleton = memo(() => (
    <div className="iq-card card-hover" style={{ minHeight: '450px' }}>
      <div className="block-images position-relative w-100">
        <div className="img-box w-100" style={{ minHeight: '400px' }}>
          <Placeholder 
            animation="glow"
            className="w-100 h-100"
            style={{ 
              minHeight: '400px',
              backgroundColor: '#343a40',
              borderRadius: '8px'
            }}
          >
            <Placeholder 
              xs={12} 
              style={{ 
                height: '400px',
                backgroundColor: '#495057',
                opacity: 0.8
              }}
              className="img-fluid object-cover w-100 d-block border-0 rounded"
            />
          </Placeholder>
        </div>
        
        <div className="card-description with-transition p-3">
          <div className="cart-content">
            <div className="content-left">
              {/* Title skeleton */}
              <div className="mb-3">
                <Placeholder animation="glow">
                  <div className="d-flex align-items-center mb-2">
                    <Placeholder 
                      style={{ 
                        width: '30px', 
                        height: '20px',
                        backgroundColor: '#6c757d',
                        borderRadius: '4px'
                      }}
                      className="me-2"
                    />
                    <Placeholder 
                      style={{ 
                        width: '60%', 
                        height: '24px',
                        backgroundColor: '#495057',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </Placeholder>
              </div>
              
              {/* Date/time skeleton */}
              <div className="movie-time d-flex align-items-center my-3">
                <Placeholder animation="glow">
                  <Placeholder 
                    style={{ 
                      width: '40%', 
                      height: '16px',
                      backgroundColor: '#6c757d',
                      borderRadius: '3px'
                    }}
                  />
                </Placeholder>
              </div>
              
              {/* Price skeleton */}
              <div className="movie-price">
                <Placeholder animation="glow">
                  <Placeholder 
                    style={{ 
                      width: '25%', 
                      height: '20px',
                      backgroundColor: '#495057',
                      borderRadius: '4px'
                    }}
                  />
                </Placeholder>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ));

  CardStyleSkeleton.displayName = 'CardStyleSkeleton';
  export default CardStyleSkeleton;