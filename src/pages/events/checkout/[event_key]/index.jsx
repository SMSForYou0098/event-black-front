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
import { useSelector } from "react-redux";
import { selectCheckoutDataByKey } from "@/store/customSlices/checkoutDataSlice";
import { api } from "@/lib/axiosInterceptor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ErrorExtractor } from "@/utils/consts";
import paymentLoader from "../../../../assets/event/stock/payment_processing.gif";
import { checkForDuplicateAttendees, sanitizeInput, validateAttendeeData } from "../../../../components/CustomComponents/AttendeeStroreUtils";
import Swal from "sweetalert2";
import LoaderComp from "../../../../utils/LoaderComp";
import Timer from "../../../../utils/BookingUtils/Timer";
import { useEventData } from "../../../../services/events";
import { useHeaderSimple } from "../../../../Context/HeaderContext";
const CartPage = () => {
  const router = useRouter();
  const { isMobile, ErrorAlert, successAlert, UserData, systemSetting } = useMyContext();
  const { event_key, k } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTimerExpired, setIsTimerExpired] = useState(false);


  const data = useSelector((state) =>
    k ? selectCheckoutDataByKey(state, k) : null
  );
  const { data: event } = useEventData(event_key);
  
  useHeaderSimple({
    title: event?.name || "Event Details",
  });
  const attendeeRequired = checkoutData?.event?.category?.attendy_required === 1


  useEffect(() => {
    if (data) {
      setCheckoutData(data);
    }
  }, [data]);



  const applyCouponMutation = useMutation({
    // mutation function as option
    mutationFn: ({ userId, payload }) => api.post(`/check-promo-code/${userId}`, payload),

    onSuccess: (res) => {
      const resp = res?.data;
      if (resp?.status) {
        const promoData = resp.promo_data ?? {};

        setPromo({
          discount: Number(promoData?.discount_value ?? 0),
          discountType: promoData?.discount_type ?? null,
          appliedCode: promoData?.code ?? couponCode,
        });

        successAlert(resp.message || 'Promo applied successfully');

        // optional: refresh any queries relying on checkout/pricing
        // queryClient.invalidateQueries(['checkout', checkoutKey]);
      } else {
        ErrorAlert(resp?.message || 'Failed to apply promo code');
      }
    },

    onError: (err) => {
      ErrorAlert(ErrorExtractor(err));
    },
  });

  const handleApplyCoupon = () => {
    // validations (unchanged)
    if (!checkoutData?.event?.user_id) {
      ErrorAlert('Event organizer information is missing');
      return;
    }

    if (!checkoutData?.ticket?.id && !checkoutData?.data?.id) {
      ErrorAlert('Please select a ticket first');
      return;
    }

    if (!checkoutData?.data?.totalFinalAmount || checkoutData?.data?.totalFinalAmount <= 0) {
      ErrorAlert('Total amount cannot be zero');
      return;
    }

    if (!couponCode || couponCode.trim() === '') {
      ErrorAlert('Please enter a promo code');
      return;
    }

    applyCouponMutation.mutate({
      userId: checkoutData.event.user_id,
      payload: {
        ticket_id: checkoutData?.data?.id ?? checkoutData?.data?.itemId,
        amount: checkoutData?.data?.totalBaseAmount,
        promo_code: couponCode.trim(),
      },
    });
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

  // const orderDataBase = createOrderData(checkoutData?.data, charges);

  const discountAmount = useMemo(() => {
    let amount = 0;
    // const total = orderDataBase.baseAmount + orderDataBase.cgst + orderDataBase.sgst + orderDataBase.convenienceFees;
    const total = checkoutData?.data?.totalBaseAmount
    //console.log('Calculating discount for total:', total, 'with promo:', promo);
    if (promo.discountType == "percentage") {
      amount = (Number(total) * Number(promo.discount)) / 100;
    } else if (promo.discountType == "fixed") {
      amount = Number(promo.discount);
    }
    if (amount < 0) amount = 0;
    if (amount > total) amount = total;
    return amount;
    // }, [promo, orderDataBase]);
  }, [promo]);

  const orderData = {
    // ...orderDataBase,
    discount: discountAmount,
    // total: Number(calculatedTotal),
  };

  const summaryData = {
    ...checkoutData?.data,
    discount: discountAmount,
  };

  useEffect(() => {
    if (!taxData || !commissionData || !checkoutData?.data) return;

    const ticketTotal = Number(checkoutData?.data?.subtotal) || 0;
    const quantity = Number(checkoutData?.data?.newQuantity) || 0;
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

  const validatePricingIntegrity = () => {
    const baseAmount = Number(checkoutData?.data?.totalBaseAmount) || 0;
    const finalAmount = Number(checkoutData?.data?.totalFinalAmount) || 0;
    const calculatedDiscount = Number(discountAmount) || 0;

    // Validate discount doesn't exceed base amount
    if (calculatedDiscount > baseAmount) {
      ErrorAlert('Invalid discount amount');
      return false;
    }

    // Validate final amount is non-negative
    if (finalAmount < 0) {
      ErrorAlert('Invalid total amount');
      return false;
    }

    // Log for debugging
    // console.log('Price validation:', { baseAmount, finalAmount, calculatedDiscount });

    return true;
  };



  const ValidateBooking = () => {

    if (isTimerExpired) {
      ErrorAlert("Your session has expired. Please start over.");
      router.push(`/events/cart/${event_key}`);
      return false;
    }

    if (!validatePricingIntegrity()) {
      return false;
    }

    if (!checkoutData) {
      ErrorAlert("Checkout data is missing.");
      return false;
    }
    if (!UserData?.email) {
      return ErrorAlert('Please Complete Your Profile');
    }
    //validate quantity
    const quantity = Number(checkoutData?.data?.quantity) || 0;
    if (quantity <= 0) {
      ErrorAlert("Please select at least one ticket.");
      return false;
    }
    //validate attendee info if required
    if (attendeeRequired) {
      const attendees = checkoutData?.attendees || [];
      if (attendees.length !== quantity) {
        ErrorAlert("Please provide attendee information for all tickets.");
        return false;
      }

      // Validate each attendee's data
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        const { valid, message } = validateAttendeeData(attendee);
        if (!valid) {
          ErrorAlert(`Attendee ${i + 1}: ${message}`);
          return false;
        }
      }

      // Check for duplicate attendees
      const isDuplicate = checkForDuplicateAttendees(attendees, setErrorMessages, setShowErrorModal);
      if (isDuplicate) {
        return false;
      }
    }
    //console.log(isDuplicate , 'isDuplicate');
    return true;
  }

  // Main booking process function
  const ProcessBooking = async () => {

    if (isProcessing) {
      ErrorAlert('Booking already in progress');
      return;
    }

    if (!ValidateBooking()) return;
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Confirm Booking',
      text: "Are you sure you want to proceed with this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Book Now!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);

    try {
      const payload = createBookingPayload();
      const response = await initiateBooking(payload);
      await handleBookingResponse(response);

    } catch (error) {
      handleBookingError(error);
    } finally {
      setIsLoading(false);
    }
  };


  // Create booking payload
  const createBookingPayload = () => {

    const formData = new FormData();
    const quantity = Number(summaryData?.quantity) || 0;
    // helper: detect file-like objects and extract the actual File/Blob
    const extractFile = (v) => {
      if (!v) return null;
      if (v instanceof File || v instanceof Blob) return v;
      if (v.originFileObj instanceof File) return v.originFileObj;
      if (v.file instanceof File) return v.file;
      if (v.rawFile instanceof File) return v.rawFile;
      // react-native like object { uri, name, type } - return as-is (RN handles this differently)
      if (v.uri && v.name) return v;
      return null;
    };

    // helper: append primitive or JSON-stringified value
    const appendPrimitive = (key, value) => {
      // boolean/number/string -> sanitized string
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, sanitizeInput(String(value)));
      } else {
        // fallback: stringify objects/arrays
        formData.append(key, JSON.stringify(value));
      }
    };

    // Basic user info
    formData.append('user_id', UserData?.id ? String(UserData.id) : '');
    formData.append('user_name', sanitizeInput(UserData?.name || ''));
    formData.append('user_email', UserData?.email || '');
    formData.append('user_phone', UserData?.phone || UserData?.number || '');

    // Event info
    formData.append('event_id', event_key || '');
    formData.append('event_name', sanitizeInput(checkoutData?.event?.name || ''));
    formData.append('organizer_id', checkoutData?.event?.user_id ? String(checkoutData.event.user_id) : '');
    formData.append('category', checkoutData?.event?.category?.title || '');
    formData.append('event_type', checkoutData?.event?.event_type || '');

    // Ticket info
    formData.append('ticket_id', summaryData.id ? String(summaryData.id) : '');
    formData.append('ticket_price', String(summaryData?.price ?? '0'));
    formData.append('quantity', String(quantity));

    // Pricing

    // new payload
    const fieldsToDiscard = ['price', 'id', 'discount', 'totalFinalAmount']; // example
    formData.append
    Object.entries(summaryData)
      .filter(([key]) => !fieldsToDiscard.includes(key))
      .forEach(([key, value]) => {
        formData.append(key, String(value));
      });

    const round2 = (n) => +Number(n ?? 0).toFixed(2);
    const gross = round2(summaryData?.totalFinalAmount);
    const discount = round2(summaryData?.discount);
    const payable = Math.max(0, round2(gross - discount));

    formData.append('totalFinalAmount', String(payable));

    // Promo
    if (promo?.appliedCode) formData.append('promo_code', promo.appliedCode);

    // Booking date
    if (checkoutData?.data?.selectedDate) {
      formData.append('booking_date', checkoutData.data.selectedDate);
    }

    // Payment method
    formData.append('payment_method', 'online');

    // Attendees — handle files and primitives safely
    if (attendeeRequired && Array.isArray(checkoutData?.attendees) && checkoutData.attendees.length > 0) {
      const attendeeList = checkoutData.attendees;

      attendeeList.forEach((attendee, index) => {
        Object.entries(attendee).forEach(([fieldKey, fieldValue]) => {
          // skip helper fields
          if (fieldKey === 'missingFields' || fieldValue === undefined || fieldValue === null || fieldValue === '') return;

          const baseKey = `attendees[${index}][${fieldKey}]`;

          // If array (e.g., multiple photos)
          if (Array.isArray(fieldValue)) {
            fieldValue.forEach((item, i) => {
              const file = extractFile(item);
              if (file) {
                // append files as array parts
                formData.append(`${baseKey}[]`, file);
              } else {
                formData.append(`${baseKey}[]`, sanitizeInput(String(item)));
              }
            });
            return;
          }

          // If file-like, append file directly (do NOT stringify)
          const fileLike = extractFile(fieldValue);
          if (fileLike) {
            formData.append(baseKey, fileLike);
            return;
          }

          // If plain object (not file), JSON stringify so backend can parse
          if (typeof fieldValue === 'object') {
            formData.append(baseKey, JSON.stringify(fieldValue));
            return;
          }

          // Primitive (string/number/boolean)
          appendPrimitive(baseKey, fieldValue);
        });
      });
    }

    return formData;
  };


  // Initiate booking API call
  const initiateBooking = async (payload) => {
    // const apiCall = async () => {
    //   return await api.post(`/initiate-payment`, payload, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     }
    //   });
    // };

    const MAX_RETRIES = 1;
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await api.post(`/initiate-payment`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            // 🔧 Add idempotency key to prevent duplicate bookings
            'X-Idempotency-Key': `${UserData?.id}-${event_key}-${Date.now()}`
          }
        });
        return response;
      } catch (error) {
        lastError = error;

        // 🔧 Only retry on network errors (5xx), NOT on validation errors (4xx)
        const status = error.response?.status;
        if (status && status >= 400 && status < 500) {
          console.error('❌ Client error, not retrying:', error.response?.data);
          throw error; // Don't retry validation errors
        }

        if (attempt < MAX_RETRIES) {
          console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    throw lastError;
  };

  // Handle booking response
  const handleBookingResponse = async (response) => {
    // Handle free booking
    if (Number(summaryData.totalFinalAmount) === 0 && response.data.status) {
      await handleFreeBooking(response.data);
      return;  // ✅ Exit early for free bookings
    }

    if (response.data.status || response.data?.result?.status === 1 || response.data?.result?.success || response.data?.payment_url) {
      // Store session data for paid bookings
      const sessionId =
        response.data?.txnid ||
        response.data?.order_data?.cf_order_id ||
        response.data?.session_id;

      const sessionData = {
        session_id: sessionId,
        event_key: event_key,
        timestamp: Date.now(),
        expires: Date.now() + (15 * 60 * 1000) // 15 minutes
      };


      const saveSessionData = (sdata) => {
        try {
          localStorage.setItem('ticketSession', JSON.stringify(sdata));
          return true;
        } catch (error) {
          console.error('❌ Failed to save to localStorage:', error);
          try {
            sessionStorage.setItem('ticketSession', JSON.stringify(sdata));
            return true;
          } catch (e) {
            console.error('❌ Failed to save to sessionStorage:', e);
            ErrorAlert('Unable to save session. Please enable storage and try again.');
            return false;
          }
        }
      };

      // return
      if (!saveSessionData(sessionData)) {
        throw new Error('Failed to save session data');
      }
      // Handle Razorpay
      // console.log('status after condition:', response.data.callback_url);
      if (response.data.callback_url) {
        handleRazorpayPayment(response.data, systemSetting);
        return;  // ✅ Exit after initiating Razorpay
      }

      // Handle other payment gateways
      const paymentUrl = response.data?.url || response.data?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;  // ✅ Exit after redirect (important!)
      } else {
        throw new Error('Payment URL missing from response.');
      }

    } else {
      throw new Error('Payment initiation failed');
    }
  };

  // Handle free booking
  const handleFreeBooking = async (responseData) => {
    try {
      const sessionId = responseData?.bookings?.[0]?.session_id || responseData?.bookings?.session_id;
      // if no sessionId, just push to event summary without query param
      if (!sessionId) {
        // router.push(`/events/summary/${encodeURIComponent(event_key)}`);
        ErrorAlert('Session Id Not Found')
        return;
      }

      router.push(
        `/events/summary/${encodeURIComponent(event_key)}?session_id=${encodeURIComponent(sessionId)}`
      );

    } catch (error) {
      console.error('Free booking handling error:', error);
      ErrorAlert('Booking successful but there was an issue redirecting.');
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = (orderData, systemSetting) => {
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: `${systemSetting?.app_name || 'Trava Get Your Ticket Pvt Ltd'}`,
      description: "Ticket Booking",
      order_id: orderData.order_id,
      prefill: orderData.prefill || {
        name: UserData?.name,
        email: UserData?.email,
        contact: UserData?.phone || UserData?.number
      },
      callback_url: orderData.callback_url,
      theme: {
        color: '#000',
      },
      handler: function (response) {
        console.log('💳 Payment successful:', response);
        verifyPaymentAndRedirect(response);
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
          setIsProcessing(false); // 🔧 Reset processing state
          ErrorAlert('Payment was cancelled.');
        },
        escape: false, // 🔧 Prevent accidental dismissal
        backdropclose: false,
        confirm_close: true // 🔧 Ask for confirmation
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handle booking errors
  const handleBookingError = (error) => {
    // ✅ NEW: Specific error handling with retry option
    let errorMessage = 'An error occurred while processing your booking.';
    let shouldRetry = false;

    // Network errors
    console.log(error, 'error');
    if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
      shouldRetry = true;
    }
    // Server errors (5xx)
    else if (error.response.status >= 500) {
      errorMessage = 'Server error. Please try again in a moment.';
      shouldRetry = true;
    }
    // Client errors (4xx)
    else if (error.response.status >= 400) {
      errorMessage = error.response.data?.message ||
        error.response.data?.error ||
        'Invalid booking request. Please check your details.';

      // Specific error codes
      if (error.response.status === 409) {
        errorMessage = 'Tickets are no longer available. Please try a different ticket.';
      } else if (error.response.status === 401) {
        errorMessage = 'Session expired. Please refresh and try again.';
      }
    }

    setError(errorMessage);

    // 🔧 Offer retry for recoverable errors
    if (shouldRetry) {
      Swal.fire({
        title: 'Booking Failed',
        text: errorMessage,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Retry',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          ProcessBooking();
        }
      });
    } else {
      ErrorAlert(errorMessage);
    }

    // 🔧 Reset processing state
    setIsProcessing(false);
  };

  // Event handler for the process button
  const handleProcess = () => {
    ProcessBooking();
  };

  return (
    <div className="cart-page">
      {isLoading && (
        <LoaderComp imgLoader={paymentLoader} />
      )}
      <Container>
        <CartSteps
          id={2}
          showAttendee={checkoutData?.event?.category?.attendy_required === 1}
        />
        <Timer
          timestamp={data?.timestamp}
          navigateOnExpire={() => router.push(`/events/cart/${event_key}`)}
          onExpire={() => setIsTimerExpired(true)}
        />
        <Row>
          <Col lg="8" md="5">
            <CheckoutSummarySection
              summaryData={summaryData}
              // calculatedTotal={calculatedTotal}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              promoCodeLoading={applyCouponMutation.isPending}
            />
          </Col>
          <Col lg="4" md="5">

            <OrderReviewSection
              isMobile={isMobile}
              orderData={orderData}
              discount={discountAmount}
              summaryData={summaryData}
              event={checkoutData?.event}
              ticketdata={checkoutData?.ticket}
              // calculatedTotal={calculatedTotal}
              validatedData={checkoutData}
              handleProcess={handleProcess}
              BookingMobileFooter={BookingMobileFooter}
              CustomBtn={CustomBtn}
              Link={Link}
              isLoading={isLoading}
              // promo code props
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              promoCodeLoading={applyCouponMutation.isPending}
            />

          </Col>
        </Row>
      </Container>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
