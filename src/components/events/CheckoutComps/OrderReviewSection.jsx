import { MotionWrapper } from "./checkout_utils";

export const OrderReviewSection = ({
  isMobile,
  validatedData,
  handleProcess,
  BookingMobileFooter,
  CustomBtn,
  Link,
}) => (
  <MotionWrapper
    variant="fadeInRight"
    delay={0.3}
    className="order_review-box border rounded-3 p-4 mt-2"
  >
    <div className="checkout-review-order">
      <h5 className="mb-4 font-size-18 fw-500">Your Order</h5>
      <div className="order-summary order-summary-theme p-3 rounded-3 mb-3">
        <div className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>
          {validatedData?.event?.name}
        </div>
        <div className="mb-2" style={{ fontSize: "1rem" }}>
          {validatedData?.ticket?.name}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted" style={{ fontSize: "0.95rem" }}>
            {validatedData?.data?.newQuantity} ticket
            {validatedData?.data?.newQuantity > 1 ? "s" : ""}
          </span>
          <span className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
            ₹{validatedData?.ticket?.sale_price || validatedData?.ticket?.price}
          </span>
        </div>
      </div>
      <div className="checkout-payment">
        <p>
          Your personal data will be used to process your order, support your
          experience throughout this website, and for other purposes described
          in our <Link href="/extra/privacy-policy">privacy policy</Link>.
        </p>
        {isMobile ? (
          <BookingMobileFooter
            handleClick={handleProcess}
            selectedTickets={validatedData?.data}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-between gap-3">
            <CustomBtn
              style={{background: 'rgba(255, 255, 255, 0.1)'}}
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
);
