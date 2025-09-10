import { Ticket } from "lucide-react";
import { MotionWrapper } from "./checkout_utils";

export const OrderReviewSection = ({
  isMobile,
  validatedData,
  calculatedTotal,
  handleProcess,
  BookingMobileFooter,
  CustomBtn,
  Link,
}) => (
  <MotionWrapper
    variant="fadeInRight"
    delay={0.3}
    className="order_review-box rounded-3"
  >
    <div className="checkout-review-order shadow-sm overflow-hidden">
      <div className="rounded-4" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="title d-flex justify-content-center p-4">
          <h4 className="mb-4 fw-500 text-center border-bottom  pb-2 text-primary border-primary">Your Order</h4>
        </div>

        <div className="p-4">
          {/* Event Name and Price */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="fs-5 fw-bold text-white">
              {validatedData?.event?.name}
            </div>
            <div className="fs-5 fw-bold text-primary">
              ₹{validatedData?.data?.subtotal}
            </div>
          </div>

          {/* Ticket Type with Crown Icon INLINE */}
          <div className="d-flex align-items-center mb-4">
            <span className="me-2 fs-6">👑</span>
            <span className="fs-6 text-warning">
              {validatedData?.ticket?.name}
            </span>
          </div>

          {/* Tickets Count */}
          <div style={{ background: '#141314' }} className="d-flex justify-content-between align-items-center  p-3 rounded-4">
            <div className="d-flex align-items-center">
              <span className="p-0 m-0 ms-2 fw-semibold d-flex"><Ticket size={20} /></span>
              <span className="p-0 m-0 ms-2 text-warning">Tickets</span>
            </div>
            <span className="fs-6 fw-bold text-white">
              {validatedData?.data?.newQuantity}
            </span>
          </div>

          {/* Another Separator Line */}
          <hr className="border-secondary my-4" />

          {/* Total */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="fs-5 fw-bold text-white">
              Total
            </div>
            <div className="fs-5 fw-bold text-end">
              ₹{calculatedTotal}
              <br />
              <small className="text-muted" style={{ fontSize: "0.95rem", marginTop: "-2px", display: "inline-block" }}>
                Includes taxes
              </small>
            </div>
          </div>
        </div>
      </div>
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
);
