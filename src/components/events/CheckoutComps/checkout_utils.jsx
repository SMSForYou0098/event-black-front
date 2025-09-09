
export const createOrderData = (data ,overrides = {}) => ({
  baseAmount: data?.subtotal || 0,
  subTotal: data?.subtotal || 0,
  totalTickets: data?.newQuantity || 0,
  discount: data?.discount || 0,
  cgst: data?.cgst || 0,
  sgst: 121.5,
  convenienceFees: 50,
  totalSavings: 150,
  ...overrides
});



export const getBreakdownData = (orderData) => [
  { 
    label: "Sub Total", 
    value: orderData.subTotal, 
    className: "text-primary fw-semibold" 
  },
  { 
    label: "Total Tickets", 
    value: orderData.totalTickets, 
    className: "text-primary fw-semibold",
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
    label: "Central GST (CGST) @ 9%",
    value: orderData.cgst,
    className: "small",
    labelClass: "small text-muted"
  },
  {
    label: "State GST (SGST) @ 9%",
    value: orderData.sgst,
    className: "small",
    labelClass: "small text-muted"
  },
  {
    label: "Convenience fees",
    value: orderData.convenienceFees,
    className: "small",
    labelClass: "small text-muted"
  }
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
      <small className="text-muted">
        {orderData.totalTickets} ticket{orderData.totalTickets > 1 ? 's' : ''}
        {orderData.totalSavings > 0 && (
          <span className="text-success ms-2">
            • You save ₹{orderData.totalSavings.toLocaleString()}
          </span>
        )}
      </small>
    </div>
    <div className="d-flex align-items-center gap-2">
      <h4 className="mb-0 text-primary fw-bold">
        ₹{calculatedTotal.toLocaleString()}
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


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Form, Button, Table } from 'react-bootstrap';
import { Receipt, Tag, ChevronDown } from 'lucide-react';
import { ANIMATION_TIMINGS, ANIMATION_VARIANTS } from '../../../utils/consts';

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
    <div className="d-flex align-items-center gap-2">
      <Tag size={18} className="text-primary" />
      <Form.Control
        type="text"
        placeholder="Enter promo code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
      />
      <Button
        variant="primary"
        size="sm"
        onClick={handleApplyCoupon}
        className="px-3"
      >
        Apply
      </Button>
    </div>
  </MotionWrapper>
);

export const BreakdownRow = ({ item, index }) => (
  <motion.tr
    custom={index}
    variants={ANIMATION_VARIANTS.tableRow}
    initial="hidden"
    animate="visible"
    className={item.isBorder ? "border-top" : ""}
  >
    <td className={`border-0 py-${item.isBorder ? "2" : "1"} ${item.labelClass || ""}`}>
      {item.label}
    </td>
    <td className={`border-0 py-${item.isBorder ? "2" : "1"} text-end ${item.className}`}>
      {item.isNumber === false
        ? item.value
        : `${item.prefix || ""}₹${item.value.toLocaleString()}`}
    </td>
  </motion.tr>
);

export const BreakdownTable = ({ orderData }) => {
  const breakdownData = getBreakdownData(orderData);
  
  return (
    <div className="rounded-2">
      <Table className="table-sm mb-0" style={{ fontSize: "14px" }}>
        <tbody>
          {breakdownData.map((item, index) => (
            <BreakdownRow key={item.label} item={item} index={index} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export const parseUrlData = (data, ticket,edata) => {
  try {
    return {
      data: data ? JSON.parse(data) : null,
      ticket: ticket ? JSON.parse(ticket) : null,
      edata: edata ? JSON.parse(edata) : null,
    };
  } catch (error) {
    console.error("Error parsing URL data:", error);
    return { data: null, ticket: null };
  }
};