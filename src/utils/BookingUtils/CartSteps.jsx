import { ChevronRightCircle } from "lucide-react";
const CartSteps = ({ id, showAttendee }) => {
  // Define steps without 'number'
  const steps = [
    { title: "Cart", id: 1 },
    ...(showAttendee ? [{ title: "Attendee", id: 2 }] : []),
    {
      title: "Checkout",
      id: showAttendee ? 3 : 2,
    },
    {
      title: "Summary",
      id: showAttendee ? 4 : 3,
    },
  ];

  // Add sequential numbers
  const CART_STEPS = steps.map((step, idx) => ({
    ...step,
    number: idx + 1,
  }));

  // Determine which step is active
  const activeStepIndex =
    id === "last"
      ? CART_STEPS.length - 1
      : CART_STEPS.findIndex((step) => step.id === id);

  const CartStep = ({ step, isLast, index }) => (
    <>
      <li
        className={`d-flex justify-content-center align-items-center gap-2 cart-page-item ${
          index === activeStepIndex ? "active" : ""
        }`}
      >
        <span
          className={`cart-pre-heading badge cart-pre-number border-radius rounded-circle me-1 ${
            index === activeStepIndex ? "bg-primary" : ""
          }`}
        >
          {step.number}
        </span>
        <span className="cart-page-link">{step.title}</span>
      </li>
      {!isLast && (
        <li className="d-flex justify-content-center align-items-center">
          <ChevronRightCircle size={20} />
        </li>
      )}
    </>
  );
  return (
    <div className="main-cart pb-0 pb-md-5">
      <ul className="cart-page-items d-flex justify-content-center list-inline align-items-center gap-3 gap-md-5 flex-wrap">
        {CART_STEPS.map((step, index) => (
          <CartStep
            key={step.number}
            step={step}
            index={index}
            isLast={index === CART_STEPS.length - 1}
          />
        ))}
      </ul>
    </div>
  );
};

export default CartSteps;