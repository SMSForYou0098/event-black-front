import { Ticket } from "lucide-react";
import { MotionWrapper, TicketDataSummary } from "./checkout_utils";

export const OrderReviewSection = ({
  isMobile,
  validatedData,
  summayData,
  calculatedTotal,
  handleProcess,
  BookingMobileFooter,
  CustomBtn,
  Link,
  orderData,
  isLoading
}) => {
  const eventName = validatedData?.event?.name || "Event Name";
  const ticketName = validatedData?.data?.category || "Ticket Name";
  const isSale = Number(validatedData?.data?.sale) === 1;
  const price = isSale ? validatedData?.data?.sale_price : validatedData?.data?.price;
  const quantity = validatedData?.data?.quantity || 0;
  const subTotal = validatedData?.data?.baseAmount || 0;
  const processingFee = validatedData?.data?.totalConvenienceFee || 0;
  const total = validatedData?.data?.totalFinalAmount || 0;
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
          <div className="d-block d-sm-none">
            <BookingMobileFooter
              handleClick={handleProcess}
              selectedTickets={validatedData?.data}
            />
          </div>
          <div className="d-none d-sm-block">
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
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </MotionWrapper>
  )
};
