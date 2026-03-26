import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axiosInterceptor';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import CustomDrawer from '@/utils/CustomDrawer';

const StallLayoutCanvas = dynamic(
  () => import('@/components/Bookings/StallLayoutCanvas'),
  { ssr: false }
);

const StallBookingPage = () => {
  const [layout, setLayout] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [error, setError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: ''
  });

  const router = useRouter();
  const { layout_id } = router.query;

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

  const handleOpenBooking = () => {
    if (!selectedStall) return;
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setShowDrawer(false);
    setSelectedStall(null);
    setBookingForm({ name: '', email: '' });
  };

  const isFormValid = useMemo(() => {
    return bookingForm.name.trim() && bookingForm.email.trim();
  }, [bookingForm]);

  const handlePayment = () => {
    if (!selectedStall || !isFormValid) return;

    alert('Payment Successful');

    setLayout((prev) =>
      prev.map((item) =>
        item.id === selectedStall.id
          ? {
            ...item,
            meta: { ...item.meta, booked: true }
          }
          : item
      )
    );

    closeModal();
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

              {/* Selection Drawer */}
              <CustomDrawer
                title="Stall Details"
                showOffcanvas={showDrawer}
                setShowOffcanvas={setShowDrawer}
                placement=""
                className="bg-dark text-white border-start border-secondary"
              // hideIndicator={true}
              >
                <div className="d-flex flex-column h-100 p-2">
                  <div className="flex-grow-1 overflow-auto">
                    <div
                      className="rounded-3 bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center mb-4"
                      style={{ height: '200px', border: '1px dashed rgba(255,255,255,0.2)' }}
                    >
                      <span className="text-muted">Stall Impression</span>
                    </div>

                    <div className="mb-4 text-center">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Stall Name</label>
                      <h4 className="fw-bold">{selectedStall?.meta?.name || 'Unnamed Stall'}</h4>
                    </div>

                    <div className="mb-4 text-center">
                      <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Pricing</label>
                      <h3 className="text-success fw-bold">₹{selectedStall?.meta?.price ?? 'N/A'}</h3>
                    </div>

                  </div>

                  <div className="pt-4 border-top border-secondary mt-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 py-3 fw-bold shadow-sm"
                      onClick={() => {
                        setShowDrawer(false);
                        setShowForm(true);
                      }}
                    >
                      Book This Stall
                    </Button>
                    <p className="text-center text-muted small mt-3 mb-0">
                      Secure your spot now before it's gone!
                    </p>
                  </div>
                </div>
              </CustomDrawer>
            </>
          )}
        </div>
      </div>

      <Modal show={showForm} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book Stall</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={bookingForm.name}
                onChange={(event) =>
                  setBookingForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Enter your name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={bookingForm.email}
                onChange={(event) =>
                  setBookingForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Enter your email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stall</Form.Label>
              <Form.Control type="text" value={selectedStall?.meta?.name || ''} disabled />
            </Form.Group>

            <Form.Group>
              <Form.Label>Price</Form.Label>
              <Form.Control type="text" value={selectedStall?.meta?.price ?? ''} disabled />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePayment} disabled={!isFormValid}>
            Proceed to Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StallBookingPage;
