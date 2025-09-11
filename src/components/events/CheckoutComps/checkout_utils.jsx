
export const createOrderData = (data, charges) => ({
  baseAmount: Number((data?.subtotal || 0).toFixed(2)),
  // subTotal:   || 0,
  totalTickets: data?.newQuantity || 0,
  discount: Number((data?.discount || 0).toFixed(2)),
  cgst: Number((charges?.centralGST || 0).toFixed(2)),
  sgst: Number((charges?.stateGST || 0).toFixed(2)),
  convenienceFees: Number((charges?.convenienceFees || 0).toFixed(2)),
  totalSavings: 150
});




export const getBreakdownData = (orderData, calculatedTotal) => [
  {
    label: "Sub Total",
    value: calculatedTotal,
    className: "custom-text-secondary fw-semibold"
  },
  {
    label: "Total Tickets",
    value: orderData.totalTickets,
    className: "custom-text-secondary fw-semibold",
    isNumber: false
  },
  ...(orderData.discount > 0 ? [{
    label: "Discount",
    value: orderData.discount,
    className: "text-success fw-semibold",
    prefix: "-"
  }] : []),
  {
    label: "Base Amount",
    value: orderData.baseAmount,
    className: "fw-semibold",
    isBorder: true
  },
  {
    label: "Convenience fees",
    value: orderData.convenienceFees,
    className: "small",
    labelClass: "small"
  },
  {
    label: "Central GST (CGST) @ 9%",
    value: orderData.cgst,
    className: "small",
    labelClass: "ms-2 ps-3 small text-muted",
    lableStyle: { fontSize: '0.65rem' }
  },
  {
    label: "State GST (SGST) @ 9%",
    value: orderData.sgst,
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
  orderData,
  calculatedTotal,
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
        {orderData.totalTickets} ticket{orderData.totalTickets > 1 ? 's' : ''}
        {orderData?.discount > 0 && (
          <span className="text-success ms-2">
            • You save ₹{orderData?.discount?.toLocaleString()}
          </span>
        )}
      </small>
    </div>
    <div className="d-flex align-items-center gap-2">
      <h4 className="mb-0 custom-text-secondary fw-bold">
        ₹{calculatedTotal?.toLocaleString()}
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
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Form, Button, Table, Card, InputGroup } from 'react-bootstrap';
import { Receipt, Tag, ChevronDown, Ticket, Crown } from 'lucide-react';
import { ANIMATION_TIMINGS, ANIMATION_VARIANTS, CUSTOM_SECONDORY } from '../../../utils/consts';
import { decrypt } from '../../../utils/crypto';

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
        <strong>E-Ticket Terms and Conditions</strong>
      </div>
      <div className="mb-2" style={{ fontWeight: 500 }}>
        <span>E-Ticket saves the planet. Go for eco-clean.</span>
      </div>
      <ol className="mt-2 mb-0">
        <li>
          Customers can access their tickets from the{" "}
          <b>"My Profile"</b> section on the mobile web.
        </li>
        <li>It is mandatory to present the ticket at the venue.</li>
        <li>
          No physical tickets are required to enter the venue.
          Download E-ticket before visiting the event venue.
        </li>
      </ol>
    </Alert>
  </MotionWrapper>
);

export const PromoCodeSection = ({
  couponCode,
  setCouponCode,
  handleApplyCoupon
}) => (
  <MotionWrapper variant="fadeIn" delay={0.4} className="p-4 border-bottom">
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
      >
        Apply
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

export const BreakdownTable = ({ orderData, calculatedTotal }) => {
  const breakdownData = getBreakdownData(orderData, calculatedTotal);

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
  const { eventName, ticketName, price, quantity, subTotal, processingFee, total } = props;
  const sectionIconStyle = {
    color: CUSTOM_SECONDORY,
    size: 20,
    style: { marginRight: '10px' }
  };

  return (
    <Card className="mb-4 custom-dark-bg">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <Ticket {...sectionIconStyle} />
          <h5 className="text-white mb-0 fw-bold">Ticket Details</h5>
        </div>

        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="text-white fw-bold fs-5">
              {eventName}
            </div>
            <div className="d-flex align-items-center mt-1">
              <Crown size={18} className='text-warning fw-bold me-2' />
              <span className='text-warning fw-bold'>{ticketName}</span>
            </div>
          </div>
          <div className="text-end">
            <div className='custom-text-secondary h5 fw-bold'>₹{price}</div>
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

        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Subtotal</span>
          <span className="text-white fw-bold">₹{subTotal}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>Processing Fee</span>
          <span className="text-white fw-bold">₹{processingFee || 0}</span>
        </div>
        <div style={{ borderTop: '1px solid #3a3a3a' }} className='my-2' />

        <div className="d-flex justify-content-between align-items-center">
          <span className="text-white fw-bold fs-5">Total Amount</span>
          <span className='custom-text-secondary h5 fw-bold'>₹{total}</span>
        </div>
      </Card.Body>
    </Card>
  )
}