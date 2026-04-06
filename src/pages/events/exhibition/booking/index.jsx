import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/axiosInterceptor';
import { Alert, Form, Spinner, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { getUserByPhone } from '@/services/transferService';
import ResponsiveModalDrawer from '@/utils/ResponsiveModalDrawer';
import CustomBtn from '@/utils/CustomBtn';
import BookingFooterLayout from '@/utils/BookingFooterLayout';
import { useMyContext } from '@/Context/MyContextProvider';
import { useVendorProfile, useUpsertVendorProfile } from '@/services/vendorService';
import LoginOffCanvas from '@/components/auth/LoginOffCanvas';
import { LargeAndDesktop } from '@/utils/ResponsiveRenderer';
import { CardContainer, CardHeader, DetailItem } from '@/utils/EventCardUtils';
import { Ticket, Calendar, Pin } from 'lucide-react';
import { getErrorMessage } from '@/utils/errorUtils';

const StallLayoutCanvas = dynamic(
  () => import('@/components/Bookings/StallLayoutCanvas'),
  { ssr: false }
);

import StallDetailsContent from '@/components/Bookings/StallDetailsContent';
import BookingFormContent from '@/components/Bookings/BookingFormContent';

// Components extracted to separate files in @/components/Bookings/

const StallBookingPage = () => {
  const [layout, setLayout] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [error, setError] = useState('');
  // Form States
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userFound, setUserFound] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [searchError, setSearchError] = useState('');

  const [bookingForm, setBookingForm] = useState({
    vendor_id: '',
    product_description: '',
    expected_setup_date: [],
    notes: '',
    stall_name: ''
  });

  const [vendorProfile, setVendorProfile] = useState({
    business_name: '',
    business_type: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [formError, setFormError] = useState('');

  const router = useRouter();
  const { layout_id, event_id } = router.query;
  const { isLoggedIn, UserData } = useMyContext();
  const [showLogin, setShowLogin] = useState(false);

  // Vendor Profile Hooks
  const { data: profileData, isFetching: isFetchingProfile } = useVendorProfile(UserData?.id, {
    enabled: showForm && currentStep === 1 && !!UserData?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const upsertProfileMutation = useUpsertVendorProfile();

  // Reset state when user changes (login/logout/switch)
  useEffect(() => {
    setVendorProfile({
      business_name: '',
      business_type: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setBookingForm({
      vendor_id: '',
      product_description: '',
      expected_setup_date: [],
      notes: '',
      stall_name: ''
    });
    setCurrentStep(1);
    setFormError('');
  }, [UserData?.id]);

  useEffect(() => {
    if (profileData && (showForm && currentStep === 1)) {
      setVendorProfile(profileData);
    }
  }, [profileData, showForm, currentStep]);

  // Sync targetUser and phoneNumber with context
  useEffect(() => {
    if (isLoggedIn && UserData) {
      setTargetUser(UserData);
      setPhoneNumber(UserData.phone);
    }
  }, [isLoggedIn, UserData]);

  const handleStepOneProceed = async () => {
    setFormError('');
    upsertProfileMutation.mutate(vendorProfile, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        setCurrentStep(2);
      },
      onError: (err) => {
        setFormError(getErrorMessage(err, 'An error occurred while updating profile'));
      }
    });
  };

  const isUpdatingProfile = upsertProfileMutation.isPending;

  const lockStallMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/stall/lock', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Stall locked for booking!');
      setShowDrawer(false);
      setShowForm(true);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to lock stall. Please try again.'));
    }
  });

  const handleBookClick = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      lockStallMutation.mutate({
        event_id: Number(event_id),
        stall_slot_id: Number(selectedStall?.serverId || selectedStall?.id)
      });
    }
  };

  const initiatePaymentMutation = useMutation({
    mutationFn: async (payload) => {
      // Use stall_slot_id in the URL but ALSO keep it in the data body if needed
      const id = payload.stall_slot_id;
      const res = await api.post(`/stall/application/initiate-payment`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success(data?.message || 'Booking initiated successfully!');
        if (selectedStall) {
          setLayout((prev) =>
            prev.map((item) =>
              item.id === selectedStall.id
                ? { ...item, meta: { ...item.meta, booked: true } }
                : item
            )
          );
        }
        closeModal();

        const sessionId = data?.session_id || data?.application?.session_id || data?.id || '';
        if (sessionId) {
          router.push(`/events/exhibition/booking/summary?event_id=${event_id}&session_id=${sessionId}`);
        } else {
          router.push(`/events/exhibition/booking/summary?event_id=${event_id}`);
        }
      }
    },
    onError: (error) => {
      setFormError(getErrorMessage(error, 'Failed to initiate payment. Please try again.'));
    }
  });

  const { data: layoutRes, isLoading, isError } = useQuery({
    queryKey: ['stall-layout', layout_id],
    queryFn: async () => {
      if (!layout_id) return null;
      const res = await api.get(`stall-layout/${layout_id}`);
      return res.data;
    },
    enabled: !!layout_id,
  });

  const eventDateRange = useMemo(() => {
    const rangeStr = layoutRes?.data?.date_range || layoutRes?.data?.event?.date_range;
    if (!rangeStr) return { min: null, max: null };
    const [start, end] = rangeStr.split(',').map(d => d.trim());
    return {
      min: start ? new Date(start) : null,
      max: end ? new Date(end) : null
    };
  }, [layoutRes]);

  const eventData = layoutRes?.data?.event;
  const eventDetails = [
    {
      icon: Ticket,
      label: "Event Name",
      value: eventData?.name || "Loading...",
    },
    {
      icon: Calendar,
      label: "Date Range",
      value: eventData?.date_range?.replace(',', ' to ') || "Loading...",
    },
    {
      icon: Pin,
      label: "Location",
      value: eventData?.venue ? `${eventData.venue.name}, ${eventData.venue.city}` : "Loading...",
    },
  ];

  useEffect(() => {
    if (layoutRes?.data?.canvas) {
      const canvasData = Array.isArray(layoutRes.data.canvas) ? layoutRes.data.canvas : [];
      const normalized = canvasData.map((shape, index) => ({
        id: shape?.id ?? `shape-${index}`,
        type: shape?.type || 'rect',
        x: Number(shape?.x || 0),
        y: Number(shape?.y || 0),
        width: Number(shape?.width || 0),
        height: Number(shape?.height || 0),
        rotation: Number(shape?.rotation || 0),
        radius: Number(shape?.radius || (shape?.type === 'polygon' ? 55 : 0)),
        sides: Number(shape?.sides || 5),
        points: Array.isArray(shape?.points) ? shape.points : [],
        stroke: shape?.stroke,
        strokeWidth: shape?.strokeWidth,
        style: shape?.style || {},
        serverId: shape?.serverId,
        entityType: shape?.entityType || '',
        meta: shape?.meta || {},
        display: shape?.display || {},
        booking: shape?.booking || {},
        insetX: shape?.insetX ?? shape?.inset,
        insetY: shape?.insetY ?? shape?.inset,
        scaleX: shape?.scaleX,
        scaleY: shape?.scaleY,
      }));
      setLayout(normalized);
      setError('');
    }
  }, [layoutRes]);

  useEffect(() => {
    if (isError) {
      setLayout([]);
      setError('Unable to load stall layout. Please try again later.');
    }
  }, [isError]);



  const getFillColor = (shape) => {
    const bookingStatus = shape?.booking?.status?.toLowerCase();
    const isActuallyBooked = shape?.meta?.booked || bookingStatus === 'confirmed' || bookingStatus === 'pending';
    const isActuallyHeld = bookingStatus === 'hold' || shape?.booking?.is_held;

    if (shape?.entityType !== 'stall') return shape?.style?.fill || '#eee';
    if (!shape?.meta?.bookable) return '#999';
    if (isActuallyBooked) return '#ff4d4f';
    if (isActuallyHeld) return '#faad14'; // Orange for hold
    return shape?.style?.fill || '#52c41a';
  };

  const handleSelect = (shape) => {
    if (shape?.entityType !== 'stall') return;
    if (!shape?.meta?.bookable) return;

    const bookingStatus = shape?.booking?.status?.toLowerCase();
    const isActuallyBooked = shape?.meta?.booked || bookingStatus === 'confirmed' || bookingStatus === 'pending';
    const isActuallyHeld = bookingStatus === 'hold' || shape?.booking?.is_held;

    if (isActuallyBooked || isActuallyHeld) return;

    setSelectedStall(shape);
    setShowDrawer(true);
  };

  const closeModal = () => {
    // Reset all form states on close
    setShowForm(false);
    setCurrentStep(1);
    setBookingForm({
      vendor_id: '',
      product_description: '',
      expected_setup_date: [],
      notes: '',
      stall_name: ''
    });
    setVendorProfile({
      business_name: '',
      business_type: '',
      gst_number: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
  };

  const isFormValid = useMemo(() => {
    return (
      // bookingForm.stall_name?.trim().length >= 3 &&
      bookingForm.product_description?.trim().length >= 10 &&
      Array.isArray(bookingForm.expected_setup_date) &&
      bookingForm.expected_setup_date.length > 0
    );
  }, [bookingForm]);

  const handlePayment = () => {
    if (!selectedStall || !isFormValid) return;

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const setupDateValue = bookingForm.expected_setup_date.length === 2
      ? `${formatDate(bookingForm.expected_setup_date[0])} to ${formatDate(bookingForm.expected_setup_date[1])}`
      : formatDate(bookingForm.expected_setup_date[0]);

    const payload = {
      event_id: Number(event_id),
      stall_slot_id: Number(selectedStall?.serverId || selectedStall?.id),
      product_description: bookingForm.product_description,
      expected_setup_date: setupDateValue,
      notes: bookingForm.notes,
      stall_name: bookingForm.stall_name,
      booked_for_user_id: targetUser?.id // Send the verified user ID
    };
    initiatePaymentMutation.mutate(payload);
  };

  return (
    <div className="px-3">
      <Row>
        <Col lg={8}>
          {isLoading && (
            <div className="py-5 text-center custom-dark-bg rounded-3">
              <Spinner animation="border" role="status" />
              <div className="mt-2">Loading stall layout...</div>
            </div>
          )}

          {!isLoading && error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {!isLoading && !error && (
            <>
              {layout.length > 0 ? (
                <div className="rounded-3 overflow-hidden shadow-lg custom-dark-bg">
                  <StallLayoutCanvas
                    layout={layout}
                    selectedStallId={selectedStall?.id}
                    onSelect={handleSelect}
                    getFillColor={getFillColor}
                  />
                </div>
              ) : (
                <div className="text-center text-muted py-5 border rounded bg-light">
                  No stalls available for this event.
                </div>
              )}

              <ResponsiveModalDrawer
                show={showDrawer}
                onHide={() => setShowDrawer(false)}
                title="Stall Details"
                className="text-white shadow-lg"
                drawerProps={{ className: "text-white border-start border-secondary" }}
                modalProps={{ headerClassName: "m-2" }}
              >
                <StallDetailsContent
                  stall={selectedStall}
                  eventDetails={eventDetails}
                  onBook={handleBookClick}
                  onCancel={() => setShowDrawer(false)}
                />
              </ResponsiveModalDrawer>
            </>
          )}
        </Col>

        <Col lg={4}>
          <LargeAndDesktop>
            <CardContainer>
              <CardHeader
                icon={Ticket}
                title="Event Details"
                iconColor="text-warning"
              />
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
          </LargeAndDesktop>
        </Col>
      </Row>

      <ResponsiveModalDrawer
        show={showForm}
        onHide={closeModal}
        title="Book Stall"
        size="lg"
        drawerProps={{
          className: "card-glassmorphism offcanvas-height-95",
          placement: "bottom",
          hideIndicator: true
        }}
        modalProps={{
          className: "exhibition-booking-modal",
          contentClassName: "card-glassmorphism text-white",
          headerClassName: "m-2"
        }}
      >
        <BookingFormContent
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          profile={vendorProfile}
          setProfile={setVendorProfile}
          isFetchingProfile={isFetchingProfile}
          isUpdatingProfile={isUpdatingProfile}
          form={bookingForm}
          setForm={setBookingForm}
          stall={selectedStall}
          event_id={event_id}
          onCancel={closeModal}
          onProceed={currentStep === 1 ? handleStepOneProceed : handlePayment}
          isValid={isFormValid}
          isPending={initiatePaymentMutation.isPending}
          eventDateRange={eventDateRange}
          error={formError}
          setError={setFormError}
        />
      </ResponsiveModalDrawer>
      <LoginOffCanvas
        show={showLogin}
        onHide={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          handleBookClick(); // Try booking again after successful login
        }}
      />
    </div>
  );
};

export default StallBookingPage;
