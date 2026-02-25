import { ChevronRightCircle } from "lucide-react";
import { useRouter } from "next/router";
const CartSteps = ({ id, showAttendee }) => {
  // Define steps without 'number'
  const steps = [
    { title: "Cart", id: 1, path: "cart" },
    ...(showAttendee ? [{ title: "Attendee", id: 2, path: "attendee" }] : []),
    { title: "Checkout", id: showAttendee ? 3 : 2, path: "checkout" },
  ];


  const CART_STEPS = steps.map((step, idx) => ({
    ...step,
    number: idx + 1,
  }));

  // Add sequential numbers
  const router = useRouter();
  const pathname = router.asPath || router.pathname;
  const activeStepIndex = CART_STEPS.findIndex((step) =>
    pathname.includes(`/events/${step.path}/`)
  );

  const CartStep = ({ step, isLast, index }) => (
    <>
      <li
        className={`d-flex justify-content-center align-items-center gap-2 cart-page-item ${index === activeStepIndex ? "active" : ""
          }`}
      >
        <span
          className={`cart-pre-heading badge cart-pre-number border-radius rounded-circle me-1 ${index === activeStepIndex ? "bg-primary" : ""
            }`}
          style={{ fontSize: '12px' }}
        >
          {step.number}
        </span>
        <span className="cart-page-link" style={{ fontSize: '12px' }}>{step.title}</span>
      </li>
      {!isLast && (
        <li className="d-flex justify-content-center align-items-center">
          <ChevronRightCircle size={16} />
        </li>
      )}
    </>
  );
  return (
    <div className="main-cart">
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