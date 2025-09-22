import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";

// Components
import { useMyContext } from "@/Context/MyContextProvider";
import CustomButton from "../../../../utils/CustomButton";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { publicApi,api } from "@/lib/axiosInterceptor";
import { useRouter } from "next/router";
import BookingTickets from "../../../../utils/BookingUtils/BookingTickets";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
import LoginModal from "../../../../components/auth/LoginModal";
import { useEventData } from "../../../../services/events";
import CustomBtn from "../../../../utils/CustomBtn";
import { useCheckoutData } from "../../../../hooks/useCheckoutData";
import { Calendar, Pin, Tags, Ticket, Users } from "lucide-react";
import { useHeaderSimple } from "@/context/HeaderContext";
import BookingSummarySkeleton from "../../../../utils/SkeletonUtils/BookingSummarySkeleton";
import Timer from "../../../../utils/BookingUtils/Timer";
const CartPage = () => {
  const { event_key } = useRouter().query;

  const { isMobile, isLoggedIn, fetchCategoryData, convertTo12HourFormat, formatDateRange, UserData,ErrorAlert } = useMyContext();
  const { storeCheckoutData } = useCheckoutData();
  const [cartItems, setCartItems] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [path, setPath] = useState("");
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false)

  const { data: event, isLoading, isError, error } = useEventData(event_key);
    useHeaderSimple({
    title: event?.name || "Event Details",
  });
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

  const checkTicketStatus = async () => {
    setIsChecking(true)
        try {
          const response = await api.get(`/user-ticket-info/${UserData.id}/${selectedTickets.itemId}`)
            if (!response.data.status) {
                ErrorAlert(response.data.message || 'You have already booked this ticket. Please check your booking history.');
                return false;
            }
            return true; // allowed
        } catch (error) {
            console.error('Error checking ticket status:', error);
            ErrorAlert( error ||'Unable to check ticket status. Please try again.');
            return false;
        }
        finally{
          setIsChecking(false)
        }
    };
  const handleProcess = async() => {
    const path = prepareRedirect();
    setPath(path);
   if (!isLoggedIn) {
    // if user not logged in → show login modal
    setShowLoginModal(true);
  } else {
    // if logged in, check ticket status first
    const allowed = await checkTicketStatus();
    if (allowed) {
      // if API allows booking → proceed
      router.push(path);
    } else {
      // blocked by API → do nothing (alert is already shown inside checkTicketStatus)
      return;
    }
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

    if (categoryData?.categoryData?.attendy_required === 1) {
      return `/events/attendee/${event_key}/?k=${dataKey}&categoryId=${event?.category?.id}`;
    } else {
      // Alternative: Manual navigation
      return `/events/checkout/${event_key}/?k=${dataKey}`;
    }

    // return `/events/checkout/${event_key}/?k=${dataKey}`;
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

  const attendeeRequired = useMemo(() => {
    return categoryData?.categoryData?.attendy_required === 1;
  }, [categoryData]);
  // Early return if no items


  if (isLoading) {
    return <BookingSummarySkeleton type={'cart'}/>;
  }


  // if (cartItems.length === 0) {
  //   return (
  //     <div className="cart-page section-padding">
  //       <Container>
  //         <div className="text-center py-5">
  //           <h3>Your cart is empty</h3>
  //           <p>Add some items to get started!</p>
  //           <CustomButton
  //             buttonTitle="Continue Shopping"
  //             link="/merchandise"
  //             linkButton={false}
  //           />
  //         </div>
  //       </Container>
  //     </div>
  //   );
  // }




  const CardContainer = ({ children, className = "" }) => (
    <div className={`custom-dark-bg p-4 rounded-3 mb-4 ${className}`}>
      {children}
    </div>
  );

  // Reusable Card Header Component
  const CardHeader = ({ icon: Icon, title, iconColor = "text-warning" }) => (
    <h5 className="mb-4 font-size-18 fw-500 text-light d-flex align-items-center gap-2">
      <Icon size={20} className={iconColor} /> {title}
    </h5>
  );

  // Reusable Detail Item Component
  const DetailItem = ({ icon: Icon, label, value, isLast = false }) => (
    <div className={isLast ? "mb-0" : "mb-3"}>
      <div className="d-flex align-items-center mb-1">
        <Icon size={16} className="custom-text-secondary" />
        <span className="ms-2 text-muted small">{label}</span>
      </div>
      <div className="fw-bold text-light ms-4">{value}</div>
    </div>
  );

  // Reusable Table Row Component
  const CartRow = ({ label, value, isHeader = false }) => (
    <tr className={isHeader ? "order-total" : "cart-subtotal border-bottom"}>
      <td className="border-0 fs-6">
        {isHeader ? <span>{label}</span> : <h6>{label}</h6>}
      </td>
      <td className="border-0">
        {isHeader ? (
          <span className="text-light fw-bold">{value}</span>
        ) : (
          <h6 className="text-light">{value}</h6>
        )}
      </td>
    </tr>
  );

  // Event details configuration
  const eventDetails = [
    {
      icon: Users,
      label: "Event Name",
      value: event?.name || 'Summer Music Festival 2024'
    },
    // {
    //   icon: Tags,
    //   label: "Category",
    //   value: event?.category?.title || 'Music & Arts'
    // },
    {
      icon: Calendar,
      label: "Date & Time",
      value: formatDateRange(event?.date_range) + " | " + convertTo12HourFormat(event?.start_time)
    },
    {
      icon: Pin,
      label: "Location",
      value: event?.address || 'Central Park, New York'
    }
  ];

  // Cart data configuration
  const cartData = [
    {
      label: "Quantity",
      value: selectedTickets?.newQuantity || 0,
      isHeader: false
    },
    {
      label: "Total",
      value: `₹${selectedTickets?.subtotal || 0}`,
      isHeader: true
    }
  ];

  const buttonText = `Proceed to ${attendeeRequired ? "Attendee" : "Checkout"}`;


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
            <CardContainer>
              <CardHeader icon={Ticket} title="Event Details" />
              {eventDetails.map((detail, index) => (
                <DetailItem
                  key={detail.label}
                  icon={detail.icon}
                  label={detail.label}
                  value={detail.value}
                  isLast={index === eventDetails.length - 1}
                />
              ))}
            </CardContainer>
            <CardContainer className="cart_totals">
              <CardHeader icon={Ticket} title="Cart Overview" iconColor="text-warning" />

              <div className="css_prefix-woocommerce-cart-box table-responsive">
                <Table className="table mb-0">
                  <tbody>
                    {cartData.map((row, index) => (
                      <CartRow
                        key={row.label}
                        label={row.label}
                        value={row.value}
                        isHeader={row.isHeader}
                      />
                    ))}
                  </tbody>
                </Table>

                {/* Cart Info Box */}
                <div className="cart-info-box my-3 p-3 rounded-3 border-dashed-thin">
                  <span className="text-secondary small">
                    * This is the base price for selected tickets. Additional charges including service fees, taxes, and processing fees will be calculated in the next step.
                  </span>
                </div>

                {/* Checkout Button */}
                {isMobile ? (
                  <BookingMobileFooter
                    handleClick={handleProcess}
                    selectedTickets={selectedTickets}
                  />
                ) : (
                  <CustomBtn
                    disabled={!selectedTickets?.itemId}
                    HandleClick={handleProcess}
                    icon={attendeeRequired ? <Users size={20} /> : null}
                    buttonText={<span>{buttonText}</span>}
                    className="cart-proceed-btn mt-2"
                    style={{ width: "100%" }}
                    loading={isChecking}
                  />
                )}
              </div>
            </CardContainer>
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
