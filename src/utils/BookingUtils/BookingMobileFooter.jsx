import { Button } from "react-bootstrap";
import BookingFooterLayout from "../BookingFooterLayout";

const BookingMobileFooter = ({ handleClick , selectedTickets }) => (
  <BookingFooterLayout
    left={<h5 className="p-0 m-0 fw-bold">Total: ₹ {selectedTickets?.subtotal || 0}</h5>}
    middle={<span style={{ fontSize: "0.9rem" }}>{selectedTickets?.newQuantity || 0} Tickets Selected</span>}
    right={
      <Button
        disabled={!selectedTickets?.itemId}
        onClick={handleClick}
        className="btn-lg d-flex align-items-center justify-content-center gap-3"
      >
        Next
        <i className="fa-solid fa-play"></i>
      </Button>
    }
  />
);

export default BookingMobileFooter;
