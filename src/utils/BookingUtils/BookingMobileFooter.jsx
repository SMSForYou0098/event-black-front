import { Button } from "react-bootstrap";
import BookingFooterLayout from "../BookingFooterLayout";

const BookingMobileFooter = ({ handleClick, selectedTickets }) => (
  <BookingFooterLayout
    left={<h5 className="p-0 m-0 fw-bold">Total: ₹{selectedTickets?.grandTotal || 0}</h5>}
    middle={<span style={{ fontSize: "0.9rem" }}>{selectedTickets?.quantity || 0} Tickets Selected</span>}
    right={
      <Button
        disabled={
          !selectedTickets?.quantity ||
          parseInt(selectedTickets.quantity) === 0
        }
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
