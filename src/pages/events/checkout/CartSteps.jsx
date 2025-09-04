import { ChevronRightCircle } from "lucide-react";
const CartSteps = ({id}) => {
  const CART_STEPS = [
    { number: 1, title: "Cart", id: 1, active: id === 1 },
    { number: 2, title: "Checkout", id: 2, active: id === 2 },
    { number: 3, title: "Summary", id: 3, active: id === 3 },
  ];

  const CartStep = ({ step, isLast }) => (
    <>
      <li className={`d-flex justify-content-center align-items-center gap-2 cart-page-item ${step.active ? "active" : ""}`}>
        <span
          className={`cart-pre-heading badge cart-pre-number border-radius rounded-circle me-1 ${
            step.active ? "bg-primary" : ""
          }`}
        >
          {step.number}
        </span>
        <span className="cart-page-link">{step.title}</span>
      </li>
      {!isLast && (
        <li>
          <ChevronRightCircle />
        </li>
      )}
    </>
  );
  return (
    <div className="main-cart mb-3 mb-md-5 pb-0 pb-md-5">
      <ul className="cart-page-items d-flex justify-content-center list-inline align-items-center gap-3 gap-md-5 flex-wrap">
        {CART_STEPS.map((step, index) => (
          <CartStep
            key={step.number}
            step={step}
            isLast={index === CART_STEPS.length - 1}
          />
        ))}
      </ul>
    </div>
  );
};

export default CartSteps;
