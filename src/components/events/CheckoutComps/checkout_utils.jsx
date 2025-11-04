import { useEffect, useState } from "react";
import { useMyContext } from "@/Context/MyContextProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Form, Button, Table, Card, InputGroup, Spinner, Offcanvas, ListGroup } from 'react-bootstrap';
import { Receipt, Tag, ChevronDown, Ticket, Crown } from 'lucide-react';
import CustomBtn from '../../../utils/CustomBtn';
import { ANIMATION_TIMINGS, ANIMATION_VARIANTS, CUSTOM_SECONDORY } from '../../../utils/consts';
import { decrypt } from '../../../utils/crypto';
import Image from "next/image";

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
    label: "Central GST (CGST) @ 9%",
    value: summaryData?.totalCentralGST,
    className: "small",
    labelClass: "ms-2 ps-3 small text-muted",
    lableStyle: { fontSize: '0.65rem' }
  },
  {
    label: "State GST (SGST) @ 9%",
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
      <span className="text-success fw-semibold">
        🎉 Total Savings on this order
      </span>
      <span className="fw-bold text-success fs-5">
        ₹{totalSavings.toLocaleString()}
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
      <h5 className="mb-1 fw-bold">Total Amount</h5>
      <small className="">
        {summaryData?.quantity} ticket{summaryData?.quantity > 1 ? 's' : ''}
        {summaryData?.discount > 0 && (
          <span className="text-success ms-2">
            • You save ₹{summaryData?.discount?.toLocaleString()}
          </span>
        )}
      </small>
    </div>
    <div className="d-flex align-items-center gap-2">
      <h4 className="mb-0 custom-text-secondary fw-bold">
        {/* ₹{calculatedTotal?.toLocaleString()} */}
        ₹{summaryData?.totalFinalAmount?.toLocaleString()}
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
        <Receipt size={20} className="me-2" />
        <span>E-Ticket saves the planet. Go for eco-clean.</span>
      </div>
      <div className="mb-2" style={{ fontWeight: 500 }}>
      </div>
      <ol className="mt-2 mb-0">
 
        <li>
        View tickets in 'My Profile' on mobile web.
        </li>
        <li>E-ticket required for entry. Download and present at the venue.</li>
        <li>
        Check our entry guide video on YouTube & Inst agram.
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
}) => (
  <MotionWrapper variant="fadeIn" delay={0.4} className="p-2 m-2 border-bottom">
    <InputGroup>
      <InputGroup.Text className="custom-dark-content-bg border-0 rounded-3 rounded-end-0">
        <Tag size={18} />
      </InputGroup.Text>
      <Form.Control
        type="text"
        className="custom-dark-content-bg rounded-3 rounded-start-0 border-0"
        placeholder="Enter promo code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
      />
      <Button
        variant="primary"
        size="sm"
        className="rounded-3 rounded-start-0"
        onClick={handleApplyCoupon}
        disabled={promoCodeLoading}
        aria-disabled={promoCodeLoading}
        aria-busy={promoCodeLoading}
      >
        {promoCodeLoading ? (
          <>
            <Spinner
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            <span>Applying…</span>
          </>
        ) : (
          <>Apply</>
        )}
      </Button>
    </InputGroup>
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
  const { eventName, ticketName, price, quantity, subTotal, processingFee, total, hidePrices, netAmount, sale_price, currency,handleOpen,attendees,showAttBtn } = props;

  const { getCurrencySymbol } = useMyContext()

  return (
    <Card className="custom-dark-bg">
      <Card.Body className="p-4 pb-0">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="text-white fw-bold fs-6">
              {eventName}
            </div>
            <div className="d-flex align-items-center mt-1">
              <Crown size={18} className='text-warning fw-bold me-2' />
              <span className='text-warning fs-6 fw-bold'>{ticketName}</span>
            </div>
          </div>
          <div className="text-end">
            <div className='custom-text-secondary h5 fw-bold'> {currency ? getCurrencySymbol(currency) : '₹'} {price}</div>
            <small>per ticket</small>
          </div>
        </div>

        <div className="custom-dark-content-bg d-flex justify-content-between align-items-center my-3 p-3 rounded-3">
          <div className="d-flex align-items-center">
            <Ticket size={18} style={{ marginRight: '10px' }} />
            <span style={{ color: '#b0b0b0' }}>Quantity</span>
          </div>
          <span className="text-white fw-bold fs-6">{quantity}</span>
        </div>
        {!hidePrices &&
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Subtotal</span>
              <span className="text-white fw-bold">{currency ? getCurrencySymbol(currency) : '₹'}{subTotal}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Processing Fee</span>
              <span className="text-white fw-bold">{currency ? getCurrencySymbol(currency) : '₹'}{processingFee || 0}</span>
            </div>
            <div style={{ borderTop: '1px solid #3a3a3a' }} className='my-2' />

            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white fw-bold fs-5">Total Amount</span>
              <span className='custom-text-secondary h5 fw-bold'>{currency ? getCurrencySymbol(currency) : '₹'}{total}</span>
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
                style={{background: 'rgba(0,0,0,0.3)'}}
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
                    <div className="fw-semibold">{a?.Name ?? "Unknown"}</div>
                    {/* optional small id badge */}
                    {/* {a?.user_id != null && (
                      <small className="text-muted ms-2">ID: {a.user_id}</small>
                    )} */}
                  </div>

                  <div className="mt-1">
                    <div className="text-muted small">
                      <strong>Phone:</strong> {a?.Mo ?? "—"}
                    </div>
                    <div className="text-muted small">
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
