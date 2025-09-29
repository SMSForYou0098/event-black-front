import { memo } from 'react';

const PopularEvents = memo(() => {
  return (
    <section className="py-5">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="mb-0">Popular Events</h2>
          <a href="/events" className="btn btn-outline-primary">View All</a>
        </div>
        
        <div className="row g-4">
          {/* Sample events - Replace with your actual data */}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm hover-translate-y">
                <div className="position-relative">
                  <img 
                    src={`/public/assets/images/sample-event-${i + 1}.jpg`} 
                    alt="Event" 
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-primary">Popular</span>
                  </div>
                </div>
                <div className="card-body">
                  <h5 className="card-title">Popular Event {i + 1}</h5>
                  <p className="card-text text-muted mb-2">
                    Join us for an amazing experience
                  </p>
                  <small className="text-primary">
                    Starting from $49
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

PopularEvents.displayName = 'PopularEvents';
export default PopularEvents;