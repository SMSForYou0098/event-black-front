import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import Link from "next/link";
import CustomBtn from "../../../../utils/CustomBtn";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { CheckoutSummarySection } from "../../../../components/events/CheckoutComps/CheckoutSummarySection";
import { OrderReviewSection } from "../../../../components/events/CheckoutComps/OrderReviewSection";
import { createOrderData } from "../../../../components/events/CheckoutComps/checkout_utils";
import { useSelector } from "react-redux";
import { selectCheckoutDataByKey } from "@/store/customSlices/checkoutDataSlice";
import { api } from "@/lib/axiosInterceptor";
import { useQuery } from "@tanstack/react-query";
import { ErrorExtractor } from "@/utils/consts";
import { setCookie } from "../../../../utils/consts";
const CartPage = () => {
  const router = useRouter();
  const { event_key, k } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isLoggedIn, ErrorAlert, successAlert } = useMyContext();
  const [checkoutData, setCheckoutData] = useState(null);
  // State management
  const [couponCode, setCouponCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [charges, setCharges] = useState({
    taxData: null,
    commissionData: null,
    centralGST: 0,
    stateGST: 0,
    convenienceFees: 0,
  });
  const [promo, setPromo] = useState({
    discount: 0,
    discountType: "",
    appliedCode: "",
  });
  const data = useSelector((state) =>
    k ? selectCheckoutDataByKey(state, k) : null
  );

  const getCookie = (name) => {
    return document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith(`${name}=`))
      ?.split('=')[1];
  };
  useEffect(() => {
    if (event_key) {
      setCookie('currentEventKey', event_key);
    }

    // Check for reload
    if (getCookie('wasReloaded') === 'true') {
      setIsLoading(true); // Show loading state

      const eventKeyToUse = event_key || getCookie('currentEventKey');

      if (eventKeyToUse) {
        router.replace(`/events/cart/${eventKeyToUse}`);
      }
    } else {
      setIsLoading(false); // Not a reload, stop loading state
    }
  }, [event_key]);

  useEffect(() => {
    // Warn on reload/close
    const handleBeforeUnload = (e) => {
      // Set cookie that expires in 5 seconds
      document.cookie = "wasReloaded=true; max-age=5; path=/";
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (data) {
      setCheckoutData(data);
    }
  }, [data]);

  // Event handlers
  const handleProcess = () => {
    if (!isLoggedIn) {
      // Handle login logic
    }
    router.push(`/events/summary/${event_key}/`);
  };

  const handleApplyCoupon = async () => {
    if (!checkoutData?.event?.user_id) {
      ErrorAlert('Event organizer information is missing');
      return;
    }

    if (!checkoutData?.data?.itemId) {
      ErrorAlert('Please select a ticket first');
      return;
    }

    if (!calculatedTotal) {
      ErrorAlert('Total amount cannot be zero');
      return;
    }

    if (!couponCode || couponCode.trim() === '') {
      ErrorAlert('Please enter a promo code');
      return;
    }
    try {
      const res = await api.post(`/check-promo-code/${checkoutData?.event?.user_id}`, {
        ticket_id: checkoutData?.ticket?.id,
        amount: calculatedTotal,
        promo_code: couponCode,
      });
      if (res.data.status) {
        // console.log(res.data);
        const data = res.data.promo_data
        setPromo({
          discount: Number(data?.discount_value),
          discountType: data?.discount_type,
          appliedCode: data?.promo_data?.code,
        });
        successAlert(res.data.message)
      } else {
        ErrorAlert(res.data.message)
      }
    } catch (err) {
      ErrorAlert(ErrorExtractor(err))
    }
  };

  const { data: taxData } = useQuery({
    queryKey: ["taxes", 1],
    queryFn: async () => {
      const res = await api.get(`/taxes/1`);
      return res.data?.taxes || null;
    },
  });

  // Fetch commission data
  const { data: commissionData } = useQuery({
    queryKey: ["commissions", 1],
    queryFn: async () => {
      const res = await api.get(`/commissions/1`);
      return res.data?.commission || null;
    },
  });



  const orderDataBase = createOrderData(checkoutData?.data, charges);

  const discountAmount = useMemo(() => {
    let amount = 0;
    const total = orderDataBase.baseAmount + orderDataBase.cgst + orderDataBase.sgst + orderDataBase.convenienceFees;
    //console.log('Calculating discount for total:', total, 'with promo:', promo);
    if (promo.discountType === "Percentage") {
      amount = (Number(total) * Number(promo.discount)) / 100;
    } else if (promo.discountType === "fixed") {
      amount = Number(promo.discount);
    }
    if (amount < 0) amount = 0;
    if (amount > total) amount = total;
    console.log('orderDataBase Details:', orderDataBase);
    console.log('Calculated Discount Amount:', amount);
    return amount;
  }, [promo, orderDataBase]);

  const orderData = {
    ...orderDataBase,
    discount: discountAmount,
  };

  const calculatedTotal = Number(
    orderData.baseAmount +
    orderData.cgst +
    orderData.sgst +
    orderData.convenienceFees
    - discountAmount
  ).toFixed(2);



  useEffect(() => {
    if (!taxData || !commissionData || !checkoutData?.data) return;

    const ticketTotal = Number(checkoutData?.data?.subtotal) || 0;
    // console.log(checkoutData?.data);
    if (ticketTotal <= 0) {
      setCharges({
        taxData,
        commissionData,
        centralGST: 0,
        stateGST: 0,
        convenienceFees: 0,
      });
      return;
    }

    // GST Calculation
    let gstValue = Number(taxData.rate) || 0;
    if (taxData.rate_type === "Percentage") {
      gstValue = (ticketTotal * gstValue) / 100;
    } else if (taxData.rate_type === "Fixed") {
      gstValue = gstValue * quantity;
    }
    // Commission Calculation
    let commissionValue = Number(commissionData.commission_rate) || 0;
    if (commissionData.commission_type === "Percentage") {
      commissionValue = (ticketTotal * commissionValue) / 100;
    } else if (commissionData.commission_type === "Fixed") {
      commissionValue = commissionValue * quantity;
    }

    const cgst = (commissionValue * 9) / 100;
    const sgst = (commissionValue * 9) / 100;
    setCharges({
      taxData,
      commissionData,
      centralGST: cgst,
      stateGST: sgst,
      convenienceFees: commissionValue,
    });
  }, [taxData, commissionData, checkoutData]);

  useEffect(() => {
    console.log('Order Data:', orderData);
  }, [orderData]);
  return (
    <div className="cart-page section-padding">
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          pointerEvents: 'all' // Blocks all clicks
        }}>
          <div>Redirecting to cart...</div>
        </div>
      )}
      <Container>
        <CartSteps
          id={2}
          showAttendee={checkoutData?.event?.category?.attendy_required === 1}
        />
        <Row>
          <Col lg="8" md="5">
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
              event={checkoutData?.event}
              ticketdata={checkoutData?.ticket}
              calculatedTotal={calculatedTotal}
              summary={checkoutData?.data}
              validatedData={checkoutData}
              handleProcess={handleProcess}
              BookingMobileFooter={BookingMobileFooter}
              CustomBtn={CustomBtn}
              Link={Link}
            />

          </Col>
        </Row>
      </Container>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
