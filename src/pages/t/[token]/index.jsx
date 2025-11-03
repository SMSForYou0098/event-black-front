import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Button, Container, Modal, Card, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import moment from "moment";
import {
  CalendarRange,
  Clock,
  Mail,
  MapPin,
  Phone,
  Ticket,
  User,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useMyContext } from "@/Context/MyContextProvider";
import TicketCanvas from "@/components/events/Tickets/Ticket_canvas";

const UserCard = () => {
  const { api, ErrorAlert, systemSetting } = useMyContext();
  const router = useRouter();
  const { token: orderId } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [cardImage, setCardImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const [downloadTicketType, setDownloadTicketType] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [imageDimensions, setImageDimensions] = useState({
    width: 204,
    height: 307,
  });

  const combinedTicketRef = useRef();

  useEffect(() => {
    if (cardImage) {
      const img = new window.Image();
      img.src = cardImage;
      img.onload = () => {
        setImageDimensions({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        setImageDimensions({ width: 204, height: 307 });
      };
    }
  }, [cardImage]);

  const fetchTicketData = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const { data: tokenRes } = await axios.get(
        `${api}generate-token/${orderId}`
      );

      if (!tokenRes.status) {
        const msg = "No data found for this order ID";
        setErrorMsg(msg);
        ErrorAlert(msg);
        setLoading(false);
        return;
      }

      const token = tokenRes.token;

      const { data: ganCardData } = await axios.get(`${api}gan-card/${token}`);

      if (!ganCardData.status) {
        const msg = "Unable to retrieve ticket details";
        setErrorMsg(msg);
        ErrorAlert(msg);
        setLoading(false);
        return;
      }

      setTicketData(ganCardData);

      const price = ganCardData.ticket?.price || 0;
      const quantity = ganCardData.data?.length || 0;
      setTotalPrice(price * quantity);

      const cardUrl = ganCardData.card_url;
      if (cardUrl) {
        const res = await axios.post(
          `${api}get-image/retrive`,
          { path: cardUrl },
          { responseType: "blob" }
        );
        setCardImage(URL.createObjectURL(res.data));
      }

      setErrorMsg("");
    } catch (error) {
      const err =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch ticket data";
      setErrorMsg(err);
      ErrorAlert(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady && orderId) {
      fetchTicketData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, router.isReady]);

  const formatDateRange = (dateRange) => {
    if (!dateRange) return "";
    const dates = dateRange.split(",");
    if (dates.length === 2) {
      return `${moment(dates[0]).format("MMM D, YYYY")} - ${moment(
        dates[1]
      ).format("MMM D, YYYY")}`;
    }
    return dateRange;
  };

  const handleDownloadClick = () => {
    const ticketCount = ticketData?.data?.length || 0;

    if (ticketCount <= 1) {
      setDownloadTicketType({ type: "individual" });
      setShow(true);
      return;
    }

    Swal.fire({
      title: "Download Ticket",
      text: "Choose how you want to download your ticket",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Combine",
      cancelButtonText: "Individual",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setDownloadTicketType({ type: "combined" });
        setShow(true);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        setDownloadTicketType({ type: "individual" });
        setShow(true);
      }
    });
  };

  if (!router.isReady) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "2rem 1rem",
      }}
    >
      <Container>
        {loading ? (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999 }}
          >
            <Image
              src="/assets/event/stock/loader111.gif"
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
                  style={{ maxHeight: 60, width: 'auto', objectFit: "contain" }}
                  unoptimized
                />
              </div>
            )}

            <Card className="mb-4 shadow-sm" style={{ border: "none", background: "#fff" }}>
              <Card.Body style={{ color: "#000" }}>
                {/* Event, Location, and Order Summary */}
                <Row className="g-3 g-md-4">
                  {/* Event Details */}
                  <Col xs={12} md={4} className="border-end-md pe-md-3">
                    <div className="mb-2">
                      <CalendarRange className="me-2" size={14} />
                      Event Name:{" "}
                      <strong className="text-dark">{ticketData?.event?.name || "N/A"}</strong>
                    </div>
                    <div className="mb-2">
                      <Ticket className="me-2" size={14} />
                      Ticket Type:{" "}
                      <strong className="text-dark">{ticketData?.ticket?.name || "N/A"}</strong>
                    </div>
                    <div className="mb-2 d-flex align-items-center">
                      <CalendarRange size={16} className="me-2" />Date: {" "}
                      <span>
                        {formatDateRange(ticketData?.event?.date_range) ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Clock size={16} className="me-2" />
                        <span className="fw-medium me-1">Entry Time:</span>
                        <span>{ticketData?.event?.entry_time || "N/A"}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock size={16} className="me-2 " />
                        <span className="fw-medium me-1">Start Time:</span>
                        <span>{ticketData?.event?.start_time || "N/A"}</span>
                      </div>
                    </div>
                  </Col>
                  {/* Location */}
                  <Col xs={12} md={4} className="border-end-md px-md-3">
                    <h6 className="mb-3 fw-semibold text-dark d-flex align-items-center">
                      <MapPin className="me-2" size={18} /> Location
                      <span style={{ fontWeight: '400', marginLeft:"1rem" }}>
                        {ticketData?.event?.address || "N/A"}
                      </span>
                    </h6>
                  </Col>
                  {/* Order Summary */}
                  <Col xs={12} md={4} className="ps-md-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong className="text-dark">Qty:</strong>{" "}
                        {ticketData?.data?.length || 0}
                      </div>
                      <div>
                        <strong className="text-dark">Price per ticket:</strong>{" "}
                        {ticketData?.ticket?.price > 0
                          ? `${ticketData?.ticket?.currency} ${ticketData?.ticket?.price}`
                          : "Free"}
                      </div>
                      <div className="">
                        <strong
                          className="text-primary"
                          style={{ fontSize: "1.1rem" }}
                        >
                          Total:{" "}
                          {ticketData?.ticket?.amount > 0
                            ? `${
                              ticketData?.ticket?.currency || "INR"
                            } ${ticketData?.ticket?.amount}`
                            : "Free"}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* User Information */}
                {ticketData?.users && (
                  <div className="mt-4 pt-4 border-top">
                    <div className="text-center">
                      <h6 className="mb-4 fw-semibold text-dark d-flex justify-content-center align-items-center">
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

            <div className="text-center mb-4">
              <Button variant="primary" onClick={handleDownloadClick} size="lg">
                Download Tickets
              </Button>
            </div>
            
            <Card className="mt-5 shadow-sm">
              <Card.Body style={{ overflowY: "auto", color: "black" }}>
                <h5 className="mb-3">Terms & Conditions</h5>
                <ul className="mb-0 ps-3">
                  {ticketData?.event?.ticket_terms
                    ?.split(/\r?\n/)
                    .filter((line) => line.trim() !== "")
                    .map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                </ul>
              </Card.Body>
            </Card>
          </>
        ) : (
          <Card className="text-center py-4">
            <Card.Body>
              <p className="text-danger">
                {errorMsg || "No ticket data available"}
              </p>
            </Card.Body>
          </Card>
        )}

        {/* Modal for Individual Tickets */}
        <Modal
          show={show && downloadTicketType?.type === "individual"}
          onHide={() => setShow(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Individual Tickets</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              style={{ paddingBottom: "40px" }}
            >
              {ticketData?.data?.map((item, index) => (
                <SwiperSlide key={item.token}>
                  <div className="text-center" style={{maxHeight:'40rem'}} id={`ticket-${item.token}`}>
                    <TicketCanvas
                      showDetails={false}
                      ticketName={ticketData?.ticket?.name || "Event Ticket"}
                      userName={ticketData?.users?.name || "Guest"}
                      number={ticketData?.users?.number || "N/A"}
                      address={ticketData?.event?.address || "Venue not specified"}
                      ticketBG={ticketData?.card_url}
                      date={formatDateRange(ticketData?.event?.date_range) || "Date not specified"}
                      time={`${ticketData?.event?.entry_time || ""} ${ticketData?.event?.start_time ? `- ${ticketData.event.start_time}` : ""}`.trim()}
                      photo={null}
                      OrderId={item.token}
                      showPrintButton={false}
                      ticketNumber={index+1}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </Modal.Body>
        </Modal>

        {/* Modal for Combined Ticket */}
        <Modal
          show={show && downloadTicketType?.type === "combined"}
          onHide={() => setShow(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Combined Ticket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={combinedTicketRef} className="text-center">
              <TicketCanvas
                showDetails={false}
                ticketName={ticketData?.ticket?.name || "Event Ticket"}
                userName={ticketData?.users?.name || "Guest"}
                number={ticketData?.users?.number || "N/A"}
                address={ticketData?.event?.address || "Venue not specified"}
                ticketBG={ticketData?.card_url}
                date={formatDateRange(ticketData?.event?.date_range) || "Date not specified"}
                time={`${ticketData?.event?.entry_time || ""} ${ticketData?.event?.start_time ? `- ${ticketData.event.start_time}` : ""}`.trim()}
                photo={null}
                OrderId={orderId}
                showPrintButton={false}
              />
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default UserCard;
