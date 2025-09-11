import { Ticket } from "lucide-react";
import { MotionWrapper, TicketDataSummary } from "./checkout_utils";

export const OrderReviewSection = ({
  isMobile,
  validatedData,
  calculatedTotal,
  handleProcess,
  BookingMobileFooter,
  CustomBtn,
  Link,
  orderData
}) => {
  const eventName = validatedData?.event?.name || "Event Name";
  const ticketName = validatedData?.ticket?.name || "Ticket Name";
  const isSale = Number(validatedData?.ticket?.sale) === 1;
  const price = isSale ? validatedData?.ticket?.sale_price : validatedData?.ticket?.price;
  const quantity = validatedData?.data?.newQuantity || 0;
  const subTotal = orderData?.baseAmount || 0;
  const processingFee = orderData?.convenienceFees || 0;
  const total = orderData?.total || 0;
  return (
    <MotionWrapper
      variant="fadeInRight"
      delay={0.3}
      className="order_review-box rounded-3"
    >
      <div className="checkout-review-order shadow-sm overflow-hidden">

        <TicketDataSummary
          eventName={eventName}
          ticketName={ticketName}
          price={price}
          quantity={quantity}
          subTotal={subTotal}
          processingFee={processingFee}
          total={total}
        />
        <div className=" d-flex flex-column align-items-center p-4">
          <small className="text-center mb-2">
            Your personal data will be used to process your order, support your
            experience throughout this website, and for other purposes described
            in our <Link href="/extra/privacy-policy">privacy policy</Link>.
          </small>
          {isMobile ? (
            <BookingMobileFooter
              handleClick={handleProcess}
              selectedTickets={validatedData?.data}
            />
          ) : (
            <div className="d-flex align-items-center justify-content-between gap-3">
              <CustomBtn
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                variant="secondary"
                disabled={!validatedData?.data}
                HandleClick={() => window.history.back()}
                buttonText={"Back to Tickets"}
                icon={<i className="fa-solid fa-arrow-left"></i>}
              />
              <CustomBtn
                disabled={!validatedData?.data}
                HandleClick={handleProcess}
                buttonText={"Checkout"}
              />
            </div>
          )}
        </div>
      </div>
    </MotionWrapper>
  )
};
