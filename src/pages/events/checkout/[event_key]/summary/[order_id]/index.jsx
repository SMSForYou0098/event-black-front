import { PartyPopper } from "lucide-react";
import React, { memo } from "react";
import { Container, Table, Row, Col, Button } from "react-bootstrap";

// Constants
const ARROW_ICON = (
  <svg
    width="25"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 21.2498C17.108 21.2498 21.25 17.1088 21.25 11.9998C21.25 6.89176 17.108 2.74976 12 2.74976C6.892 2.74976 2.75 6.89176 2.75 11.9998C2.75 17.1088 6.892 21.2498 12 21.2498Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5576 15.4709L14.0436 11.9999L10.5576 8.52895"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CHECKOUT_STEPS = [
  { number: 1, title: "Shopping Cart", active: false },
  { number: 2, title: "Checkout", active: false },
  { number: 3, title: "Order Summary", active: true },
];

const ORDER_DETAILS = {
  orderNumber: "15823",
  date: "June 22, 2022",
  email: "jondoe@gmail.com",
  total: 25.0,
  paymentMethod: "Direct bank transfer",
};

const ORDER_ITEMS = [
  {
    id: 1,
    name: "Bag Pack",
    quantity: 1,
    price: 25.0,
  },
];

const BILLING_ADDRESS = {
  name: "test",
  company: "test",
  country: "US",
  address: "dccc",
  email: "jondoe@gmail.com",
  phone: "96465216515",
};

// Components
const CheckoutStepItem = ({ step, isLast }) => (
  <>
    <li className={`cart-page-item ${step.active ? "active" : ""}`}>
      <span
        className={`cart-pre-number border-radius rounded-circle me-1 ${
          step.active ? "cart-pre-heading badge bg-primary" : ""
        }`}
      >
        {step.number}
      </span>
      <span className="cart-page-link">{step.title}</span>
    </li>
    {!isLast && <li className="cart-page-item">{ARROW_ICON}</li>}
  </>
);

const OrderDetailItem = ({ label, value, strong = true }) => (
  <li className="detail">
    {label}:{strong ? <strong>{value}</strong> : value}
  </li>
);

const OrderItem = ({ item }) => (
  <tr className="order_item">
    <td>
      {item.name}{" "}
      <strong className="product-quantity">×&nbsp;{item.quantity}</strong>
    </td>
    <td className="text-end">
      <span className="amount">
        <bdi>
          <span>$</span>
          {item.price.toFixed(2)}
        </bdi>
      </span>
    </td>
  </tr>
);

const PriceDisplay = ({ amount, className = "amount text-primary" }) => (
  <span className={className}>
    <span>$</span>
    {amount.toFixed(2)}
  </span>
);

const BillingRow = ({ label, value }) => (
  <tr>
    <td className="label-name">{label}</td>
    <td className="seprator">
      <span>:</span>
    </td>
    <td className="last-name">{value}</td>
  </tr>
);

const TrackOrderPage = () => {
  //   useBreadcrumb('Order Tracking');

  const subtotal = ORDER_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <section className="section-padding">
      <Container>
        {/* Progress Steps */}
        <div className="main-cart pb-0 pb-md-3">
          <ul className="cart-page-items d-flex justify-content-center list-inline align-items-center gap-3 gap-md-5 flex-wrap">
            {CHECKOUT_STEPS.map((step, index) => (
              <CheckoutStepItem
                key={step.number}
                step={step}
                isLast={index === CHECKOUT_STEPS.length - 1}
              />
            ))}
          </ul>
        </div>

        {/* Order Confirmation */}
        <div className="order">
          <p className="thank">Thank you. Your booking has been confirmed.</p>
          <ul className="details list-inline">
            <OrderDetailItem
              label="ORDER NUMBER"
              value={ORDER_DETAILS.orderNumber}
            />
            <OrderDetailItem label="DATE" value={ORDER_DETAILS.date} />
            <OrderDetailItem label="EMAIL" value={ORDER_DETAILS.email} />
            <OrderDetailItem
              label="TOTAL"
              value={`$${ORDER_DETAILS.total.toFixed(2)}`}
            />
            <OrderDetailItem
              label="PAYMENT METHOD"
              value={ORDER_DETAILS.paymentMethod}
            />
          </ul>
        </div>

        <h5 className="order_details">Order Details</h5>

        <Row>
          {/* Order Items Table */}
          <Col lg="8">
            <section className="maintable">
              <Table className="table table-border">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDER_ITEMS.map((item) => (
                    <OrderItem key={item.id} item={item} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="order_item">
                    <th>Subtotal:</th>
                    <td className="text-end">
                      <PriceDisplay amount={subtotal} />
                    </td>
                  </tr>
                  <tr className="order_item">
                    <th>Payment method:</th>
                    <td className="text-end">{ORDER_DETAILS.paymentMethod}</td>
                  </tr>
                  <tr>
                    <th>Total:</th>
                    <td className="text-end">
                      <PriceDisplay amount={ORDER_DETAILS.total} />
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </section>
          </Col>

          {/* Billing Address */}
          <Col lg="4">
            <div className="bill_section">
              <address>
                <div className="bill_table">
                  <Table className="table" responsive>
                    <thead>
                      <tr>
                        <td>Billing address</td>
                      </tr>
                    </thead>
                    <tbody>
                      <BillingRow label="Name" value={BILLING_ADDRESS.name} />
                      <BillingRow
                        label="Company"
                        value={BILLING_ADDRESS.company}
                      />
                      <BillingRow
                        label="Country"
                        value={BILLING_ADDRESS.country}
                      />
                      <BillingRow
                        label="Address"
                        value={BILLING_ADDRESS.address}
                      />
                      <BillingRow
                        label="E-mail"
                        value={BILLING_ADDRESS.email}
                      />
                      <BillingRow label="Phone" value={BILLING_ADDRESS.phone} />
                    </tbody>
                  </Table>
                </div>
              </address>
            </div>
          </Col>
        </Row>
        {/* Action Buttons */}
        <div className="order-actions mt-5 pt-4 border-top">
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button
              className="d-flex justify-content-center align-items-center gap-3 btn-lg px-4 py-3 rounded-pill shadow-sm hover-lift tab-bg-gredient-center"
              variant="outline-primary"
              style={{
                background:
                  "linear-gradient(0deg, rgba(var(--bs-primary-rgb), 0) 0, rgba(var(--bs-primary-rgb), 0.3) 85%)",
              }}
              onClick={() => (window.location.href = "/")}
            >
              <PartyPopper/>
              Discover More Events
            </Button>

            <Button
              className="btn-lg px-4 py-3 rounded-pill shadow-sm hover-lift"
              variant="primary"
              onClick={() => (window.location.href = "/my-bookings")}
            >
              <i className="fas fa-bookmark me-2"></i>
              My Bookings
            </Button>
          </div>

          {/* Optional: Add a subtle animated element */}
          <div className="text-center mt-4">
            <div
              className="d-inline-block"
              style={{
                background: "linear-gradient(90deg, #667eea, #764ba2, #667eea)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                animation: "gradient 3s ease infinite",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              ✨ Continue your journey with us
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default memo(TrackOrderPage);
