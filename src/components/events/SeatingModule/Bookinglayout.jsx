// BookingLayout.jsx - IMPROVED VERSION WITH CUSTOM HOOK
import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { api } from "@/lib/axiosInterceptor";
import useBooking from './components/Usebooking';
import { Clock, Loader } from 'lucide-react';
import BookingSeatCanvas from './components/BookingSeatCanvasWrapper';
import EventSeatsListener from './EventSeatsListener';
import { useMyContext } from '@/Context/MyContextProvider';

const BookingLayout = (props) => {
    const { layoutId, eventId, setSelectedTkts, event } = props;
    const { UserData } = useMyContext();
    const stageRef = useRef(null);

    // Custom booking hook
    const {
        selectedSeats,
        setSelectedSeats,
        sections,
        timeRemaining,
        isTimerActive,
        setSections,
        handleSeatClick,
        getTotalAmount,
        getTicketCounts,
        validateBooking,
        markSeatsAsBooked,
        extendTimer,
        maxSeats
    } = useBooking({
        maxSeats: 10,
        holdDuration: 600, // 10 minutes
        autoHoldTimeout: true,
        event: event // Pass event data for tax calculations
    });

    useEffect(() => {
        setSelectedTkts(selectedSeats);
    }, [selectedSeats])

    // Local state
    const [isLoading, setIsLoading] = useState(false);
    const [layoutData, setLayoutData] = useState(null);
    const [stage, setStage] = useState(null);
    const [canvasScale, setCanvasScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
    const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleRemoveSeat = () => {
        setSelectedSeats([]);
    };

    // Fetch layout data with seat and ticket information
    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();
        const fetchLayoutData = async () => {
            if (!layoutId) return;

            setIsLoading(true);
            handleRemoveSeat()
            try {
                const response = await api.get(`layout/theatre/${layoutId}?eventId=${eventId}`, {
                    signal: abortController.signal
                });

                if (!isMounted) return;

                const data = response?.data?.data;
                // Process the layout data
                if (data.stage) {
                    setStage({
                        ...data.stage,
                        x: parseFloat(data.stage.x) || 0,
                        y: parseFloat(data.stage.y) || 0,
                        width: parseFloat(data.stage.width) || 800,
                        height: parseFloat(data.stage.height) || 50
                    });
                }

                if (data.sections && Array.isArray(data.sections)) {
                    // Process sections and seats with ticket information
                    const processedSections = data.sections.map(section => ({
                        ...section,
                        x: parseFloat(section.x) || 0,
                        y: parseFloat(section.y) || 0,
                        width: parseFloat(section.width) || 600,
                        height: parseFloat(section.height) || 250,
                        rows: section.rows?.map(row => ({
                            ...row,
                            numberOfSeats: parseInt(row.numberOfSeats) || 0,
                            curve: parseFloat(row.curve) || 0,
                            spacing: parseFloat(row.spacing) || 40,
                            seats: row.seats?.map(seat => ({
                                ...seat,
                                number: parseInt(seat.number) || 0,
                                x: parseFloat(seat.x) || 0,
                                y: parseFloat(seat.y) || 0,
                                radius: parseFloat(seat.radius) || 12,
                                // Seat status can be: 'available', 'selected', 'booked', 'disabled'
                                status: seat.status || 'available',
                                // Ticket information from relation
                                ticket: seat.ticket || null
                            })) || []
                        })) || []
                    }));

                    setSections(processedSections);

                    // Set default zoom based on number of sections
                    const sectionCount = processedSections.length;
                    let initialZoom = 1;

                    if (sectionCount === 0 || sectionCount === 1) {
                        initialZoom = 1; // Full zoom for 0 or 1 section
                    } else if (sectionCount === 2) {
                        initialZoom = 0.9; // Slight zoom out for 2 sections
                    } else if (sectionCount <= 4) {
                        initialZoom = 0.75; // More zoom out for 3-4 sections
                    } else if (sectionCount <= 6) {
                        initialZoom = 0.6; // Further zoom out for 5-6 sections
                    } else {
                        initialZoom = 0.5; // Maximum zoom out for 7+ sections
                    }

                    setCanvasScale(initialZoom);
                }

                setLayoutData(data);
                toast.success('Layout loaded successfully');
            } catch (error) {
                if (error.name === 'AbortError') return;
                if (!isMounted) return;

                console.error('Error fetching layout:', error);
                toast.error('Failed to load seating layout');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchLayoutData();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [layoutId, setSections]);



    // Handle wheel zoom
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const stageInst = e.target.getStage();
        const oldScale = stageInst.scaleX();
        const pointer = stageInst.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stageInst.x()) / oldScale,
            y: (pointer.y - stageInst.y()) / oldScale
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
        const clampedScale = Math.max(0.5, Math.min(newScale, 3));

        setCanvasScale(clampedScale);

        const newPos = {
            x: pointer.x - mousePointTo.x * clampedScale,
            y: pointer.y - mousePointTo.y * clampedScale
        };

        stageInst.position(newPos);
        setStagePosition(newPos);
        stageInst.batchDraw();
    };

    // Proceed to checkout
    const handleProceedToCheckout = () => {
        if (selectedSeats.length === 0) {
            toast.warning('Please select at least one seat');
            return;
        }
        setIsCheckoutModalVisible(true);
    };

    // Handle booking submission
    const handleBooking = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        const values = {
            customerName: form.customerName.value,
            customerEmail: form.customerEmail.value,
            customerPhone: form.customerPhone.value
        };

        // Validate booking data
        const validation = validateBooking({
            eventId,
            layoutId,
            ...values
        });

        if (!validation.valid) {
            validation.errors.forEach(error => toast.error(error));
            return;
        }

        setIsProcessing(true);

        try {
            const totalAmount = getTotalAmount();

            const bookingData = {
                eventId: eventId,
                layoutId: layoutId,
                customerName: values.customerName,
                customerEmail: values.customerEmail,
                customerPhone: values.customerPhone,
                seats: selectedSeats.map(seat => ({
                    seatId: seat.id,
                    sectionId: seat.sectionId,
                    rowId: seat.rowId,
                    ticketId: seat.ticket?.id,
                    price: parseFloat(seat.ticket?.price || 0)
                })),
                totalAmount: totalAmount,
                bookingDate: new Date().toISOString()
            };

            const response = await api.post('booking/create', bookingData);

            toast.success('Booking confirmed successfully!');
            setIsCheckoutModalVisible(false);
            setValidated(false);
            e.currentTarget.reset();

            // Mark seats as booked
            markSeatsAsBooked();

            // Optional: Navigate to confirmation page
            // navigate(`/booking-confirmation/${response.bookingId}`);

        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to complete booking. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle extend time
    const handleExtendTime = () => {
        extendTimer(300); // Add 5 more minutes
    };

    if (isLoading) {
        return (
            <Loader />
        );
    }

    const totalAmount = getTotalAmount();
    const ticketCategoryCounts = getTicketCounts();

    return (
        <div className="booking-layout">
            {/* WebSocket listener for real-time seat updates */}
            <EventSeatsListener
                eventId={eventId}
                sections={sections}
                setSections={setSections}
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                currentUserId={UserData?.id}
            />

            <Card className="border-0 custom-dark-bg">
                <Card.Body className="p-0">

                    <Row>
                        {/* Left Side - Canvas */}
                        <Col xs={12} md={12}>
                            <div
                                className='booking-canvas rounded-4 overflow-hidden'
                                style={{
                                    height: window.innerWidth < 768 ? 'calc(100vh - 250px)' : '33rem',
                                    position: 'relative',
                                    width: '100%'
                                }}
                            >
                                <BookingSeatCanvas
                                    stageRef={stageRef}
                                    canvasScale={canvasScale}
                                    stage={stage}
                                    sections={sections}
                                    selectedSeats={selectedSeats}
                                    onSeatClick={handleSeatClick}
                                    handleWheel={handleWheel}
                                    setStagePosition={setStagePosition}
                                    currentUserId={UserData?.id}
                                />
                            </div>
                        </Col>

                        {/* Right Side - Summary */}
                        {/* <Col xs={24} span={24}>
                        <BookingSummary
                            selectedSeats={selectedSeats}
                            ticketCategoryCounts={ticketCategoryCounts}
                            onRemoveSeat={handleRemoveSeat}
                            onClearSelection={handleClearSelection}
                            onProceedToCheckout={handleProceedToCheckout}
                        />
                        <BookingLegend sections={sections} />
                    </Col> */}
                    </Row>
                </Card.Body>
            </Card>

            {/* Checkout Modal */}
            <Modal
                show={isCheckoutModalVisible}
                onHide={() => setIsCheckoutModalVisible(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Complete Your Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h6>Booking Summary</h6>
                        <div className="p-3 bg-light rounded">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Total Seats:</span>
                                <strong>{selectedSeats.length}</strong>
                            </div>
                            {Object.entries(ticketCategoryCounts).map(([name, data]) => (
                                <div key={name} className="d-flex justify-content-between mb-1">
                                    <span>{name} × {data.count}:</span>
                                    <span>₹{(data.price * data.count).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Total Amount:</strong>
                                <strong className="text-primary">₹{totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* Time Warning */}
                        {isTimerActive && timeRemaining < 120 && (
                            <div className="alert alert-warning mt-3 mb-0">
                                <Clock className="me-2" /> Hurry! Only {Math.floor(timeRemaining / 60)} minute(s) remaining to complete booking
                            </div>
                        )}
                    </div>

                    <Form noValidate validated={validated} onSubmit={handleBooking}>
                        <Form.Group className="mb-3" controlId="customerName">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="customerName"
                                placeholder="Enter your full name"
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter your name
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="customerEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="customerEmail"
                                placeholder="Enter your email"
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid email
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="customerPhone">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                name="customerPhone"
                                placeholder="Enter your phone number"
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter your phone number
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="secondary" onClick={() => setIsCheckoutModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Confirm Booking (₹${totalAmount.toFixed(2)})`}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default BookingLayout;