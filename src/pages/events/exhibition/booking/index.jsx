import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/axiosInterceptor';
import { Alert, Button, Form, Modal, Spinner, Row, Col } from 'react-bootstrap';
import CustomDrawer from '@/utils/CustomDrawer';
import ResponsiveModalDrawer from '@/utils/ResponsiveModalDrawer';
import CustomBtn from '@/utils/CustomBtn';
import BookingFooterLayout from '@/utils/BookingFooterLayout';
import MobileTwoButtonFooter from '@/utils/MobileTwoButtonFooter';
import { useMyContext } from '@/Context/MyContextProvider';
import LoginOffCanvas from '@/components/auth/LoginOffCanvas';

const StallLayoutCanvas = dynamic(
  () => import('@/components/Bookings/StallLayoutCanvas'),
  { ssr: false }
);

const StallDetailsContent = ({ stall, onBook, onCancel }) => (
  <div className="d-flex flex-column h-100 p-2 text-white">
    <div className="flex-grow-1 overflow-auto">
      <div className="mb-4 text-center">
        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Stall Name</label>
        <h4 className="fw-bold">{stall?.meta?.name || 'Unnamed Stall'}</h4>
      </div>

      <div className="mb-4 text-center">
        <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Pricing</label>
        <h3 className="text-success fw-bold">₹{stall?.meta?.price ?? 'N/A'}</h3>
      </div>
      <div className="pb-5 mb-5"></div>
    </div>

    <MobileTwoButtonFooter
      leftButton={
        <CustomBtn
          variant="secondary"
          buttonText="Cancel"
          HandleClick={onCancel}
          hideIcon={true}
          className="w-100"
        />
      }
      rightButton={
        <CustomBtn
          variant="primary"
          buttonText="Book Stall"
          HandleClick={onBook}
          hideIcon={true}
          className="w-100"
        />
      }
    />
  </div >
);

const BookingFormContent = ({ form, setForm, onCancel, onProceed, isValid, isPending }) => (
  <Form className="px-3">
    <Row>
      {/* <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Vendor ID</Form.Label>
          <Form.Control
            type="number"
            className="card-glassmorphism__input"
            value={form.vendor_id}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, vendor_id: event.target.value }))
            }
            placeholder="Enter Vendor ID"
          />
        </Form.Group>
      </Col> */}
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Expected Setup Date</Form.Label>
          <Form.Control
            type="date"
            className="card-glassmorphism__input"
            value={form.expected_setup_date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, expected_setup_date: event.target.value }))
            }
          />
        </Form.Group>
      </Col>
    </Row>

    <Form.Group className="mb-3">
      <Form.Label>Product Description</Form.Label>
      <Form.Control
        as="textarea"
        rows={1}
        className="card-glassmorphism__input"
        value={form.product_description}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, product_description: event.target.value }))
        }
        placeholder="What products will you be displaying?"
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Notes</Form.Label>
      <Form.Control
        as="textarea"
        rows={1}
        className="card-glassmorphism__input"
        value={form.notes}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, notes: event.target.value }))
        }
        placeholder="Any special requests or notes?"
      />
    </Form.Group>

    <hr />

    {/* <Row>
      <Col xs={6}>
        <Form.Group className="mb-3">
          <Form.Label>Stall Number</Form.Label>
          <Form.Control type="text" value={stall?.meta?.name || ''} disabled />
        </Form.Group>
      </Col>
      <Col xs={6}>
        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control type="text" value={`₹${stall?.meta?.price ?? ''}`} disabled />
        </Form.Group>
      </Col>
    </Row> */}

    <div className="pb-5 mb-5 text-transparent"></div>
    <BookingFooterLayout>
      <div className="d-flex gap-2 w-100 px-3 pb-2">
        <CustomBtn
          variant="secondary"
          className=" w-100"
          wrapperClassName="flex-grow-1"
          buttonText="Cancel"
          HandleClick={onCancel}
          hideIcon={true}
        />
        <CustomBtn
          variant="primary"
          className="w-100"
          wrapperClassName="flex-grow-1"
          buttonText="Proceed to Payment"
          HandleClick={onProceed}
          disabled={!isValid || isPending}
          loading={isPending}
          hideIcon={true}
        />
      </div>
    </BookingFooterLayout>
  </Form>
);

const StallBookingPage = () => {
  const [layout, setLayout] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    vendor_id: '',
    product_description: '',
    expected_setup_date: '',
    notes: ''
  });

  const router = useRouter();
  const { layout_id, event_id } = router.query;
  const { isLoggedIn } = useMyContext();
  const [showLogin, setShowLogin] = useState(false);

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
      toast.error(error?.response?.data?.message || 'Failed to lock stall. Please try again.');
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
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to initiate payment. Please try again.');
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
        radius: Number(shape?.radius || 0),
        points: Array.isArray(shape?.points) ? shape.points : [],
        stroke: shape?.stroke,
        strokeWidth: shape?.strokeWidth,
        style: shape?.style || {},
        serverId: shape?.serverId,
        entityType: shape?.entityType || '',
        meta: shape?.meta || {},
        display: shape?.display || {}
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
    if (shape?.entityType !== 'stall') return '#eee';
    if (!shape?.meta?.bookable) return '#999';
    if (shape?.meta?.booked) return '#ff4d4f';
    return '#52c41a';
  };

  const handleSelect = (shape) => {
    if (shape?.entityType !== 'stall') return;
    if (!shape?.meta?.bookable) return;
    if (shape?.meta?.booked) return;

    setSelectedStall(shape);
    setShowDrawer(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setShowDrawer(false);
    setSelectedStall(null);
    setBookingForm({
      vendor_id: '',
      product_description: '',
      expected_setup_date: '',
      notes: ''
    });
  };

  const isFormValid = useMemo(() => {
    return (
      bookingForm.product_description.trim() &&
      bookingForm.expected_setup_date.trim()
    );
  }, [bookingForm]);

  const handlePayment = () => {
    if (!selectedStall || !isFormValid) return;

    const payload = {
      event_id: Number(event_id),
      stall_slot_id: Number(selectedStall?.serverId || selectedStall?.id),
      product_description: bookingForm.product_description,
      expected_setup_date: bookingForm.expected_setup_date,
      notes: bookingForm.notes
    };

    console.log('Booking Payload:', payload);
    initiatePaymentMutation.mutate(payload);
  };

  return (
    <div className="" style={{ maxHeight: '60vh' }}>
      <div className="row">
        <div className="col-12">
          {isLoading && (
            <div className="py-5 text-center">
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
                <StallLayoutCanvas
                  layout={layout}
                  selectedStallId={selectedStall?.id}
                  onSelect={handleSelect}
                  getFillColor={getFillColor}
                />
              ) : (
                <div className="text-center text-muted py-5 border rounded bg-light">
                  No stalls available for this event.
                </div>
              )}

              <ResponsiveModalDrawer
                show={showDrawer}
                onHide={() => setShowDrawer(false)}
                title="Stall Details"
                className="bg-dark text-white shadow-lg"
                drawerProps={{ className: "bg-dark text-white border-start border-secondary" }}
              >
                <StallDetailsContent
                  stall={selectedStall}
                  onBook={handleBookClick}
                  onCancel={() => setShowDrawer(false)}
                />
              </ResponsiveModalDrawer>
            </>
          )}
        </div>
      </div>

      <ResponsiveModalDrawer
        show={showForm}
        onHide={closeModal}
        title="Book Stall"
        size="lg"
      >
        <BookingFormContent
          form={bookingForm}
          setForm={setBookingForm}
          stall={selectedStall}
          event_id={event_id}
          onCancel={closeModal}
          onProceed={handlePayment}
          isValid={isFormValid}
          isPending={initiatePaymentMutation.isPending}
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
