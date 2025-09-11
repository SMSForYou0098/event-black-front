import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";

// Components
import { useMyContext } from "@/Context/MyContextProvider";
import CustomButton from "../../../../utils/CustomButton";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { publicApi } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import BookingTickets from "../../../../utils/BookingUtils/BookingTickets";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import LoginModal from "../../../../components/auth/LoginModal";
import { getEventById, useEventData } from "../../../../services/events";
import CustomBtn from "../../../../utils/CustomBtn";
import { useCheckoutData } from "../../../../hooks/useCheckoutData";

const CartPage = () => {
  const { event_key } = useRouter().query;
  const { isMobile, isLoggedIn, fetchCategoryData } = useMyContext();
  const { storeCheckoutData } = useCheckoutData();
  const [cartItems, setCartItems] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [path, setPath] = useState("");
  const router = useRouter();

  const { data: event, isLoading, isError, error } = useEventData(event_key);

  useEffect(() => {
    const getCategoryData = async () => {
      let data = await fetchCategoryData(event?.category?.id);
      setCategoryData(data);
    };
    if (event?.category?.id) {
      getCategoryData();
    }
    return () => { };
  }, [event]);

  // console.log(event)
  const handleProcess = () => {
    const path = prepareRedirect();
    setPath(path);
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      router.push(path);
    }
  };

  const prepareRedirect = () => {
    const eventSummary = {
      name: event?.name,
      id: event?.id,
      city: event?.city,
      user_id: event?.user_id,
      category: categoryData?.categoryData,
    };
    
    const selectedTicket = cartItems.find(
      (ticket) => ticket.id === selectedTickets?.itemId
    );

    // Store data and get key
    const dataKey = storeCheckoutData({
      data: selectedTickets,
      ticket: selectedTicket,
      edata: eventSummary,
    });
    
    // Alternative: Manual navigation
    return `/events/checkout/${event_key}/?k=${dataKey}`;
  }

  const FetchTickets = async () => {
    if (!event_key) return;

    // Define only the fields you need
    const requiredFields = [
      "id",
      "name",
      "price",
      "sale_price",
      "currency",
      "ticket_quantity",
      "sale",
      "sold_out",
      "status",
      "description",
      "user_booking_limit",
    ];

    try {
      const response = await publicApi.get(`/tickets/${event_key}`, {
        params: {
          fields: requiredFields.join(","),
        },
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

  // Quantity change handler
  const handleQuantityChange = useCallback((itemId, newQuantity, subtotal) => {
    setSelectedTickets({ itemId, newQuantity, subtotal });
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
        <CartSteps
          id={1}
          showAttendee={categoryData?.categoryData?.attendy_required === 1}
        />

        <Row>
          {/* Cart Items */}
          <Col lg="8">
            <BookingTickets
              cartItems={cartItems}
              onQuantityChange={handleQuantityChange}
              isMobile={isMobile}
            />
          </Col>

          {/* Cart Totals */}
          <Col lg="4">
            <div className="cart_totals p-4 rounded-3">
              <h5 className="mb-3 font-size-18 fw-500">Cart Overview</h5>
              <div className="css_prefix-woocommerce-cart-box table-responsive">
                <Table className="table">
                  <tbody>
                    <tr className="cart-subtotal">
                      <th className="border-0">
                        <span className="">Quantity</span>
                      </th>
                      <td className="border-0">
                        <span className="text-light fw-bold">
                          ₹{selectedTickets?.newQuantity || 0}
                        </span>
                      </td>
                    </tr>
                    <tr className="order-total">
                      <th className="border-0">
                        <span className="">Total</span>
                      </th>
                      <td className="border-0">
                        <span className="text-light fw-bold">
                          ₹{selectedTickets?.subtotal || 0}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                {isMobile ? (
                  <BookingMobileFooter
                    handleClick={handleProcess}
                    selectedTickets={selectedTickets}
                  />
                ) : (
                  <CustomBtn
                    disabled={!selectedTickets?.itemId}
                    HandleClick={handleProcess}
                    buttonText={"Proceed"}
                  />
                )}
              </div>
            </div>
          </Col>
        </Row>
        <LoginModal
          redirectPath={path}
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          eventKey={event_key}
        />
      </Container>
    </div>
  );
};

CartPage.layout = "events";
export default CartPage;
