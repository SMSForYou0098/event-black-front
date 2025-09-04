import React from "react";
import StickyBottom from "../StickyBottom";
import { Button } from "react-bootstrap";
import Link from "next/link";

const BookingMobileFooter = ({}) => {
  return (
    <StickyBottom>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex flex-column gap-1">
          <h5 className="p-0 m-0 fw-bold">Total: ₹1500</h5>
          <span style={{ fontSize: "0.9rem" }}>
            2 Tickets Selected
          </span>
        </div>
        <div className="nxt-btn">
          <Button
            className="btn-lg d-flex align-items-center justify-content-center gap-3"
          >
            Next
            <i className="fa-solid fa-play"></i>
          </Button>
        </div>
      </div>
    </StickyBottom>
  );
};

export default BookingMobileFooter;
