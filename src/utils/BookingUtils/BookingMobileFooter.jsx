import { useState, useCallback } from "react";
import { Button, Alert } from "react-bootstrap";
import BookingFooterLayout from "../BookingFooterLayout";
import CustomDrawer from "../../utils/CustomDrawer"; // Adjust path as needed
import CustomBtn from "../CustomBtn";

const BookingMobileFooter = ({ handleClick, selectedTickets, step = 0, isLoading = false }) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const handleProceedClick = useCallback(() => {
    // Check if no tickets selected
    if (!selectedTickets?.quantity || parseInt(selectedTickets.quantity) === 0) {
      setShowDrawer(true);
    } else {
      handleClick();
    }
  }, [selectedTickets, handleClick]);
  return (
    <>
      <BookingFooterLayout
        left={
          <h6 className="p-0 m-0 " >
            Total: ₹
            {step == 2
              ? selectedTickets?.discount > 0
                ? (selectedTickets?.totalFinalAmount - selectedTickets?.discount)?.toLocaleString()
                : selectedTickets?.totalFinalAmount?.toLocaleString()
              : selectedTickets?.totalBaseAmount?.toLocaleString() || 0}
          </h6>
        }
        middle={<h6 className="p-0 m-0 " >Ticket: {selectedTickets?.quantity || 0}</h6>}
        right={
          // <Button
          //   onClick={handleProceedClick}
          //   className="btn-sm d-flex align-items-center justify-content-center gap-3"
          // >
          //   Proceed
          //   <i className="fa-solid fa-play"></i>
          // </Button>
          <CustomBtn HandleClick={handleProceedClick} size='sm' buttonText='Proceed' loading={isLoading} />
        }
      />

      {/* Custom Drawer for No Tickets Warning */}
      <CustomDrawer
        // title="No Tickets Selected"
        showOffcanvas={showDrawer}
        setShowOffcanvas={setShowDrawer}
      >
        <div className="">
          <Alert variant="warning" className="mb-3">
            <div className="d-flex align-items-start">
              <i className="fa-solid fa-triangle-exclamation me-2 mt-1"></i>
              <div>
                <strong>Please Select Tickets</strong>
              </div>
            </div>
          </Alert>

          <p className="mb-4" style={{ fontSize: '14px' }}>
            You need to select at least one ticket before proceeding to checkout.
          </p>

          <CustomBtn
            HandleClick={() => setShowDrawer(false)}
            size="sm"
            className="w-100"
            buttonText='Got it'
            hideIcon={true}
          />
        </div>
      </CustomDrawer>
    </>
  );
};

export default BookingMobileFooter;
