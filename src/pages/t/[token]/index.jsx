import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Container, Modal, Card, Row, Col, Offcanvas } from "react-bootstrap";
import Swal from "sweetalert2";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import imgLoader from "../../../assets/event/stock/loader111.gif";
import {
  CalendarRange,
  Clock,
  Mail,
  MapPin,
  Phone,
  Ticket,
  User,
  UserRound,
  Download,
} from "lucide-react";
import Image from "next/image";
import { useMyContext } from "@/Context/MyContextProvider";
import TicketCanvas from "@/components/events/Tickets/Ticket_canvas";
import { publicApi } from "@/lib/axiosInterceptor";

// API fetch functions
const fetchToken = async (orderId) => {
  const { data } = await publicApi.get(`generate-token/${orderId}`);
  if (!data.status) {
    throw new Error("Invalid Request");
  }
  return data; // Return full response including 'token' and 'group'
};

const fetchGanCard = async (token) => {
  const { data } = await publicApi.get(`gan-card/${token}`);
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
  const { ErrorAlert, systemSetting } = useMyContext();
  const router = useRouter();
  const { token: orderId } = router.query;

  // Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState(null); // 'combine', 'single', 'download' (individual)
  const [showTicketInDrawer, setShowTicketInDrawer] = useState(false);

  // Image states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardImageUrl, setCardImageUrl] = useState(null);

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
    queryKey: ["gan-card", authToken],
    queryFn: () => fetchGanCard(authToken),
    enabled: !!authToken,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // Query 3: Fetch card image
  const {
    data: cardImage,
    isLoading: isImageLoading,
  } = useQuery({
    queryKey: ["card-image", ticketData?.card_url],
    queryFn: () => fetchCardImage(ticketData?.card_url),
    enabled: !!ticketData?.card_url,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  // Track image loaded state
  useEffect(() => {
    if (cardImage) {
      setCardImageUrl(cardImage);
      const img = new window.Image();
      img.src = cardImage;
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
    } else if (ticketData && !ticketData.card_url) {
      setImageLoaded(true);
    }
  }, [cardImage, ticketData]);

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

  // Computed values
  const isLoading = isTokenLoading || isTicketLoading;
  const hasError = isTokenError || isTicketError;
  const errorMessage = tokenError?.message || ticketError?.message || "No ticket data available";

  const ticketCount = useMemo(() => ticketData?.data?.length || 0, [ticketData]);

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
  const handleDownloadClick = (type) => {
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
  };

  // Handle "Generate Ticket" click inside drawer
  const handleGenerateTicket = () => {
    setShowTicketInDrawer(true);
  };

  if (!router.isReady) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        paddingBottom: "2rem",
      }}
      className="pb-md-4 pb-5"
    >
      <Container>
        {isLoading ? (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
            style={{ zIndex: 9999 }}
          >
            <Image
              src={imgLoader}
              alt="Loading..."
              width={60}
              height={60}
              unoptimized
            />
          </div>
        ) : ticketData ? (
          <>
            {systemSetting?.footer_logo && (
              <div className="text-center mb-3">
                <Image
                  src={systemSetting?.footer_logo || ''}
                  alt="Logo"
                  width={200}
                  height={60}
                  className="mh-100"
                  style={{ maxHeight: 60, width: 'auto', objectFit: "contain" }}
                  unoptimized
                />
              </div>
            )}

            <Card className="mb-4 shadow-sm" style={{ border: "none" }}>
              <Card.Body>
                <Row className="g-3 g-md-4">
                  {/* Event Details */}
                  <Col xs={12} md={4} className="border-end-md pe-md-3">
                    <div className="mb-2">
                      <CalendarRange className="me-2" size={14} />
                      Event Name:{" "}
                      <strong>{ticketData?.event?.name || "N/A"}</strong>
                    </div>
                    <div className="mb-2">
                      <Ticket className="me-2" size={14} />
                      Ticket Type:{" "}
                      <strong>{ticketData?.ticket?.name || "N/A"}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <CalendarRange size={12} className="me-1" />
                        <span style={{ fontSize: '0.875rem' }}>Date:</span>{" "}
                        <span style={{ fontSize: '0.875rem' }}>{formattedDate}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock size={12} className="me-1" />
                        <span className="me-1" style={{ fontSize: '0.875rem' }}>Entry:</span>
                        <span style={{ fontSize: '0.875rem' }}>{ticketData?.event?.entry_time || "N/A"}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock size={12} className="me-1" />
                        <span className="me-1" style={{ fontSize: '0.875rem' }}>Start:</span>
                        <span style={{ fontSize: '0.875rem' }}>{ticketData?.event?.start_time || "N/A"}</span>
                      </div>
                    </div>
                  </Col>

                  {/* Location */}
                  <Col xs={12} md={4} className="border-end-md px-md-3">
                    <h6 className="mb-3 fw-semibold d-flex align-items-center">
                      <MapPin className="me-2" size={18} /> Location
                      <span style={{ fontWeight: '400', marginLeft: "1rem" }}>{ticketData?.event?.address || "N/A"}</span>
                    </h6>
                  </Col>

                  {/* Order Summary */}
                  <Col xs={12} md={4} className="ps-md-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>Qty:</strong>{" "}
                        {ticketCount}
                      </div>
                      <div>
                        <strong>Price per ticket:</strong>{" "}
                        {ticketData?.ticket?.price > 0
                          ? `${ticketData?.ticket?.currency} ${ticketData?.ticket?.price}`
                          : "Free"}
                      </div>
                      <div>
                        <strong style={{ fontSize: "1.1rem" }}>
                          Total:{" "}
                          {ticketData?.ticket?.amount > 0
                            ? `${ticketData?.ticket?.currency || "INR"} ${ticketData?.ticket?.amount}`
                            : "Free"}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* User Information */}
                {ticketData?.users && (
                  <div className=" pt-4 border-top">
                    <div className="text-center">
                      <h6 className="mb-4 fw-semibold d-flex justify-content-center align-items-center">
                        <UserRound className="me-2" size={18} /> Booked By
                      </h6>
                    </div>
                    <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3 w-100">
                      <div className="d-flex flex-wrap gap-3">
                        <div className="d-flex align-items-center">
                          <User size={16} />
                          <span className="ms-2 fw-medium">{ticketData.users?.name || "N/A"}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Phone size={16} />
                          <span className="ms-2 fw-medium">{ticketData.users?.number || "N/A"}</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-2 mt-lg-0">
                        <Mail size={16} />
                        <span className="ms-2 fw-medium">{ticketData.users?.email || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Desktop Combine and Download Buttons - Hidden on mobile */}
            <div className="text-center mb-4 d-none d-md-block">
              {ticketCount > 1 ? (
                <>
                  {disableCombineButton && (
                    <Button
                      variant="success"
                      onClick={() => handleDownloadClick('combine')}
                      size="lg"
                      className="me-3"
                      disabled={!imageLoaded && cardImageUrl}
                    >
                      <Ticket size={20} className="me-2" />
                      Combined Ticket
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => handleDownloadClick('download')}
                    size="lg"
                    disabled={!imageLoaded && cardImageUrl}
                  >
                    <Download size={20} className="me-2" />
                    Individual Tickets
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleDownloadClick('single')}
                  size="lg"
                  disabled={!imageLoaded && cardImageUrl}
                >
                  <Download size={20} className="me-2" />
                  Download Ticket
                </Button>
              )}
            </div>

            <Card className="mt-5 shadow-sm">
              <Card.Body style={{ overflowY: "auto" }}>
                <h5 className="mb-3">Terms & Conditions</h5>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<div>${ticketData?.event?.ticket_terms || ''}</div>`,
                  }}
                />
              </Card.Body>
            </Card>
          </>
        ) : (
          <Card className="text-center py-4">
            <Card.Body>
              <p className="text-danger">
                {hasError ? errorMessage : "No ticket data available"}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Fixed Footer Combine and Download Buttons - Visible only on mobile (< md) */}
        {ticketData && (
          <div
            className="d-md-none bg-white"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '1rem',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
              zIndex: 1000,
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <div className="d-flex gap-2">
              {ticketCount > 1 ? (
                <>
                  {disableCombineButton && (
                    <Button
                      variant="success"
                      onClick={() => handleDownloadClick('combine')}
                      className="flex-fill"
                      size="lg"
                      disabled={!imageLoaded && cardImageUrl}
                    >
                      <Ticket size={20} className="me-2" />
                      Combined
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => handleDownloadClick('download')}
                    className="flex-fill"
                    size="lg"
                    disabled={!imageLoaded && cardImageUrl}
                  >
                    <Download size={20} className="me-2" />
                    Individual
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleDownloadClick('single')}
                  className="w-100"
                  size="lg"
                  disabled={!imageLoaded && cardImageUrl}
                >
                  <Download size={20} className="me-2" />
                  Download Ticket
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Drawer/Offcanvas for Combine/Download actions */}
        <Offcanvas
          show={showDrawer}
          onHide={() => {
            setShowDrawer(false);
            setShowTicketInDrawer(false);
          }}
          placement="bottom"
          style={{ height: showTicketInDrawer ? '90vh' : 'auto' }}
        >
          <Offcanvas.Header closeButton className="pb-0 mb-0">
            <Offcanvas.Title className="text-center mb-0 pb-0 w-100">
              {showTicketInDrawer
                ? (drawerType === 'combine' ? 'Combined Ticket' : drawerType === 'single' ? 'Your Ticket' : 'Individual Tickets')
                : 'Important Notice !!!'
              }
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="position-relative" style={{ paddingBottom: !showTicketInDrawer ? '80px' : '0' }}>
            <div className={`text-center d-flex flex-column ${showTicketInDrawer ? 'h-100' : ''}`}>
              {!showTicketInDrawer ? (
                <div className="d-flex align-items-center justify-content-center mt-0 mb-0 pt-0 py-4">
                  <div>
                    {drawerType === 'combine' ? (
                      <p className="text-danger mb-0" style={{ fontSize: '1.2rem', lineHeight: '1.6', }}>
                        If everyone is coming together, choose Combined Ticket. Only one QR code will be scanned for the whole group — it saves time at the entry gate!
                      </p>
                    ) : drawerType === 'single' ? (
                      <p className="text-danger mb-0" style={{ fontSize: '1.2rem', lineHeight: '1.6', padding: '0 1rem' }}>
                        Your ticket is ready to download. Use the QR code at the entry gate for quick access.
                      </p>
                    ) : (
                      <p className="text-danger mb-0" style={{ fontSize: '1.2rem', lineHeight: '1.6', padding: '0 1rem' }}>
                        If people are arriving separately, choose Individual Ticket, so each person gets their own QR code.
                      </p>
                    )}
                    {/* Desktop Button - Hidden on mobile */}
                    <div className="d-none d-md-block mt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGenerateTicket}
                        className="px-5"
                      >
                        <Ticket size={20} className="me-2" />
                        {drawerType === 'combine' ? 'Generate Combined Ticket' : drawerType === 'single' ? 'Generate Ticket' : 'Generate Individual Tickets'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Ticket Display in Drawer
                <div className="flex-grow-1 d-flex align-items-center justify-content-center p-2 bg-black rounded" style={{ overflow: 'auto' }}>
                  {drawerType === 'combine' || drawerType === 'single' ? (
                    <div className="text-center w-100">
                      {imageLoaded ? (
                        <div className="d-flex flex-column align-items-center">
                          <TicketCanvas
                            showDetails={false}
                            group={drawerType === 'single' ? false : true}
                            ticketName={ticketData?.ticket?.name || "Event Ticket"}
                            userName={ticketData?.users?.name || "Guest"}
                            number={ticketData?.users?.number || "N/A"}
                            address={ticketData?.event?.address || "Venue not specified"}
                            ticketBG={cardImageUrl}
                            preloadedImage={true}
                            date={formattedDate}
                            time={timeString}
                            photo={null}
                            OrderId={drawerType === 'single' && ticketData?.data?.[0]?.token ? ticketData.data[0].token : orderId}
                            showPrintButton={false}
                            ticketNumber={drawerType === 'single' ? 1 : undefined}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <Image src={imgLoader} alt="Loading..." width={100} height={100} unoptimized />
                          <p className="text-white mt-2">Loading image...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    ticketData?.data?.length > 0 && (
                      <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        style={{ paddingBottom: "40px" }}
                      >
                        {ticketData?.data?.map((item, index) => (
                          <SwiperSlide key={item.token}>
                            <div className="text-center w-100 d-flex justify-content-center" id={`ticket-${item.token}`}>
                              {imageLoaded ? (
                                <TicketCanvas
                                  showDetails={false}
                                  ticketName={ticketData?.ticket?.name || "Event Ticket"}
                                  userName={ticketData?.users?.name || "Guest"}
                                  number={ticketData?.users?.number || "N/A"}
                                  address={ticketData?.event?.address || "Venue not specified"}
                                  ticketBG={cardImageUrl}
                                  preloadedImage={true}
                                  date={formattedDate}
                                  time={timeString}
                                  photo={null}
                                  OrderId={item.token}
                                  showPrintButton={false}
                                  group={false}
                                  ticketNumber={index + 1}
                                />
                              ) : (
                                <div className="text-center py-5">
                                  <Image src={imgLoader} alt="Loading..." width={100} height={100} unoptimized />
                                  <p className="text-white mt-2">Loading image...</p>
                                </div>
                              )}
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer Button - Mobile Only */}
            {!showTicketInDrawer && (
              <div
                className="d-md-none bg-white"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem',
                  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                  borderTop: '1px solid #e0e0e0'
                }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerateTicket}
                  className="w-100"
                >
                  <Ticket size={20} className="me-2" />
                  {drawerType === 'combine' ? 'Generate Combined Ticket' : drawerType === 'single' ? 'Generate Ticket' : 'Generate Individual Tickets'}
                </Button>
              </div>
            )}
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </div>
  );
};

export default UserCard;