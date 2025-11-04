import { Ticket } from "lucide-react";
import { MotionWrapper, PromoCodeSection, TicketDataSummary } from "./checkout_utils";
import { Form } from "react-bootstrap";

export const OrderReviewSection = (props) => {
  const {
    isMobile,
    validatedData,
    summaryData,
    handleProcess,
    BookingMobileFooter,
    CustomBtn,
    Link,
    isLoading
  } = props
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
        <PromoCodeSection {...props}/>
        <div className=" d-flex flex-column align-items-center ">
          <Form.Check className="d-flex align-items-center gap-2 m-0">
            <Form.Check.Input type="checkbox" defaultChecked />
            <Form.Check.Label className="m-0">
              <small className="text-center m-0">
                I agree to the <Link href='/pricing-policy'>Pricing Policy</Link>, <Link href='terms-and-conditions'>Terms & Conditions</Link> & <Link href='/privacy-policy'>Privacy Policy</Link>.
              </small>
            </Form.Check.Label>
          </Form.Check>
          <div className="d-block d-sm-none">
            <BookingMobileFooter
              handleClick={handleProcess}
              selectedTickets={validatedData?.data}
            />
          </div>
          
          <div className="d-none d-sm-block">
            <div className="d-flex align-items-center justify-content-between mt-2 gap-3">
              <CustomBtn
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                variant="secondary"
                disabled={!validatedData?.data}
                HandleClick={() => window.history.back()}
                buttonText={"Back"}
                icon={<i className="fa-solid fa-arrow-left"></i>}
              />
              <CustomBtn
                disabled={isLoading}
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
