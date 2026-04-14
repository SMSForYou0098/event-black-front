import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import Swal from "sweetalert2";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import imgLoader from "../../../assets/event/stock/loader111.gif";
import Image from "next/image";
import { useMyContext } from "@/Context/MyContextProvider";
import { publicApi } from "@/lib/axiosInterceptor";
import TicketErrorDisplay from "@/components/errors/TicketErrorDisplay";
import { getErrorMessage } from "@/utils/errorUtils";
import CommonTicketInfoSection from "@/components/events/CheckoutComps/CommonTicketInfoSection";


// Extracted Components
import TermsAndConditionsCard from "@/components/Tickets/Token/TermsAndConditionsCard";
import DesktopActionButtons from "@/components/Tickets/Token/DesktopActionButtons";
import TicketCanvasDrawer from "@/components/Tickets/Token/TicketCanvasDrawer";
import LoginOffCanvas from "@/components/auth/LoginOffCanvas";
import TokenTransferDrawer from "@/components/Tickets/Token/TokenTransferDrawer";

// API fetch functions
const fetchToken = async (orderId) => {
  try {
    const { data } = await publicApi.get(`generate-token/${orderId}`);
    if (!data.status) {
      throw new Error(data.message || "Invalid Request");
    }
    return data; // Return full response including 'token' and 'group'
  } catch (error) {
    throw new Error(getErrorMessage(error, "Invalid Request"));
  }

};

const fetchGanCard = async (token) => {
  const { data } = await publicApi.get(`gen-card/${token}`);
  if (!data.status) {
    throw new Error("Unable to retrieve ticket details");
  }
  return data;
};

const fetchCardImage = async (cardUrl) => {
  if (!cardUrl) return null;
  const response = await publicApi.post(
    "get-image/retrive",
    { path: cardUrl },
    { responseType: "blob" }
  );
  return URL.createObjectURL(response.data);
};

// Helper function
const formatDateRange = (dateRange) => {
  if (!dateRange) return "";
  const dates = dateRange.split(",");
  if (dates.length === 2) {
    return `${moment(dates[0]).format("MMM D, YYYY")} - ${moment(dates[1]).format("MMM D, YYYY")}`;
  }
  return dateRange;
};

const UserCard = () => {
  const { ErrorAlert, systemSetting, isMobile, UserData, setTicketActions } = useMyContext();
  const router = useRouter();
  const { token: orderId } = router.query;

  // Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // 'combine', 'single', 'download' (individual)
  const [showTicketInDrawer, setShowTicketInDrawer] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTransferDrawer, setShowTransferDrawer] = useState(false);

  // Image states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);

  // Canvas refs for download functionality
  const singleCanvasRef = useRef(null);
  const swiperCanvasRefs = useRef({});
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Query 1: Fetch token from orderId
  const {
    data: tokenData,
    isLoading: isTokenLoading,
    isError: isTokenError,
    error: tokenError,
  } = useQuery({
    queryKey: ["ticket-token", orderId],
    queryFn: () => fetchToken(orderId),
    enabled: !!orderId && router.isReady,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const authToken = tokenData?.token;
  const disableCombineButton = tokenData?.group; // "group" field from API determines if combined is allowed
  // Query 2: Fetch gan card data using token
  const {
    data: ticketData,
    isLoading: isTicketLoading,
    isError: isTicketError,
    error: ticketError,
  } = useQuery({
    queryKey: ["gen-card", authToken],
    queryFn: () => fetchGanCard(authToken),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const bookingPayload = useMemo(() => {
    return ticketData?.data?.status ? ticketData.data : ticketData;
  }, [ticketData]);

  const normalizedTicketData = useMemo(() => {
    if (!bookingPayload) return null;

    if (Array.isArray(bookingPayload?.bookings)) {
      return bookingPayload;
    }

    if (Array.isArray(bookingPayload?.bookings?.bookings)) {
      return {
        ...bookingPayload,
        bookings: bookingPayload.bookings.bookings,
      };
    }

    // Non-master gen-card shape: bookings is a single booking object.
    if (bookingPayload?.bookings && !Array.isArray(bookingPayload.bookings)) {
      const singleBooking = bookingPayload.bookings;
      const singleTicket = singleBooking?.ticket || bookingPayload?.ticket || {};
      const singleEvent = singleTicket?.event || bookingPayload?.event || {};
      const singleUser = singleBooking?.user || {
        name: singleBooking?.name || bookingPayload?.user?.name,
        number: singleBooking?.number || bookingPayload?.user?.number,
        email: singleBooking?.email || bookingPayload?.user?.email,
      };

      return {
        ...bookingPayload,
        ticket: singleTicket,
        event: singleEvent,
        user: singleUser,
        bookings: [{
          ...singleBooking,
          ticket: singleTicket,
          user: singleUser,
          seat_name:
            singleBooking?.seat_name ||
            singleBooking?.event_seat_status?.seat_name ||
            "",
          booking_type: singleBooking?.booking_type || bookingPayload?.booking_type,
          booking_date: singleBooking?.booking_date || bookingPayload?.booking_date,
        }],
      };
    }

    const fallbackTicket = bookingPayload?.ticket || {};
    const fallbackEvent = fallbackTicket?.event || bookingPayload?.event || {};
    const fallbackUser = bookingPayload?.user || {};
    const sourceBookings = Array.isArray(bookingPayload?.data) ? bookingPayload.data : [];

    const bookings = sourceBookings.map((item) => ({
      ...item,
      ticket: item?.ticket || {
        ...fallbackTicket,
        event: fallbackEvent,
      },
      user: item?.user || item?.attendee || fallbackUser,
      seat_name: item?.seat_name || item?.event_seat_status?.seat_name || "",
      booking_type: item?.booking_type || bookingPayload?.booking_type,
      booking_date: item?.booking_date || bookingPayload?.booking_date,
    }));

    return {
      ...bookingPayload,
      ticket: fallbackTicket,
      event: fallbackEvent,
      user: fallbackUser,
      bookings,
    };
  }, [bookingPayload]);

  // Query 3: Fetch card image
  const {
    data: cardImage,
    isLoading: isImageLoading,
    isError: isImageError,
  } = useQuery({
    queryKey: ["card-image", bookingPayload?.card_url],
    queryFn: () => fetchCardImage(bookingPayload?.card_url),
    enabled: !!bookingPayload?.card_url,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // Track image loaded state - also treat errors as "loaded" to show fallback
  useEffect(() => {
    if (cardImage) {
      setCardImageUrl(cardImage);
      const img = new window.Image();
      img.src = cardImage;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    } else if (bookingPayload && !bookingPayload.card_url) {
      // No card URL - proceed with white fallback
      setImageLoaded(true);
    } else if (isImageError) {
      // Image fetch failed - proceed with white fallback
      setImageLoaded(true);
    }
  }, [cardImage, bookingPayload, isImageError]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (cardImageUrl) {
        URL.revokeObjectURL(cardImageUrl);
      }
    };
  }, [cardImageUrl]);

  // Show error alerts
  useEffect(() => {
    if (isTokenError && tokenError) {
      ErrorAlert(tokenError.message);
    }
    if (isTicketError && ticketError) {
      ErrorAlert(ticketError.message);
    }
  }, [isTokenError, tokenError, isTicketError, ticketError, ErrorAlert]);

  const bookingsList = normalizedTicketData?.bookings || [];
  const isMaster = Boolean(normalizedTicketData?.isMaster || bookingsList.length > 1);
  const booking = bookingsList[0] || {};
  const ticket = booking?.ticket || normalizedTicketData?.ticket || {};
  const event = ticket?.event || normalizedTicketData?.event || {};
  const user = {
    name: booking?.user?.name || booking?.name || normalizedTicketData?.user?.name,
    number: booking?.user?.number || booking?.number || normalizedTicketData?.user?.number,
  };
  const seatName = bookingsList
    .map((b) => b?.seat_name || b?.event_seat_status?.seat_name)
    .filter(Boolean)
    .join(", ");

  const ticketCount = useMemo(() => {
    if (isMaster) return bookingsList.length || 0;
    return bookingsList.length > 0 ? 1 : 0;
  }, [isMaster, bookingsList, booking]);

  const bookingPricing = useMemo(() => {
    const rawTax =
      bookingPayload?.bookings_tax ??
      bookingPayload?.booking_tax ??
      bookingPayload?.bookings?.bookings_tax ??
      bookingPayload?.bookings?.booking_tax ??
      bookingPayload?.data?.bookings_tax ??
      bookingPayload?.data?.booking_tax ??
      bookingPayload?.bookings?.bookings?.[0]?.bookings_tax ??
      bookingPayload?.bookings?.bookings?.[0]?.booking_tax ??
      bookingPayload?.taxes ??
      bookingPayload?.bookings?.taxes ??
      bookingPayload?.data?.taxes ??
      normalizedTicketData?.bookings_tax ??
      normalizedTicketData?.booking_tax ??
      normalizedTicketData?.bookings?.bookings_tax ??
      normalizedTicketData?.bookings?.booking_tax ??
      normalizedTicketData?.data?.bookings_tax ??
      normalizedTicketData?.data?.booking_tax ??
      normalizedTicketData?.bookings?.bookings?.[0]?.bookings_tax ??
      normalizedTicketData?.bookings?.bookings?.[0]?.booking_tax ??
      normalizedTicketData?.taxes ??
      normalizedTicketData?.bookings?.taxes ??
      normalizedTicketData?.data?.taxes ??
      booking?.bookings_tax ??
      booking?.booking_tax ??
      {};

    const tax = Array.isArray(rawTax) ? rawTax[0] || {} : rawTax;
    const toAmount = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const subTotal = toAmount(tax.base_amount ?? tax.total_base_amount, 0);
    const processingFee =
      toAmount(tax.total_tax ?? tax.total_tax_total, 0) +
      toAmount(tax.convenience_fee ?? tax.total_convenience_fee, 0);
    const parsedTotal = toAmount(tax.final_amount ?? tax.total_final_amount, NaN);
    const fallbackTotal = subTotal + processingFee;
    const discountAmount = toAmount(
      tax.discount ??
      tax.total_discount ??
      booking?.discount ??
      normalizedTicketData?.discount,
      0
    );

    // Keep tax total when valid, otherwise use derived total.
    // Also guard against inconsistent totals when no discount exists.
    let total = Number.isFinite(parsedTotal) ? parsedTotal : fallbackTotal;
    if (discountAmount <= 0 && Math.abs(total - fallbackTotal) > 0.009) {
      total = fallbackTotal;
    }

    return { subTotal, processingFee, total };
  }, [bookingPayload, normalizedTicketData, booking]);
  // Computed values


  const isLoading = isTokenLoading || isTicketLoading;
  const hasError = isTokenError || isTicketError;
  const errorMessage = getErrorMessage(tokenError || ticketError, "No ticket data available");



  const timeString = useMemo(() => {
    const entry = event?.entry_time || "";
    const start = event?.start_time;
    return `${entry}${start ? ` - ${start}` : ""}`.trim();
  }, [event]);

  const formattedDate = useMemo(
    () => formatDateRange(event?.date_range) || "Date not specified",
    [event]
  );

  // Handle download click (opens drawer with notice)
  const handleDownloadClick = useCallback((type) => {
    // Check if image is loaded
    if (!imageLoaded && cardImageUrl) {
      Swal.fire({
        title: "Please wait",
        text: "Ticket image is still loading...",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setDrawerType(type);
    setShowTicketInDrawer(false);
    setShowDrawer(true);
  }, [imageLoaded, cardImageUrl]);

  const handleGenerateTicket = () => {
    setShowTicketInDrawer(true);
  };

  const handleTransferClick = useCallback(() => {
    if (!UserData) {
      setShowLoginModal(true);
    } else {
      setShowTransferDrawer(true);
    }
  }, [UserData]);

  useEffect(() => {
    if (normalizedTicketData) {
      setTicketActions({
        ticketData: normalizedTicketData,
        ticketCount,
        disableCombineButton,
        imageLoaded,
        cardImageUrl,
        handleDownloadClick,
        handleTransferClick,
      });
    }
    return () => setTicketActions(null);
  }, [normalizedTicketData, ticketCount, disableCombineButton, imageLoaded, cardImageUrl, setTicketActions, handleDownloadClick, handleTransferClick]);


  // Handle "Generate Ticket" click inside drawer

  if (!router.isReady) {
    return null;
  }

  return (
    <div className="cart-page">
      <Container>
        {isLoading ? (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
            style={{ zIndex: 9999 }}
          >
            <Image
              src={imgLoader}
              alt="Loading..."
              width={200}
              height={200}
              unoptimized
            />
          </div>
        ) : normalizedTicketData ? (
          <>
            {/* Logo */}
            {systemSetting?.footer_logo && (
              <div className="text-center mb-4">
                <Image
                  src={systemSetting?.footer_logo || ""}
                  alt="Logo"
                  width={200}
                  height={60}
                  className="mh-100"
                  style={{ maxHeight: 60, width: "auto", objectFit: "contain" }}
                  unoptimized
                />
              </div>
            )}

            <CommonTicketInfoSection
              summaryProps={{
                eventName: event?.name,
                ticketName: ticket?.name,
                price: ticket?.price || 0,
                quantity: ticketCount,
                hidePrices: false,
                currency: ticket?.currency,
                subTotal: bookingPricing.subTotal,
                processingFee: bookingPricing.processingFee,
                total: bookingPricing.total,
                discount: bookingPricing.discount,
              }}
              metadataProps={{
                eventDates: formattedDate,
                bookingDate: moment(booking?.created_at).format("MMM D, YYYY"),
                seatName,
                entryTime: event?.entry_time,
                startTime: event?.start_time,
                venueAddress: event?.venue?.address || event?.address,
                userName: user?.name,
                userNumber: user?.number,
              }}
              rightExtra={
                <div className="d-none d-sm-block">
                  <DesktopActionButtons
                    ticketData={normalizedTicketData}
                    ticketCount={ticketCount}
                    disableCombineButton={disableCombineButton}
                    imageLoaded={imageLoaded}
                    cardImageUrl={cardImageUrl}
                    handleDownloadClick={handleDownloadClick}
                    handleTransferClick={handleTransferClick}
                  />
                </div>
              }
            />
          </>
        ) : (
          <TicketErrorDisplay
            errorMessage={hasError ? errorMessage : "No ticket data available"}
          />
        )}

        <TicketCanvasDrawer
          showDrawer={showDrawer}
          setShowDrawer={setShowDrawer}
          setShowTicketInDrawer={setShowTicketInDrawer}
          drawerType={drawerType}
          showTicketInDrawer={showTicketInDrawer}
          handleGenerateTicket={handleGenerateTicket}
          imageLoaded={imageLoaded}
          singleCanvasRef={singleCanvasRef}
          cardImageUrl={cardImageUrl}
          setIsCanvasReady={setIsCanvasReady}
          ticketData={normalizedTicketData}
          orderId={orderId}
          swiperCanvasRefs={swiperCanvasRefs}
          setActiveSlideIndex={setActiveSlideIndex}
          activeSlideIndex={activeSlideIndex}
          isCanvasReady={isCanvasReady}
          isMobile={isMobile}
        />

        {/* Transfer Modals */}
        <LoginOffCanvas
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          redirectPath={router.asPath}
          onSuccess={() => {
            setShowLoginModal(false);
            setShowTransferDrawer(true);
          }}
        />

        {showTransferDrawer && normalizedTicketData && (
          <TokenTransferDrawer
            show={showTransferDrawer}
            onHide={() => setShowTransferDrawer(false)}
            ticketData={normalizedTicketData}
            token={orderId}
            onTransferSuccess={() => {
              // Refetch data when transfer succeeds or reload the page
              router.reload();
            }}
          />
        )}
        {/* Terms & Conditions */}
        <TermsAndConditionsCard ticketData={normalizedTicketData} />
      </Container>
    </div>
  );
};

export default UserCard;