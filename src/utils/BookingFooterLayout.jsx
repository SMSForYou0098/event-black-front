import StickyBottom from "./StickyBottom";

const BookingFooterLayout = ({ left, middle, right, center, children }) => (
  <StickyBottom>
    {children ? (
      children
    ) : (
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="d-flex flex-column gap-1">
          {left}
          {middle}
        </div>

        {center && (
          <div className="flex-grow-1 d-flex justify-content-center">
            {center}
          </div>
        )}

        <div className="nxt-btn">
          {right}
        </div>
      </div>
    )}
  </StickyBottom>
);

export default BookingFooterLayout;
