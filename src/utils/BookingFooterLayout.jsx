import StickyBottom from "./StickyBottom";

const BookingFooterLayout = ({ left, middle, right, center }) => (
  <StickyBottom>
    <div className="d-flex justify-content-between align-items-center w-100">
      {/* Left + Middle */}
      <div className="d-flex flex-column gap-1">
        {left}
        {middle}
      </div>

      {/* Center (only visible if passed) */}
      {center && (
        <div className="flex-grow-1 d-flex justify-content-center">
          {center}
        </div>
      )}

      {/* Right */}
      <div className="nxt-btn">
        {right}
      </div>
    </div>
  </StickyBottom>
);

export default BookingFooterLayout;
