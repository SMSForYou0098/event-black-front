import CardStyleSkeleton from "./CardStyleSkeleton";
import React,{ memo } from 'react'
import { Placeholder } from 'react-bootstrap';

// Enhanced Skeleton loading component with better visibility
  const SkeletonLoader = memo(() => (
    <div className="skeleton-container p-4">
      {/* Header skeleton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Placeholder animation="glow">
          <Placeholder 
            style={{ 
              width: '200px', 
              height: '32px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px'
            }}
          />
        </Placeholder>
        <div className="d-flex gap-2">
          <Placeholder animation="glow">
            <Placeholder 
              style={{ 
                width: '40px', 
                height: '40px',
                backgroundColor: '#495057',
                borderRadius: '50%'
              }}
            />
          </Placeholder>
          <Placeholder animation="glow">
            <Placeholder 
              style={{ 
                width: '40px', 
                height: '40px',
                backgroundColor: '#495057',
                borderRadius: '50%'
              }}
            />
          </Placeholder>
        </div>
      </div>
      
      {/* Cards grid skeleton */}
      <div className="row">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={`skeleton-${index}`} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-4">
            <CardStyleSkeleton />
          </div>
        ))}
      </div>
    </div>
  ));

  SkeletonLoader.displayName = 'SkeletonLoader';
  export default SkeletonLoader;