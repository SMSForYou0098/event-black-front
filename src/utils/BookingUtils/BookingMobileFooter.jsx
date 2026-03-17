import { useState, useCallback } from "react";
import { Button, Alert } from "react-bootstrap";
import Image from "next/image";
import BookingFooterLayout from "../BookingFooterLayout";
import CustomDrawer from "../CustomDrawer";
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

      {/* Select Ticket Warning Drawer (mobile) */}
      <CustomDrawer
        showOffcanvas={showDrawer}
        setShowOffcanvas={setShowDrawer}
      >
        <div className="text-center">
          <Image
            src="/assets/images/event_page/select-ticket.webp"
            alt="Please select tickets"
            width={300}
            height={200}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <div className="mt-3">
            <CustomBtn
              HandleClick={() => setShowDrawer(false)}
              size="sm"
              className="w-100"
              buttonText="Got it"
              hideIcon={true}
            />
          </div>
        </div>
      </CustomDrawer>
    </>
  );
};

export default BookingMobileFooter;
