import React, { useState, useCallback, useMemo, useEffect } from "react";
import Image from "next/image";
import { Container, Row, Col, Table, Button, Alert, Form, Modal } from "react-bootstrap";
import Flatpickr from "react-flatpickr";
import 'flatpickr/dist/flatpickr.min.css';

// Components
import { LargeAndDesktop } from "@/utils/ResponsiveRenderer";

import { useMyContext } from "@/Context/MyContextProvider";
import BookingMobileFooter from "../../../../utils/BookingUtils/BookingMobileFooter";
import { publicApi, api } from "@/lib/axiosInterceptor";
import { store } from "@/store"; // needed to read fresh auth state after re-login
import { useRouter } from "next/router";
import BookingTickets from "../../../../utils/BookingUtils/BookingTickets";
import CartSteps from "../../../../utils/BookingUtils/CartSteps";
// import LoginModal from "../../../../components/auth/LoginModal";
import LoginModal from "../../../../components/auth/LoginOffCanvas";
import { useEventData, useLockSeats, useEventInfluencers, useEventTickets, useCategoryData } from "../../../../services/events";
import CustomBtn from "../../../../utils/CustomBtn";
import CustomDrawer from "../../../../utils/CustomDrawer";
import { useCheckoutData } from "../../../../hooks/useCheckoutData";
import { useMutation } from "@tanstack/react-query";
import LoaderComp from "../../../../utils/LoaderComp";
import { Calendar, Pin, Ticket, Users, Check, User } from "lucide-react";
import { useHeaderSimple } from "../../../../Context/HeaderContext";
import BookingSummarySkeleton from "../../../../utils/SkeletonUtils/BookingSummarySkeleton";
import BookingLayout from "../../../../components/events/SeatingModuleAdmin/Bookinglayout";
import toast from "react-hot-toast";
import MobileTwoButtonFooter from "../../../../utils/MobileTwoButtonFooter";
import { getErrorMessage } from "@/utils/errorUtils";
import ImageMessageModal from "../../../../utils/ModalUtils/ImageMessageModal";
import RegistrationBooking from "../../../../components/events/RegistrationBooking/RegistrationBooking";
import CustomHeader from "../../../../utils/ModalUtils/CustomModalHeader";

const CartPage = () => {
  const { event_key, section: sectionParam, row: rowParam } = useRouter().query;

  const {
    isMobile,
    isLoggedIn,
    fetchCategoryData,
    convertTo12HourFormat,
    formatDateRange,
    UserData,
    ErrorAlert,
  } = useMyContext();
  const { storeCheckoutData } = useCheckoutData();
  const [cartItems, setCartItems] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [seatingModule, setSeatingModule] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationId, setRegistrationId] = useState(null); // Store registration_id separately

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [path, setPath] = useState("");
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(""); // For daily event date selection
  const [showDatePicker, setShowDatePicker] = useState(false); // Date selection modal/drawer state

  // Influencer selection states (for approval_required events)
  const [showInfluencerDrawer, setShowInfluencerDrawer] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  // Cart drawer (mobile): show cart summary in drawer when tapping Proceed
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showSelectTicketDrawer, setShowSelectTicketDrawer] = useState(false);

  const [isBelow991, setIsBelow991] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsBelow991(window.innerWidth <= 991);
    };
    handleResize(); // Initialization
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if event is daily type

  // Parse event date range to get min and max dates


  // Lock seats mutation
  const lockSeatsMutation = useLockSeats({
    onSuccess: (data) => {
      // toast.success(data?.message)
    },
    onError: (error) => {
      console.error('Failed to lock seats:', error);
      ErrorAlert(getErrorMessage(error, 'Failed to lock seats. Please try again.'));
    },
  });

  //TAX STATES

  const { data: event, isLoading: isEventLoading, isError: isEventError, error: eventError } = useEventData(event_key, UserData?.id ? UserData?.id : null);
  const { data: fetchedTickets, isLoading: isTicketsLoading } = useEventTickets(event_key);
  const { data: catQueryData } = useCategoryData(event?.Category?.id);

  useEffect(() => {
    if (catQueryData) {
      setCategoryData(catQueryData.categoryData);
    }
  }, [catQueryData]);

  useEffect(() => {
    if (fetchedTickets) {
      setCartItems(fetchedTickets);
    }
  }, [fetchedTickets]);
  useHeaderSimple({
    title: event?.name || "Event Details",
  });

  const isDailyEvent = event?.event_type === 'daily';
  const isApprovalRequired = event?.eventControls?.is_approval_required;

  // Fetch influencers when approval is required
  const { data: influencersData, isLoading: influencersLoading } =
    useEventInfluencers(
      event?.id,
      !!isApprovalRequired && !!UserData?.id
    );
  const parseDateRange = useMemo(() => {
    if (!event?.date_range) return { minDate: null, maxDate: null, minDateStr: null, maxDateStr: null };

    const dateRange = event.date_range.trim();
    let parts;

    // Handle different date range formats - be careful not to split on hyphens within dates
    if (dateRange.includes(',')) {
      // Format: "2026-01-12,2026-01-22"
      parts = dateRange.split(',');
    } else if (dateRange.includes(' to ')) {
      // Format: "2026-01-12 to 2026-01-22"
      parts = dateRange.split(' to ');
    } else if (dateRange.includes(' - ')) {
      // Format: "2026-01-12 - 2026-01-22" (with spaces around hyphen)
      parts = dateRange.split(' - ');
    } else if (dateRange.includes(' – ')) {
      // Format: "2026-01-12 – 2026-01-22" (en-dash with spaces)
      parts = dateRange.split(' – ');
    } else {
      // Single date
      parts = [dateRange];
    }

    if (parts.length >= 2) {
      const minDateStr = parts[0]?.trim();
      const maxDateStr = parts[1]?.trim();
      return {
        minDate: minDateStr ? new Date(minDateStr + 'T00:00:00') : null,
        maxDate: maxDateStr ? new Date(maxDateStr + 'T00:00:00') : null,
        minDateStr,
        maxDateStr
      };
    }
    // Single date
    const dateStr = parts[0]?.trim();
    return {
      minDate: dateStr ? new Date(dateStr + 'T00:00:00') : null,
      maxDate: dateStr ? new Date(dateStr + 'T00:00:00') : null,
      minDateStr: dateStr,
      maxDateStr: dateStr
    };
  }, [event?.date_range]);
  // Event status checks
  const isHouseFull = event?.eventControls?.house_full;
  const isSoldOut = event?.eventControls?.is_sold_out;
  const isPostponed = event?.eventControls?.is_postponed;
  const isCancelled = event?.eventControls?.is_cancelled;
  const expectedDate = event?.eventControls?.expected_date;

  // Determine the event status and message
  const getEventStatus = () => {
    if (isCancelled) return {
      disabled: true,
      message: 'This event has been cancelled. Refunds will be processed if applicable.',
      variant: 'danger',
      icon: 'fa-circle-xmark'
    };
    if (isPostponed) return {
      disabled: true,
      message: 'This event has been postponed. Please check the expected date below.',
      variant: 'warning',
      icon: 'fa-clock'
    };
    if (isSoldOut) return {
      disabled: true,
      message: 'All tickets for this event have been sold out.',
      variant: 'info',
      icon: 'fa-circle-info'
    };
    if (isHouseFull) return {
      disabled: true,
      message: 'All tickets for this event have been sold out.',
      variant: 'info',
      icon: 'fa-circle-info'
    };
    return { disabled: false, message: null, variant: null, icon: null };
  };

  const eventStatus = getEventStatus();

  // useEffect(() => {
  //   if (event) {
  //     setSeatingModule(event?.eventControls?.ticket_system)
  //   }
  //   const getCategoryData = async () => {
  //     let data = await fetchCategoryData(event?.Category?.id);
  //     setCategoryData(data?.categoryData);
  //   };
  //   if (event?.Category?.id) {
  //     getCategoryData();
  //   }
  //   return () => { };
  // }, [event]);

  useEffect(() => {
    if (event) {
      setSeatingModule(event?.eventControls?.ticket_system)
    }
  }, [event]);

  // Auto-open Registration modal when category is Registration
  useEffect(() => {
    if (categoryData?.title === 'Registration') {
      setShowRegistrationModal(true);
    }
  }, [categoryData]);

  // Auto-open date picker for daily events (but NOT for Registration category to avoid conflict)
  // Also ensure parseDateRange has valid values before opening
  useEffect(() => {
    if (
      isDailyEvent &&
      categoryData &&
      categoryData.title !== 'Registration' &&
      !selectedDate &&
      !showDatePicker &&
      parseDateRange.minDateStr &&
      parseDateRange.maxDateStr
    ) {
      setShowDatePicker(true);
    }
  }, [isDailyEvent, categoryData, selectedDate, parseDateRange]);

  // Auto-open influencer drawer for approval-required events
  useEffect(() => {
    if (
      isApprovalRequired &&
      categoryData &&
      categoryData.title !== 'Registration' &&
      !selectedInfluencer &&
      !showInfluencerDrawer &&
      influencersData?.data?.length > 0
    ) {
      setShowInfluencerDrawer(true);
    }
  }, [isApprovalRequired, categoryData, selectedInfluencer, showInfluencerDrawer, influencersData]);


  const checkTicketMutation = useMutation({
    mutationFn: async ({ userId, ticketId }) => {
      const response = await api.get(`/user-ticket-info/${userId}/${ticketId}`);
      return response.data;
    }
  });

  const checkTicketStatus = async () => {
    try {
      // ⚠️ Read directly from Redux store — NOT from the closed-over `UserData`.
      // After auto-logout + re-login, Redux state is updated synchronously, but
      // the React component hasn't re-rendered yet, so `UserData` in the closure
      // is still null. store.getState() always returns the latest value.
      const freshUser = store.getState().auth.user;

      if (!freshUser?.id) {
        ErrorAlert("Please log in to continue.");
        return false;
      }

      const ticketId = selectedTickets?.id || selectedTickets?.itemId;

      const data = await checkTicketMutation.mutateAsync({ userId: freshUser.id, ticketId });
      if (!data.status) {
        ErrorAlert(data.message || "Booking limit reached");
        return false;
      }
      return true; // allowed
    } catch (error) {
      console.error("Error checking ticket status:", error);
      ErrorAlert(getErrorMessage(error, "Unable to check ticket status. Please try again."));
      return false;
    }
  };
  const handleProcess = async (dateOverride = null) => {
    // Prevent proceeding if event is unavailable
    if (eventStatus.disabled) {
      return;
    }

    const ticketId = selectedTickets?.id || selectedTickets?.itemId;
    if (!ticketId || !selectedTickets?.quantity || parseInt(selectedTickets.quantity) === 0) {
      setShowSelectTicketDrawer(true);
      return;
    }

    const dateToUse = dateOverride || selectedDate;

    // Validate date selection for daily events - Open date picker if no date
    if (isDailyEvent && !dateToUse) {
      setShowDatePicker(true);
      return;
    }

    // Validate influencer selection for approval-required events
    if (isApprovalRequired && !selectedInfluencer) {
      setShowInfluencerDrawer(true);
      return;
    }

    const path = prepareRedirect(dateToUse);
    setPath(path);
    if (!isLoggedIn) {
      // if user not logged in → show login modal
      setShowLoginModal(true);
    } else {
      // if logged in, check ticket status first
      const allowed = await checkTicketStatus();
      if (allowed) {
        // Lock seats before proceeding
        if (seatingModule && selectedTickets?.seats && selectedTickets.seats.length > 0) {
          try {
            // Extract seat IDs from selectedTickets.seats array
            const seatIds = selectedTickets.seats.map(seat => seat.seat_id);

            await lockSeatsMutation.mutateAsync({
              event_id: event?.id,
              seats: seatIds,
              user_id: UserData?.id,
            });
            // if seat lock successful → proceed
            router.push(path);
          } catch (error) {
            // Error is already handled in onError callback
            return;
          }
        } else {
          // No seating module or no seats selected → proceed directly
          router.push(path);
        }
      } else {
        // blocked by API → do nothing (alert is already shown inside checkTicketStatus)
        return;
      }
    }
  };

  const prepareRedirect = (dateOverride = null) => {
    const eventSummary = {
      name: event?.name,
      id: event?.id,
      city: event?.city,
      user_id: event?.user_id,
      category: categoryData,
      tax_data: event?.tax_data,
      attendee_required: event?.eventControls?.attendee_required,
      online_att_sug: event?.eventControls?.online_att_sug,
    };

    const selectedTicket = cartItems.find(
      (ticket) => ticket.id === selectedTickets?.itemId
    );

    // Store data and get key - include registration_id and selectedDate if available
    const dateToUse = dateOverride || selectedDate;
    const dataKey = storeCheckoutData({
      data: {
        ...selectedTickets,
        ...(registrationId && { registration_id: registrationId }),
        ...(dateToUse && { selectedDate: dateToUse }),
        ...(selectedInfluencer && { selectedInfluencer })
      },
      ticket: selectedTicket,
      edata: eventSummary,
    });

    // Alternative: Manual navigation

    if (categoryData?.attendy_required === true || event?.eventControls?.attendee_required === true) {
      return `/events/attendee/${event_key}/?k=${dataKey}&categoryId=${event?.Category?.id}`;
    } else {
      // Alternative: Manual navigation
      return `/events/checkout/${event_key}/?k=${dataKey}`;
    }

    // return `/events/checkout/${event_key}/?k=${dataKey}`;
  };

  // useEffect(() => {
  //   FetchTickets();
  // }, [event_key]);

  // Quantity change handler
  // const handleQuantityChange = useCallback((itemId, newQuantity, subtotal) => {
  //   setSelectedTickets({ itemId, newQuantity, subtotal });
  // }, []);

  const attendeeRequired = useMemo(() => {
    return categoryData?.attendy_required === true || event?.eventControls?.attendee_required === true;
  }, [categoryData]);
  // Early return if no items

  if (isEventLoading) {
    return <BookingSummarySkeleton type={"cart"} />;
  }

  if (isEventError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {getErrorMessage(eventError, "Failed to load event details. Please try again.")}
        </Alert>
      </Container>
    );
  }

  const CardContainer = ({ children, className = "", style = {} }) => (
    <div className={`custom-dark-bg p-2 rounded-3 mb-2 ${className}`} style={style}>
      {children}
    </div>
  );

  // Reusable Card Header Component
  const CardHeader = ({ icon: Icon, title, iconColor = "text-warning", className }) => (
    <h5 className={`mb-3 fw-500 text-light d-flex align-items-center gap-2 ${className}`} style={{ fontSize: '18px' }}>
      <Icon size={20} className={iconColor} /> {title}
    </h5>
  );

  // Reusable Detail Item Component
  const DetailItem = ({ icon: Icon, label, value, isLast = false }) => (
    <div className={isLast ? "mb-0" : "mb-3"}>
      <div className="d-flex align-items-center mb-1">
        <Icon size={16} className="custom-text-secondary" />
        <span className="ms-2 text-muted" style={{ fontSize: '12px' }}>{label}</span>
      </div>
      <div className="fw-bold text-light ms-4" style={{ fontSize: '14px' }}>{value}</div>
    </div>
  );

  // Reusable Table Row Component
  const CartRow = ({ label, value, isHeader = false }) => (
    <tr className={isHeader ? "order-total" : "cart-subtotal border-bottom"}>
      <td className="border-0 fs-6">
        {isHeader ? <span>{label}</span> : <h6 style={{ fontSize: '14px' }}>{label}</h6>}
      </td>
      <td className="border-0">
        {isHeader ? (
          <span className="text-light fw-bold">{value}</span>
        ) : (
          <h6 className="text-light" style={{ fontSize: '14px' }}>{value}</h6>
        )}
      </td>
    </tr>
  );

  // Event details configuration
  const eventDetails = [
    {
      icon: Ticket,
      label: "Event Name",
      value: event?.name || "Summer Music Festival 2024",
    },
    // {
    //   icon: Tags,
    //   label: "Category",
    //   value: event?.Category?.title || 'Music & Arts'
    // },
    {
      icon: Calendar,
      label: "Date & Time",
      value:
        formatDateRange(event?.date_range) +
        " | " +
        convertTo12HourFormat(event?.start_time),
    },
    {
      icon: Pin,
      label: "Location",
      value: event?.venue?.address || "Central Park, New York",
    },
  ];

  // Cart data configuration
  const cartData = [
    {
      label: "QTY",
      value: selectedTickets?.quantity || 0,
      isHeader: false,
    },
    // ...(selectedTickets?.seats?.length > 0
    //   ? [
    //     {
    //       label: "Seats",
    //       value: selectedTickets.seats.map((s) => s.seat_name).join(", "),
    //       isHeader: false,
    //     },
    //   ]
    //   : []),
    {
      label: "Total",
      value: `₹${selectedTickets?.subTotal || 0}`,
      isHeader: true,
    },
  ];

  const buttonText = `${attendeeRequired ? "Proceed to Attendee" : "Checkout"}`;
  return (
    <div className="cart-page">
      {checkTicketMutation.isPending && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoaderComp />
        </div>
      )}
      <Container>
        {/* Cart Steps */}
        <CartSteps
          id={1}
          showAttendee={categoryData?.attendy_required === true || event?.eventControls?.attendee_required === true}
        />
        <Row>
          {/* Cart Items */}
          <Col lg="8">
            {/* Show loading skeleton while data is loading */}
            {isEventLoading ? (
              <BookingSummarySkeleton type={"tickets"} />
            ) : eventStatus.disabled ? (
              // Show message when event is unavailable
              <div className="custom-dark-bg p-4 rounded-3 text-center">
                <div className="py-5">
                  <i className={`fa-solid ${eventStatus.icon} fa-3x mb-3 text-${eventStatus.variant === 'danger' ? 'danger' : eventStatus.variant === 'warning' ? 'warning' : 'info'}`}></i>
                  <h5 className="mb-2" style={{ fontSize: '18px' }}>Event {eventStatus.text}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                    {eventStatus.message}
                  </p>
                  {isPostponed && expectedDate && (
                    <div className="mt-3">
                      <i className="fa-regular fa-calendar me-1"></i>
                      <strong>Expected Date:</strong> {new Date(expectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Show tickets/seating layout when event is available
              <>
                {isTicketsLoading ? (
                  <BookingSummarySkeleton type={"tickets"} />
                ) : seatingModule ?
                  <BookingLayout
                    eventId={event?.id}
                    setSelectedTkts={setSelectedTickets}
                    tax_data={event?.taxData}
                    layoutId={event?.EventHasLayout?.layout_id}
                    event={event}
                    cartItems={cartItems}
                    scrollToSectionId={sectionParam ? String(sectionParam) : undefined}
                    scrollToRowTitle={rowParam ? String(rowParam) : undefined}
                  />
                  :
                  <BookingTickets
                    cartItems={cartItems}
                    tax_data={event?.taxData}
                    isMobile={isMobile}
                    selectedTickets={selectedTickets}
                    setSelectedTickets={setSelectedTickets}
                    event={event}
                  />
                }
              </>
            )}
          </Col>

          {/* Cart Totals — desktop: sidebar column; mobile: shown in drawer via handleProcess */}
          {/* Shared sidebar content (event details + cart overview) */}
          {(() => {
            const cartSidebarBody = (
              <>
                <CardContainer className="cart_totals">
                  <LargeAndDesktop>

                    <CardHeader
                      icon={Ticket}
                      title="Cart Overview"
                      iconColor="text-warning"
                      className=''
                    />
                  </LargeAndDesktop>

                  <div className="css_prefix-woocommerce-cart-box table-responsive">
                    {selectedTickets?.seats?.length > 0 && (
                      <span className="text-white small">
                        <strong>Seats:</strong> {selectedTickets.seats.map((s) => s.seat_name).join(", ")}
                      </span>
                    )}
                    <Table className="table mb-0">
                      <tbody>
                        {cartData.map((row) => (
                          <CartRow
                            key={row.label}
                            label={row.label}
                            value={row.value}
                            isHeader={row.isHeader}
                          />
                        ))}
                      </tbody>
                    </Table>
                    {(event?.taxData?.convenience_fee ?? 0) > 0 && (
                      <Alert
                        style={{ fontSize: "12px" }}
                        className="p-1 rounded-3 border-dashed-thin d-flex justify-content-between flex-wrap gap-2"
                      >
                        <span className="text-white small">
                          Base price only — fees & taxes added at checkout.
                        </span>
                      </Alert>
                    )}
                  </div>

                  {/* Checkout button — same for desktop column and mobile drawer */}
                </CardContainer>
                <CardContainer>
                  {eventDetails.map((detail, index) => (
                    <DetailItem
                      key={detail.label}
                      icon={detail.icon}
                      label={detail.label}
                      value={detail.value}
                      isLast={index === eventDetails.length - 1}
                    />
                  ))}
                  <div className="mt-2 text-center">
                    {isBelow991 ? (
                      <MobileTwoButtonFooter
                        rightButton={
                          <CustomBtn
                            disabled={
                              eventStatus.disabled
                            }
                            HandleClick={() => {
                              if (isBelow991) setShowCartDrawer(false);
                              handleProcess();
                            }}
                            icon={attendeeRequired ? <Users size={20} /> : null}
                            buttonText={<span>{buttonText}</span>}
                            className=""
                            size='sm'
                            style={{ width: "100%" }}
                            loading={checkTicketMutation.isPending || lockSeatsMutation.isPending}
                          />
                        }
                      />
                    ) : (
                      <CustomBtn
                        disabled={
                          eventStatus.disabled
                        }
                        HandleClick={() => {
                          if (isBelow991) setShowCartDrawer(false);
                          handleProcess();
                        }}
                        icon={attendeeRequired ? <Users size={20} /> : null}
                        buttonText={<span>{buttonText}</span>}
                        className="cart-proceed-btn"
                        style={{ width: "100%" }}
                        loading={checkTicketMutation.isPending || lockSeatsMutation.isPending}
                      />
                    )}
                  </div>
                </CardContainer>


                {/* Spacer for mobile to prevent overlapping with sticky footer */}
                {isBelow991 && <div className="pb-5 mb-4"></div>}
              </>
            );

            return (
              <>
                {/* Desktop: sidebar column */}
                {!isBelow991 && (
                  <Col lg="4">
                    {cartSidebarBody}
                  </Col>
                )}

                {/* Mobile: cart drawer opened when footer "Proceed" is tapped */}
                {isBelow991 && (
                  <CustomDrawer
                    showOffcanvas={showCartDrawer}
                    setShowOffcanvas={setShowCartDrawer}
                    title={<>
                      <CardHeader
                        icon={Ticket}
                        title="Cart Overview"
                        iconColor="text-warning"
                        className=''
                      />
                    </>}
                    placement="bottom"
                    className="bg-dark text-white"
                    style={{ height: "auto" }}
                  >
                    {cartSidebarBody}
                  </CustomDrawer>
                )}
              </>
            );
          })()}
        </Row>

        {/* Mobile: footer opens cart drawer on Proceed; checkout runs from inside drawer */}
        <div className="d-block d-lg-none">
          <BookingMobileFooter
            handleClick={() => setShowCartDrawer(true)}
            selectedTickets={selectedTickets}
          />
        </div>

        {/* Select Ticket Warning — Common Responsive Modal/Drawer */}
        <ImageMessageModal
          show={showSelectTicketDrawer}
          onHide={() => setShowSelectTicketDrawer(false)}
          imageSrc="/assets/images/event_page/select-ticket.webp"
          altText="Please select tickets"
          isMobile={isMobile}
          buttonText="Got it"
        />

        {/* Date Selection - Responsive: Modal for Desktop, Drawer for Mobile */}
        {isMobile ? (
          <CustomDrawer
            showOffcanvas={showDatePicker}
            setShowOffcanvas={setShowDatePicker}
            title=""
            placement="bottom"
            className="bg-dark text-white"
            style={{ height: 'auto', minHeight: '50vh' }}
          >
            <div className="d-flex flex-column align-items-center justify-content-center h-100">
              <div className="custom-flatpickr-wrapper">
                <Flatpickr
                  value={selectedDate}
                  options={{
                    inline: true,
                    minDate: "today",
                    dateFormat: "Y-m-d",
                    enable: [
                      {
                        from: parseDateRange.minDateStr,
                        to: parseDateRange.maxDateStr
                      }
                    ]
                  }}
                  onChange={([date]) => {
                    if (date) {
                      const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
                      setSelectedDate(dateStr);
                      setShowDatePicker(false);
                    }
                  }}
                  render={(_, ref) => {
                    return (
                      <input
                        ref={ref}
                        type="text"
                        placeholder="Select Date.."
                        className="form-control bg-dark text-white border-secondary text-center"
                        readOnly
                      />
                    );
                  }}
                />
              </div>
            </div>
          </CustomDrawer>
        ) : (
          <Modal
            show={showDatePicker}
            onHide={() => setShowDatePicker(false)}
            centered
            className="modal-glass-bg"
          >

            <CustomHeader title="" className='border-0' closable={false} onClose={() => setShowDatePicker(false)} />
            <Modal.Body>
              <div className="d-flex flex-column align-items-center justify-content-center">
                <div className="custom-flatpickr-wrapper">
                  <Flatpickr
                    value={selectedDate}
                    options={{
                      inline: true,
                      minDate: "today",
                      dateFormat: "Y-m-d",
                      enable: [
                        {
                          from: parseDateRange.minDateStr,
                          to: parseDateRange.maxDateStr
                        }
                      ]
                    }}
                    onChange={([date]) => {
                      if (date) {
                        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
                        setSelectedDate(dateStr);
                        setShowDatePicker(false);
                      }
                    }}
                    render={(_, ref) => {
                      return (
                        <input
                          ref={ref}
                          type="text"
                          placeholder="Select Date.."
                          className="form-control bg-dark text-white border-secondary text-center"
                          readOnly
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </Modal.Body>
          </Modal>
        )}

        {/* {!UserData && ( */}
        <LoginModal
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          eventKey={event_key}
          onSuccess={async () => {
            // After successful login, run the ticket check and proceed
            setShowLoginModal(false);
            const allowed = await checkTicketStatus();
            if (allowed) {
              if (seatingModule && selectedTickets?.seats && selectedTickets.seats.length > 0) {
                try {
                  const seatIds = selectedTickets.seats.map(seat => seat.seat_id);
                  await lockSeatsMutation.mutateAsync({
                    event_id: event?.id,
                    seats: seatIds,
                    user_id: UserData?.id,
                  });
                  router.push(path);
                } catch (error) {
                  return;
                }
              } else {
                router.push(path);
              }
            }
          }}
          is_address_required={event?.eventControls?.use_preprinted_cards}
        />
        {/* )} */}

        {/* Registration Modal - auto-opens for Registration category */}
        <RegistrationBooking
          show={showRegistrationModal}
          onHide={() => setShowRegistrationModal(false)}
          eventId={event?.id}
          cartItems={cartItems}
          tax_data={event?.taxData}
          isMobile={isMobile}
          setSelectedTickets={setSelectedTickets}
          onVerified={(data) => {
            // Set the selected tickets with tax data for checkout
            setSelectedTickets({
              ...data.taxData,
              itemId: data.selectedTicket?.id,
              fieldsData: data.fieldsData,
              attendee_qty: data.attendee_qty
            });
            // Store registration_id separately so it doesn't get lost
            if (data.registration_id) {
              setRegistrationId(data.registration_id);
            }
            // Close the modal
            setShowRegistrationModal(false);
          }}
        />

        {/* Influencer Selection - For approval_required events */}
        {isMobile ? (
          <CustomDrawer
            showOffcanvas={showInfluencerDrawer}
            setShowOffcanvas={setShowInfluencerDrawer}
            title="Select Influencer"
            placement="bottom"
            className="bg-dark text-white"
            style={{ height: 'auto', minHeight: '60vh', maxHeight: '80vh' }}
          >
            <div className="d-flex flex-column h-100">
              <p className="text-muted small mb-3">Select an influencer to proceed with booking</p>
              <div className="flex-grow-1 overflow-auto">
                {influencersLoading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {influencersData?.data?.map((influencer) => (
                      <div
                        key={influencer.id}
                        className={`p-3 rounded-3 border cursor-pointer d-flex align-items-center gap-3 ${selectedInfluencer === influencer.id
                          ? 'border-warning bg-warning bg-opacity-10'
                          : 'border-secondary'
                          }`}
                        onClick={() => setSelectedInfluencer(influencer.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${selectedInfluencer === influencer.id ? 'bg-warning' : 'bg-secondary'
                          }`} style={{ width: 40, height: 40 }}>
                          {selectedInfluencer === influencer.id ? (
                            <Check size={20} className="text-dark" />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="text-white fw-medium">{influencer.name}</div>
                        </div>
                      </div>
                    ))}
                    {(!influencersData?.data || influencersData?.data?.length === 0) && (
                      <div className="text-center text-muted py-4">
                        No influencers available for this event
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-top border-secondary">
                <CustomBtn
                  disabled={!selectedInfluencer}
                  HandleClick={() => setShowInfluencerDrawer(false)}
                  buttonText="Continue"
                  className="w-100"
                />
              </div>
            </div>
          </CustomDrawer>
        ) : (
          <Modal
            show={showInfluencerDrawer}
            onHide={() => setShowInfluencerDrawer(false)}
            centered
            className="modal-glass-bg"
            size="md"
          >
            <CustomHeader title="Select Influencer" className='border-0' closable={true} onClose={() => setShowInfluencerDrawer(false)} />
            <Modal.Body>
              <p className="text-muted small mb-3">Select an influencer to proceed with booking</p>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {influencersLoading ? (
                  <div className="d-flex justify-content-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {influencersData?.data?.map((influencer) => (
                      <div
                        key={influencer.id}
                        className={`p-3 rounded-3 border cursor-pointer d-flex align-items-center gap-3 ${selectedInfluencer === influencer.id
                          ? 'border-warning bg-warning bg-opacity-10'
                          : 'border-secondary'
                          }`}
                        onClick={() => setSelectedInfluencer(influencer.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`rounded-circle d-flex align-items-center justify-content-center ${selectedInfluencer === influencer.id ? 'bg-warning' : 'bg-secondary'
                          }`} style={{ width: 40, height: 40 }}>
                          {selectedInfluencer === influencer.id ? (
                            <Check size={20} className="text-dark" />
                          ) : (
                            <User size={20} className="text-white" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="text-white fw-medium">{influencer.name}</div>
                        </div>
                      </div>
                    ))}
                    {(!influencersData?.data || influencersData?.data?.length === 0) && (
                      <div className="text-center text-muted py-4">
                        No influencers available for this event
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-top border-secondary">
                <CustomBtn
                  disabled={!selectedInfluencer}
                  HandleClick={() => setShowInfluencerDrawer(false)}
                  buttonText="Continue"
                  className="w-100"
                />
              </div>
            </Modal.Body>
          </Modal>
        )}
      </Container>
    </div >
  );
};

CartPage.layout = "events";
export default CartPage;
