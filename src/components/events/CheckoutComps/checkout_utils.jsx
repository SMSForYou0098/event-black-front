import { useEffect, useState } from "react";
import { useMyContext } from "@/Context/MyContextProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Form, Button, Table, Card, InputGroup, Spinner, Offcanvas, ListGroup, Row, Col } from 'react-bootstrap';
import { Receipt, Tag, ChevronDown, Ticket, Crown, InstagramIcon, Calendar, Clock, MapPin, User, Sofa, X } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import { ANIMATION_TIMINGS, ANIMATION_VARIANTS, CUSTOM_SECONDORY, PRIMARY } from '../../../utils/consts';
import { decrypt } from '../../../utils/crypto';
import Image from "next/image";
import { FaInstagram, FaYoutube } from "react-icons/fa";

export const getBreakdownData = (summaryData) => [
  {
    label: "Sub Total",
    value: summaryData?.subTotal,
    className: "custom-text-secondary fw-semibold"
  },
  {
    label: "Total Tickets",
    value: summaryData?.quantity,
    className: "custom-text-secondary fw-semibold",
    isNumber: false
  },
  ...(summaryData.discount > 0 ? [{
    label: "Discount",
    value: summaryData?.discount,
    className: "text-success fw-semibold",
    prefix: "-"
  }] : []),
  {
    label: "Base Amount",
    value: summaryData?.totalBaseAmount,
    className: "fw-semibold",
    isBorder: true
  },
  {
    label: "Convenience fees",
    value: summaryData?.totalConvenienceFee,
    className: "small",
    labelClass: "small"
  },
  {
    label: "(CGST) @ 9%",
    value: summaryData?.totalCentralGST,
    className: "small",
    labelClass: "ms-2 ps-3 small text-muted",
    lableStyle: { fontSize: '0.65rem' }
  },
  {
    label: "(SGST) @ 9%",
    value: summaryData?.totalStateGST,
    className: "small",
    labelClass: "ms-2 ps-3 small text-muted",
    lableStyle: { fontSize: '0.65rem' }
  },
];
export const SavingsHighlight = ({ totalSavings }) => (
  <MotionWrapper
    variant="scale"
    delay={0.6}
    className="rounded-2 p-3 border-top"
  >
    <div className="d-flex justify-content-between align-items-center">
      <span className="text-success w-100 text-center fw-semibold" style={{ fontSize: '18px' }}>
        🎉 Great job! You saved ₹{totalSavings.toLocaleString()}!
      </span>
    </div>
  </MotionWrapper>
);

export const TotalAmountHeader = ({
  summaryData,
  isExpanded,
  setIsExpanded
}) => (
  <motion.div
    className="d-flex justify-content-between align-items-center cursor-pointer"
    onClick={() => setIsExpanded(!isExpanded)}
    style={{ cursor: "pointer" }}
    whileHover={{
      backgroundColor: "rgba(0,0,0,0.02)",
      borderRadius: "8px",
      padding: "12px",
      margin: "-12px",
    }}
    transition={{ duration: ANIMATION_TIMINGS.fast }}
  >
    <div>
      <h6 className="mb-1 fw-bold">Total Amount</h6>
      <small style={{ fontSize: '14px' }}>
        {summaryData?.quantity} ticket{summaryData?.quantity > 1 ? 's' : ''}
        {summaryData?.discount > 0 && (
          <span className="text-success ms-2">
            • You save ₹{summaryData?.discount?.toLocaleString()}
          </span>
        )}
      </small>
    </div>
    <div className="d-flex align-items-center gap-2">
      <h4 className="mb-0 fw-bold" style={{ fontSize: '20px' }}>
        {summaryData?.discount > 0 ? (
          <>
            {/* Original Price (strikethrough) */}
            <span
              className="text-muted me-2"
              style={{ textDecoration: "line-through", fontWeight: "500" }}
            >
              ₹{summaryData?.totalFinalAmount?.toLocaleString()}
            </span>

            {/* Discounted Price */}
            <span className="text-success fw-bold">
              ₹{(summaryData?.totalFinalAmount - summaryData?.discount)?.toLocaleString()}
            </span>
          </>
        ) : (
          // No discount — show the normal total
          <span className="custom-text-secondary fw-bold">
            ₹{summaryData?.totalFinalAmount?.toLocaleString()}
          </span>
        )}
      </h4>


      <motion.div
        variants={ANIMATION_VARIANTS.chevron}
        animate={isExpanded ? "expanded" : "collapsed"}
      >
        <ChevronDown size={20} />
      </motion.div>
    </div>
  </motion.div>
);


export const MotionWrapper = ({
  children,
  variant = "fadeInUp",
  delay = 0,
  className = "",
  ...props
}) => (
  <motion.div
    {...ANIMATION_VARIANTS[variant]}
    transition={{ duration: ANIMATION_TIMINGS.normal, delay }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const ETicketAlert = () => (
  <MotionWrapper variant="fadeInDown">
    <Alert variant="success" className="mb-4 border-0 shadow-sm">
      <div className="d-flex align-items-center mb-2">
        <Ticket size={20} className="me-2" />
        <span>E-Ticket saves the planet. Go for eco-clean.</span>
      </div>
      <div className="mb-2" style={{ fontWeight: 500, fontSize: '14px' }}>
      </div>
      <ol className="mt-2 mb-0" style={{ fontSize: '14px' }}>

        <li>
          View tickets in 'My Profile' on mobile web.
        </li>
        <li>E-ticket required. Download and present.</li>
        <li>
          Watch the video to enter easily<span className="fw-semibold">
            <a
              href="https://www.youtube.com/watch?v=QIVkT5Iie3c"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-underline ms-1 me-2"
            >
              <FaYoutube className="me-0" />
            </a>
            &
            <a
              href="https://www.instagram.com/getyourticket.in/p/DQZXxmHCNYU/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-underline ms-2"
            >
              <FaInstagram className="me-1" />
            </a>
          </span>.
        </li>
      </ol>
    </Alert>
  </MotionWrapper>
);

export const PromoCodeSection = ({
  couponCode,
  setCouponCode,
  handleApplyCoupon,
  promoCodeLoading,
  handleRemoveCoupon,
  appliedPromoCode,
  appliedDiscount = 0,
}) => (
  <MotionWrapper variant="fadeIn" delay={0.4} className="py-2 border-bottom">
    <InputGroup>
      <InputGroup.Text className="custom-dark-content-bg border-0 rounded-3 rounded-end-0">
        <Tag size={18} />
      </InputGroup.Text>
      <Form.Control
        type="text"
        className="custom-dark-content-bg rounded-3 rounded-start-0 border-0"
        placeholder="Enter promo code"
        value={couponCode}
        onChange={(e) => setCouponCode((e.target.value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleApplyCoupon();
          }
        }}
      />
      <CustomBtn
        variant="primary"
        size="sm"
        className="rounded-start-0"
        HandleClick={handleApplyCoupon}
        disabled={promoCodeLoading}
        loading={promoCodeLoading}
        buttonText={promoCodeLoading ? "Applying..." : "Apply"}
        hideIcon={true}
      />
    </InputGroup>
    {!!appliedPromoCode && (
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-success">
          Applied: {appliedPromoCode} {Number(appliedDiscount) > 0 ? `( -₹${Number(appliedDiscount).toLocaleString()} )` : ""}
        </small>
        <Button
          type="button"
          variant="light"
          size="sm"
          className="p-0 py-1 px-1"
          style={{ lineHeight: 0 }}
          onClick={handleRemoveCoupon}
        >
          <X size={14} color={PRIMARY} />
        </Button>
      </div>
    )}
  </MotionWrapper>
);

export const BreakdownRow = ({ item, index }) => (
  <motion.tr
    custom={index}
    variants={ANIMATION_VARIANTS.tableRow}
    initial="hidden"
    animate="visible"
    className={item.isBorder ? "border-top " : ""}
  >
    <td style={item?.lableStyle} className={`border-0 py-${item.isBorder ? "2" : "1"} ${item.labelClass || ""} bg-transparent`}>
      {item.label}
    </td>
    <td className={` border-0 py-${item.isBorder ? "2" : "1"} text-end ${item.className} bg-transparent`}>
      {item.isNumber === false
        ? item.value
        : `${item.prefix || ""}₹${item?.value?.toLocaleString()}`}
    </td>
  </motion.tr>
);

export const BreakdownTable = ({ summaryData }) => {
  const breakdownData = getBreakdownData(summaryData);

  return (
    <div className="rounded-2">
      <Table className="table-sm mb-0" style={{ fontSize: "14px" }}>
        <tbody className='bg-transparent'>
          {breakdownData.map((item, index) => (
            <BreakdownRow key={item.label} item={item} index={index} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export const parseUrlData = (data, ticket, edata) => {
  try {
    return {
      data: data ? decrypt(data) : null,
      ticket: ticket ? decrypt(ticket) : null,
      edata: edata ? decrypt(edata) : null,
    };
  } catch (error) {
    console.error("Error parsing URL data:", error);
    return { data: null, ticket: null, edata: null };
  }
};

export const TicketDataSummary = (props) => {
  const { eventName, ticketName, price, quantity, subTotal, processingFee, total, hidePrices, currency, summaryData, discount } = props;
  // const { eventName, ticketName, price, quantity, subTotal, processingFee, total, hidePrices, netAmount, sale_price, currency, handleOpen, attendees, showAttBtn } = props;

  const { getCurrencySymbol } = useMyContext()

  const sym = currency ? getCurrencySymbol(currency) : '₹'
  const numPrice = Number(price) || 0
  const numQty = Number(quantity) || 0
  const subNum =
    subTotal != null && subTotal !== '' ? Number(subTotal) : null
  const computedLineSubtotal = numPrice * numQty
  const displaySubTotal =
    subNum != null && Number.isFinite(subNum)
      ? numQty > 1 &&
        Math.round(subNum * 100) === Math.round(numPrice * 100)
        ? computedLineSubtotal
        : subNum
      : computedLineSubtotal

  return (
    <Card className="custom-dark-bg">
      <Card.Body className="p-4 pb-0">
        <div className="d-flex align-items-start gap-3 mb-3 flex-wrap">
          <div className="flex-grow-1 min-w-0">
            <div className="text-white fw-bold" style={{ fontSize: '14px' }}>
              {eventName}
            </div>
            <div className="d-flex align-items-center mt-1">
              <Ticket size={18} className='text-warning fw-bold me-2' />
              <span className='text-warning fw-bold' style={{ fontSize: '14px' }}>{ticketName} * {quantity} </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <small className="text-white">per ticket</small>
            <div className="fw-bold mb-0 text-end">
              {sym}{price}
            </div>
          </div>
        </div>
        {/* 
        <div className="custom-dark-content-bg d-flex justify-content-between align-items-center my-3 p-3 rounded-3">
          <div className="d-flex align-items-center">
            <Ticket size={18} style={{ marginRight: '10px' }} />
            <span style={{ color: '#b0b0b0' }}>Quantity</span>
          </div>
          <span className="text-white fw-bold fs-6">{quantity}</span>
        </div> */}
        {summaryData?.seats?.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '14px' }}>
            <span className="d-flex align-items-center gap-1">
              <Sofa size={14} className="text-success" />
            </span>
            <span className="text-white fw-bold">
              {summaryData.seats.map((seat) => seat.seat_name).join(', ')}
            </span>
          </div>
        )}
        {!hidePrices &&
          <>
            <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '14px' }}>
              <h6>Subtotal</h6>
              <span className="text-white fw-bold h6">{sym}{displaySubTotal}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '14px' }}>
              <span>Processing Fee</span>
              <span className="text-white fw-bold">{sym}{processingFee || 0}</span>
            </div>
            {Number(discount) > 0 && (
              <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: '14px' }}>
                <span>Discount</span>
                <span className="text-success fw-bold">- {sym}{discount}</span>
              </div>
            )}
            {/* <div style={{ borderTop: '1px solid #3a3a3a' }} className='my-2' /> */}

            <div className="d-none d-sm-flex justify-content-between align-items-center">
              <h6 className="text-white fw-bold">Total Amount</h6>
              <span className='custom-text-secondary fw-bold' style={{ fontSize: '18px' }}>{sym}{total}</span>
            </div>
          </>
        }
        {/* {(netAmount || sale_price) &&
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-white fw-bold fs-5">Total Amount</span>
            <span className='custom-text-secondary h5 fw-bold'>{currency ? getCurrencySymbol(currency) : '₹'}{sale_price && sale_price !== 'null' ? sale_price : netAmount}</span>
          </div>
        } */}

      </Card.Body>

    </Card>
  )
}

export const AttendeesOffcanvas = ({
  show,
  handleClose,
  attendees,
  title = "Attendees",
}) => {
  const [placement, setPlacement] = useState("end");
  const { isMobile } = useMyContext()

  useEffect(() => {
    const updatePlacement = () => {
      // mobile breakpoint < 768 => bottom, else end (right)
      setPlacement(isMobile ? "bottom" : "end");
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, []);

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement={isMobile ? "bottom" : "end"}
      backdrop={true}
      scroll={false}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          {title} ({attendees?.length ?? 0})
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {!attendees || attendees.length === 0 ? (
          <div className="text-center text-muted">No attendees found</div>
        ) : (
          <ListGroup >
            {attendees.map((a) => (
              <ListGroup.Item
                key={a?.id ?? Math.random()}
                style={{ background: 'rgba(0,0,0,0.3)' }}
                className="d-flex align-items-start gap-3 rounded-4"
              >
                <div >
                  <Image
                    src={a?.Photo ?? "/placeholder-avatar.png"}
                    roundedCircle
                    alt={a?.Name ?? "Attendee"}
                    width={56}
                    height={56}
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholder-avatar.png";
                    }}
                  />
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-semibold" style={{ fontSize: '14px' }}>{a?.Name ?? "Unknown"}</div>
                    {/* optional small id badge */}
                    {/* {a?.user_id != null && (
                      <small className="text-muted ms-2">ID: {a.user_id}</small>
                    )} */}
                  </div>

                  <div className="mt-1">
                    <div className="text-muted" style={{ fontSize: '14px' }}>
                      <strong>Phone:</strong> {a?.Mo ?? "—"}
                    </div>
                    <div className="text-muted" style={{ fontSize: '14px' }}>
                      <strong>Email:</strong>{" "}
                      {a?.Email ? (
                        <a href={`mailto:${a.Email}`} className="text-decoration-none">
                          {a.Email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    {/* Add other fields here if needed */}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export const BookingMetadataCard = ({
  eventDates,
  bookingDate,
  seatName,
  bookedForDate,
  entryTime,
  startTime,
  venueAddress,
  userName,
  userNumber
}) => {
  return (
    <Card className="custom-dark-bg mb-4">
      <Card.Body className="p-4">
        <Row className="g-3 mb-3">
          {seatName && (
            <Col xs={12}>
              <div className="d-flex align-items-center">
                <Sofa size={14} className="text-success" /> :
                <div>
                  <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{seatName}</div>
                </div>
              </div>
            </Col>
          )}
          <Col xs={6}>
            <div className="d-flex align-items-center">
              <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Date</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{eventDates || 'N/A'}</div>
              </div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-start">
              <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Booking Date</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{bookingDate || 'N/A'}</div>
              </div>
            </div>
          </Col>
          {
            bookedForDate && (
              <Col xs={6}>
                <div className="d-flex align-items-start">
                  <Calendar size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
                  <div>
                    <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Booked For Date</div>
                    <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{bookedForDate || 'N/A'}</div>
                  </div>
                </div>
              </Col>
            )
          }
          <Col xs={6}>
            <div className="d-flex align-items-center">
              <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Entry Time</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{entryTime || 'N/A'}</div>
              </div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center">
              <Clock size={18} style={{ color: '#b0b0b0', marginRight: '10px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Start Time</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{startTime || 'N/A'}</div>
              </div>
            </div>
          </Col>
          <Col xs={12}>
            <div className="d-flex align-items-start">
              <MapPin size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Venue</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{venueAddress || 'Venue Address'}</div>
              </div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-start">
              <User size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Name</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{userName || 'N/A'}</div>
              </div>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-start">
              <User size={18} style={{ color: '#b0b0b0', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <div style={{ color: '#b0b0b0', fontSize: '12px' }}>Contact Number</div>
                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>{userNumber || 'N/A'}</div>
              </div>
            </div>
          </Col>

        </Row>

      </Card.Body>
    </Card>
  )
}
