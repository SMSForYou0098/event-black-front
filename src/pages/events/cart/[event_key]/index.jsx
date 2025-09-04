import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import Swal from "sweetalert2";
 
// Components
import { useMyContext } from "@/Context/MyContextProvider";
import CustomCounter from "../../../../utils/CustomCounter";
import CustomButton from "../../../../utils/CustomButton";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { publicApi } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import CommonPricingComp from "../../../../components/Tickets/CommonPricingComp";
import BookingTickets from "../../../../utils/BookingUtils/BookingTickets";
import { getEventById } from "../../../../services/events";
import { useQuery } from "@tanstack/react-query";
import CartSteps from "./CartSteps";
import LoginModal from "../../../../components/auth/LoginModal";
 
 
const CartPage = () => {
  const { event_key } = useRouter().query;
  const { isMobile, isLoggedIn } = useMyContext();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  const {
    data: event,    // Renamed 'data' to 'event' for clarity
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['event', event_key],

    queryFn: async () => {
      const response = await getEventById(event_key);
      return response.events; // Return the nested event data directly
    },

    enabled: !!event_key,
  });
  const handleProcess = ()=>{
      if(!isLoggedIn ){
        setShowLoginModal(true);
      }
      else{
        router.push(`/events/checkout/${event_key}/`)
      }
    }
 
  const FetchTickets = async () => {
    if (!event_key) return;
 
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
      'status',
      'description',
      'user_booking_limit'
    ];
 
    try {
      const response = await publicApi.get(`/tickets/${event_key}`, {
        params: {
          fields: requiredFields.join(',')
        }
      });
      // console.log(response);
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
            <BookingTickets cartItems={cartItems} onQuantityChange={handleQuantityChange} isMobile={isMobile} />
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
                    {/* <CustomButton
                      buttonTitle="Proceed to checkout"
                      link="/merchandise/checkout"
                      linkButton="false"
                      disabled={cartItems.length === 0}
                    /> */}
                    <Button onClick={handleProcess}>Proceed To checkout</Button>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <LoginModal redirectPath={`/events/checkout/${event_key}`} show={showLoginModal} onHide={()=>setShowLoginModal(false)}  eventKey={event_key}/>
      </Container>
    </div>
  );
};
 
CartPage.layout = "events";
export default CartPage;