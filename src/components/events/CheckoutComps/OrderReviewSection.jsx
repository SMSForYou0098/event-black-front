import { MotionWrapper } from "./checkout_utils";

export const OrderReviewSection = ({ 
  isMobile, 
  validatedData, 
  handleProcess, 
  BookingMobileFooter, 
  CustomBtn,
  Link 
}) => (
  <MotionWrapper
    variant="fadeInRight"
    delay={0.3}
    className="order_review-box border rounded-3 p-4 mt-2"
  >
    <div className="checkout-review-order">
      <div className="checkout-payment">
        <p>
          Your personal data will be used to process your order,
          support your experience throughout this website, and for
          other purposes described in our{" "}
          <Link href="/extra/privacy-policy">privacy policy</Link>.
        </p>
        {isMobile ? (
          <BookingMobileFooter
            handleClick={handleProcess}
            selectedTickets={validatedData?.data}
          />
        ) : (
          <CustomBtn
            disabled={!validatedData?.data}
            HandleClick={handleProcess}
            buttonText={"Checkout"}
          />
        )}
      </div>
    </div>
  </MotionWrapper>
);