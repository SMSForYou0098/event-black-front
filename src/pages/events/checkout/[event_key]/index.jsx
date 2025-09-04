import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import Swal from "sweetalert2";

// Components
import { useMyContext } from "@/Context/MyContextProvider";
import CustomCounter from "../../../../utils/CustomCounter";
import CartSteps from "../CartSteps";
import CustomButton from "../../../../utils/CustomButton";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { publicApi } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import CommonPricingComp from "../../../../components/Tickets/CommonPricingComp";

const CartItem = ({ item, onQuantityChange, onDelete, isMobile }) => {
  const subtotal = (item.price * item.quantity).toFixed(2);

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      onQuantityChange(item.id, newQuantity);
    },
    [item.id, onQuantityChange]
  );

  return (
    <tr data-item="list">
      <td>
        <span className="fw-500 d-flex d-flex flex-column justify-content-start">
          {item.name}
          <span>Price : <CommonPricingComp price={item.price} salePrice={item.sale_price} currency={item.currency} /></span>
        </span>
      </td>
      <td className={`${isMobile && "text-end"}`}>
        <CustomCounter
          value={item.quantity}
          onChange={handleQuantityChange}
          min={1}
          max={99}
        />
      </td>
      {!isMobile && (
        <td>
          <span className="fw-500">${subtotal}</span>
        </td>
      )}

    </tr>
  );
};

const CartPage = () => {
  const { event_key } = useRouter().query;
  const { isMobile } = useMyContext();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

const FetchTickets = async () => {
  if(!event_key) return;
  
  // Define only the fields you need
  const requiredFields = [
    'id',
    'name', 
    'price',
    'sale_price',
    'currency',
    'ticket_quantity',
    'sale',
    'sold_out',
    'status'
  ];
  
  try {
    const response = await publicApi.get(`/tickets/${event_key}`, {
      params: {
        fields: requiredFields.join(',')
      }
    });
    console.log(response);
    const data = await response.data;
    setCartItems(data.tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
};

  useEffect(() => {
    FetchTickets();
  }, [event_key]);

  // Memoized calculations
  const { subtotal, total } = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return {
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2), // Add tax/shipping logic here if needed
    };
  }, [cartItems]);

  // Quantity change handler
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  // Coupon application
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      await Swal.fire({
        title: "Invalid Coupon",
        text: "Please enter a coupon code",
        icon: "warning",
        background: "#141314",
        color: "#ffffff",
      });
      return;
    }

    setIsUpdating(true);

    // Simulate API call
    setTimeout(async () => {
      await Swal.fire({
        title: "Coupon Applied!",
        text: `Coupon "${couponCode}" has been applied successfully`,
        icon: "success",
        background: "#141314",
        color: "#ffffff",
      });
      setIsUpdating(false);
    }, 1000);
  }, [couponCode]);

  // Update cart handler
  const handleUpdateCart = useCallback(() => {
    setIsUpdating(true);
    // Simulate update process
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, []);

  // Early return if no items
  if (cartItems.length === 0) {
    return (
      <div className="cart-page section-padding">
        <Container>
          <div className="text-center py-5">
            <h3>Your cart is empty</h3>
            <p>Add some items to get started!</p>
            <CustomButton
              buttonTitle="Continue Shopping"
              link="/merchandise"
              linkButton={false}
            />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cart-page section-padding">
      <Container>
        {/* Cart Steps */}
        <CartSteps id={1} />

        <Row>
          {/* Cart Items */}
          <Col lg="8">
            <Table responsive className="cart-table">
              <thead className="border-bottom">
                <tr>
                  <th scope="col" className="font-size-18 fw-500">
                    Title
                  </th>
                  <th
                    scope="col"
                    className={`font-size-18 fw-500 ${isMobile && "text-end"}`}
                  >
                    Quantity
                  </th>
                  {!isMobile && (
                    <th scope="col" className={`font-size-18 fw-500`}>
                      Subtotal
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isMobile={isMobile}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </tbody>
            </Table>

            {/* Coupon and Update Section */}
            {/* <div className="coupon-main d-flex justify-content-between gap-5 flex-wrap align-items-center pt-4 pb-5 border-bottom">
              <div className="wrap-coupon d-flex align-items-center gap-3 flex-wrap">
                <label htmlFor="coupon-input">Coupon:</label>
                <input
                  id="coupon-input"
                  className="form-control d-inline-block w-auto me-2"
                  name="coupon_code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  disabled={isUpdating}
                />
                <div className="d-inline-block">
                  <CustomButton
                    buttonTitle={isUpdating ? "Applying..." : "Apply Coupon"}
                    link="#"
                    linkButton="false"
                    onClick={handleApplyCoupon}
                    disabled={isUpdating}
                  />
                </div>
              </div>
              <div className="button-primary">
                <CustomButton
                  buttonTitle={isUpdating ? "Updating..." : "Update Cart"}
                  link="#"
                  linkButton="false"
                  onClick={handleUpdateCart}
                  disabled={isUpdating}
                />
              </div>
            </div> */}
          </Col>

          {/* Cart Totals */}
          <Col lg="4">
            <div className="cart_totals p-4">
              <h5 className="mb-3 font-size-18 fw-500">Cart Totals</h5>
              <div className="css_prefix-woocommerce-cart-box table-responsive">
                <Table className="table">
                  <tbody>
                    <tr className="cart-subtotal">
                      <th className="border-0">
                        <span className="fw-500">Subtotal</span>
                      </th>
                      <td className="border-0">
                        <span>${subtotal}</span>
                      </td>
                    </tr>
                    <tr className="order-total">
                      <th className="border-0">
                        <span className="fw-500">Total</span>
                      </th>
                      <td className="border-0">
                        <span className="fw-500 text-primary">${total}</span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                {isMobile ? (
                  <BookingMobileFooter />
                ) : (
                  <div className="button-primary">
                    <CustomButton
                      buttonTitle="Proceed to checkout"
                      link="/merchandise/checkout"
                      linkButton="false"
                      disabled={cartItems.length === 0}
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
