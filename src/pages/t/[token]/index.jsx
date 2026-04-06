import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import imgLoader from "../../../assets/event/stock/loader111.gif";
import Image from "next/image";
import { useMyContext } from "@/Context/MyContextProvider";
import { publicApi } from "@/lib/axiosInterceptor";
import TicketErrorDisplay from "@/components/errors/TicketErrorDisplay";
import { getErrorMessage } from "@/utils/errorUtils";
import { ETicketAlert, TicketDataSummary, BookingMetadataCard } from "@/components/events/CheckoutComps/checkout_utils";


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

  // Query 3: Fetch card image
  const {
    data: cardImage,
    isLoading: isImageLoading,
    isError: isImageError,
  } = useQuery({
    queryKey: ["card-image", ticketData?.card_url],
    queryFn: () => fetchCardImage(ticketData?.card_url),
    enabled: !!ticketData?.card_url,
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
    } else if (ticketData && !ticketData.card_url) {
      // No card URL - proceed with white fallback
      setImageLoaded(true);
    } else if (isImageError) {
      // Image fetch failed - proceed with white fallback
      setImageLoaded(true);
    }
  }, [cardImage, ticketData, isImageError]);

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

  const ticketCount = useMemo(() => ticketData?.data?.length || 0, [ticketData]);
  // Computed values


  const isLoading = isTokenLoading || isTicketLoading;
  const hasError = isTokenError || isTicketError;
  const errorMessage = getErrorMessage(tokenError || ticketError, "No ticket data available");



  const timeString = useMemo(() => {
    const entry = ticketData?.event?.entry_time || "";
    const start = ticketData?.event?.start_time;
    return `${entry}${start ? ` - ${start}` : ""}`.trim();
  }, [ticketData]);

  const formattedDate = useMemo(
    () => formatDateRange(ticketData?.event?.date_range) || "Date not specified",
    [ticketData]
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
    if (ticketData) {
      setTicketActions({
        ticketData,
        ticketCount,
        disableCombineButton,
        imageLoaded,
        cardImageUrl,
        handleDownloadClick,
        handleTransferClick,
      });
    }
    return () => setTicketActions(null);
  }, [ticketData, ticketCount, disableCombineButton, imageLoaded, cardImageUrl, setTicketActions, handleDownloadClick, handleTransferClick]);


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
        ) : ticketData ? (
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

            <ETicketAlert />

            <Row>
              {/* Left Column */}
              <Col lg={8}>
                {/* Ticket Information Card */}
                <TicketDataSummary
                  eventName={ticketData?.event?.name}
                  ticketName={ticketData?.ticket?.name}
                  price={ticketData?.ticket?.price || 0}
                  quantity={ticketCount}
                  hidePrices={false}
                  currency={ticketData?.ticket?.currency}
                  subTotal={ticketData?.ticket?.amount || 0}
                  processingFee={ticketData?.ticket?.tax || 0}
                  total={ticketData?.ticket?.amount || 0}
                />


              </Col>

              {/* Right Column */}
              <Col lg={4}>
                <BookingMetadataCard
                  eventDates={formattedDate}
                  bookingDate={moment(ticketData?.created_at).format("MMM D, YYYY")}
                  entryTime={ticketData?.event?.entry_time}
                  startTime={ticketData?.event?.start_time}
                  venueAddress={ticketData?.event?.address}
                  userName={ticketData?.user?.name}
                  userNumber={ticketData?.user?.number}
                />

                <div className="d-none d-sm-block">
                  <DesktopActionButtons
                    ticketData={ticketData}
                    ticketCount={ticketCount}
                    disableCombineButton={disableCombineButton}
                    imageLoaded={imageLoaded}
                    cardImageUrl={cardImageUrl}
                    handleDownloadClick={handleDownloadClick}
                    handleTransferClick={handleTransferClick}
                  />
                </div>
              </Col>
            </Row>
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
          ticketData={ticketData}
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

        {showTransferDrawer && ticketData && (
          <TokenTransferDrawer
            show={showTransferDrawer}
            onHide={() => setShowTransferDrawer(false)}
            ticketData={ticketData}
            token={orderId}
            onTransferSuccess={() => {
              // Refetch data when transfer succeeds or reload the page
              router.reload();
            }}
          />
        )}
        {/* Terms & Conditions */}
        <TermsAndConditionsCard ticketData={ticketData} />
      </Container>
    </div>
  );
};

export default UserCard;