import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import Link from "next/link";
import CustomBtn from "../../../../utils/CustomBtn";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { CheckoutSummarySection } from "../../../../components/events/CheckoutComps/CheckoutSummarySection";
import { OrderReviewSection } from "../../../../components/events/CheckoutComps/OrderReviewSection";
import {createOrderData} from "../../../../components/events/CheckoutComps/checkout_utils";
import { useOrderCalculations } from "../../../../components/events/CheckoutComps/useCartData";
import { useSelector } from "react-redux";
import { selectCheckoutDataByKey
} from '@/store/customSlices/checkoutDataSlice';
const CartPage = () => {
  const router = useRouter();
  const { k } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isLoggedIn } = useMyContext();
  const [checkoutData, setCheckoutData] = useState(null);
  // State management
  const [couponCode, setCouponCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const data = useSelector((state) =>
    k ? selectCheckoutDataByKey(state, k) : null
  );
  useEffect(() => {
    if (data) {
      console.log("Fetched checkout data:", data);
      setCheckoutData(data);
    }
  }, [data]);

  const orderData = createOrderData(checkoutData?.data);
  const { calculatedTotal } = useOrderCalculations(
    checkoutData?.data,
    checkoutData?.ticket
  );
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
        <CartSteps
          id={2}
          showAttendee={checkoutData?.event?.category?.attendy_required === 1}
        />
        <Row>
          <Col lg="8" md="7">
            <OrderReviewSection
              isMobile={isMobile}
              event={checkoutData?.event}
              ticketdata={checkoutData?.ticket}
              summary={checkoutData?.data}
              validatedData={checkoutData}
              handleProcess={handleProcess}
              BookingMobileFooter={BookingMobileFooter}
              CustomBtn={CustomBtn}
              Link={Link}
            />
          </Col>
          <Col lg="4" md="5">
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
