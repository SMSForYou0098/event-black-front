import Link from "next/link";
import React from "react";

const ExpiredEvent = () => {
  return (
    <>
      <div className="d-flex flex-column">
        <div
          className="alert alert-danger"
          style={{ background: "#fff5f5", border: "1px solid #f8d7da" }}
        >
          <h5 className="fw-bold mb-2 text-danger">Event Has Concluded</h5>
          <div className="">
            This event has already taken place and is no longer available for
            booking. Check out our other upcoming events or browse similar
            events in your area.
          </div>
        </div>
        <div className="d-flex justify-content-center gap-3">
          <Link
            to="/events"
            className="w-50 float-center rounded btn btn-primary mt-2 px-4 fw-semibold"
          >
            View Events
          </Link>
          <Link
            to="/"
            className="w-50 float-center rounded btn btn-secondary mt-2 px-4 fw-semibold"
          >
            Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default ExpiredEvent;
