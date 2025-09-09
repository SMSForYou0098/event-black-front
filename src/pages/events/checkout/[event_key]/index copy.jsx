import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Alert,
  Form,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { useMyContext } from "@/Context/MyContextProvider";
import { useRouter } from "next/router";
import { getEventById } from "../../../../services/events";
import { useQuery } from "@tanstack/react-query";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import Link from "next/link";
import CustomBtn from "../../../../utils/CustomBtn";
import { ChevronDown, Receipt, Tag } from "lucide-react";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";

const CartPage = () => {
  const router = useRouter();
  const { event_key, data, ticket } = router.query;
  const { isMobile, isLoggedIn } = useMyContext();
  const [couponCode, setCouponCode] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [validatedData, setValidatedData] = useState({
    data: null,
    ticket: null,
  });

  useEffect(() => {
    if (data && ticket) {
      try {
        setValidatedData({
          data: JSON.parse(data),
          ticket: ticket ? JSON.parse(ticket) : null,
        });
      } catch (e) {
        console.error("Error parsing data or ticket from URL:", e);
        setValidatedData({
          data: null,
          ticket: null,
        });
      }
    }
  }, [data]);
  console.log("Validated Data:", validatedData);

  const handleProcess = () => {
    if (!isLoggedIn) {
    }
  };

  const handleApplyCoupon = () => {
    console.log("Applying coupon:", couponCode);
  };

  const orderData = {
    subTotal: 1500,
    totalTickets: 3,
    discount: 150,
    baseAmount: 1350,
    cgst: 121.5,
    sgst: 121.5,
    convenienceFees: 50,
    totalSavings: 150,
  };

  const calculatedTotal =
    orderData.baseAmount +
    orderData.cgst +
    orderData.sgst +
    orderData.convenienceFees;

  // Animation variants
  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const chevronVariants = {
    collapsed: {
      rotate: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    expanded: {
      rotate: 180,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const tableRowVariants = {
    hidden: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
      },
    },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
  };

  const getBreakdownData = (orderData) => [
    {
      label: "Sub Total",
      value: orderData.subTotal,
      className: "text-primary fw-semibold",
    },
    {
      label: "Total Tickets",
      value: orderData.totalTickets,
      className: "text-primary fw-semibold",
      isNumber: false,
    },
    ...(orderData.discount > 0
      ? [
        {
          label: "Discount",
          value: orderData.discount,
          className: "text-success fw-semibold",
          prefix: "-",
        },
      ]
      : []),
    {
      label: "Base Amount",
      value: orderData.baseAmount,
      className: "fw-semibold",
      isBorder: true,
    },
    {
      label: "Central GST (CGST) @ 9%",
      value: orderData.cgst,
      className: "small",
      labelClass: "small text-muted",
    },
    {
      label: "State GST (SGST) @ 9%",
      value: orderData.sgst,
      className: "small",
      labelClass: "small text-muted",
    },
    {
      label: "Convenience fees",
      value: orderData.convenienceFees,
      className: "small",
      labelClass: "small text-muted",
    },
  ];
  const breakdownData = getBreakdownData(orderData);
  
  const BreakdownRow = ({ item, index }) => (
    <motion.tr
      custom={index}
      variants={tableRowVariants}
      initial="hidden"
      animate="visible"
      className={item.isBorder ? "border-top" : ""}
    >
      <td
        className={`border-0 py-${item.isBorder ? "2" : "1"} ${item.labelClass || ""
          }`}
      >
        {item.label}
      </td>
      <td
        className={`border-0 py-${item.isBorder ? "2" : "1"} text-end ${item.className
          }`}
      >
        {item.isNumber === false
          ? item.value
          : `${item.prefix || ""}₹${item.value.toLocaleString()}`}
      </td>
    </motion.tr>
  );
  return (
    <div className="cart-page section-padding">
      <Container>
        <CartSteps id={2} />

        <Row>
          <Col lg="8" md="7">
            <div className="modern-checkout-summary">
              {/* E-Ticket Alert */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
              </motion.div>

              {/* Main Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="summary-card border rounded-3 shadow-sm overflow-hidden"
              >
                {/* Promo Code Section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="p-4 border-bottom"
                >
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
                </motion.div>

                {/* Total Amount - Always Visible */}
                <div className="p-4">
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
                    transition={{ duration: 0.2 }}
                  >
                    <div>
                      <h5 className="mb-1 fw-bold">Total Amount</h5>
                      <small className="text-muted">
                        {orderData.totalTickets} ticket
                        {orderData.totalTickets > 1 ? "s" : ""}
                        {orderData.totalSavings > 0 && (
                          <span className="text-success ms-2">
                            • You save ₹{orderData.totalSavings}
                          </span>
                        )}
                      </small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="mb-0 text-primary fw-bold">
                        ₹{calculatedTotal.toLocaleString()}
                      </h4>
                      <motion.div
                        variants={chevronVariants}
                        animate={isExpanded ? "expanded" : "collapsed"}
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expandable Breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="breakdown"
                        variants={expandVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="mt-3 overflow-hidden"
                      >
                        <div className="border rounded-2">
                          <Table
                            className="table-sm mb-0"
                            style={{ fontSize: "14px" }}
                          >
                            <tbody>
                              {breakdownData.map((item, index) => (
                                <BreakdownRow
                                  key={item.label}
                                  item={item}
                                  index={index}
                                />
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Savings Highlight */}
                {orderData.totalSavings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="rounded-2 p-3 border-top"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-success fw-semibold">
                        🎉 Total Savings on this order
                      </span>
                      <span className="fw-bold text-success fs-5">
                        ₹{orderData.totalSavings.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </Col>

          {/* Order Review & Payment */}
          <Col lg="4" md="5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="order_review-box border rounded-3 p-4 mt-2"
            >
              <div className="checkout-review-order">
                <div className="checkout-payment">
                  <p className="">
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our{" "}
                    <Link href="/extra/privacy-policy">privacy policy</Link>.
                  </p>
                  {isMobile ? (
                    <BookingMobileFooter
                      handleClick={handleProcess}
                      selectedTickets={validatedData?.data}
                    />
                  ) : (
                    <CustomBtn
                      disabled={!validatedData?.data}
                      HandleClick={handleProcess}
                      buttonText={"Checkout"}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
      <style>
        {`
        .table tr th,
        .table tr td{
        padding: 1rem;
        }`}
      </style>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
