import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import Link from "next/link";
import CustomBtn from "../../../../utils/CustomBtn";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { CheckoutSummarySection } from "../../../../components/events/CheckoutComps/CheckoutSummarySection";
import { OrderReviewSection } from "../../../../components/events/CheckoutComps/OrderReviewSection";
import {
  createOrderData,
  parseUrlData,
} from "../../../../components/events/CheckoutComps/checkout_utils";
import { useOrderCalculations } from "../../../../components/events/CheckoutComps/useCartData";

const CartPage = () => {
  const router = useRouter();
  const {  data, ticket, edata } = router.query;
  const { isMobile, isLoggedIn } = useMyContext();

  // State management
  const [couponCode, setCouponCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Custom hooks
  const validatedData = parseUrlData(data, ticket, edata);
  console.log("validatedData:", validatedData);
  const orderData = createOrderData(validatedData?.data, validatedData?.ticket);
  const { calculatedTotal } = useOrderCalculations(validatedData?.data);
  // Event handlers
  const handleProcess = () => {
    if (!isLoggedIn) {
      // Handle login logic
    }
  };

  const handleApplyCoupon = () => {
    console.log("Applying coupon:", couponCode);
  };

  return (
    <div className="cart-page section-padding">
      <Container>
        <CartSteps id={2} />
        <Row>
          <Col lg="8" md="7">
            <CheckoutSummarySection
              orderData={orderData}
              calculatedTotal={calculatedTotal}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </Col>
          <Col lg="4" md="5">
            <OrderReviewSection
              isMobile={isMobile}
              validatedData={validatedData}
              handleProcess={handleProcess}
              BookingMobileFooter={BookingMobileFooter}
              CustomBtn={CustomBtn}
              Link={Link}
            />
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .table tr th,
        .table tr td {
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
