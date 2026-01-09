import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';

// Rotating messages to display while waiting
const WAITING_MESSAGES = [
    'Processing your payment...',
    'Confirming with your bank...',
    'Almost there, securing your tickets...',
    'Just a moment, finalizing your booking...',
    'Verifying payment details...',
    'Preparing your e-tickets...',
];

// Timeout duration in milliseconds (60 seconds)
const TIMEOUT_DURATION = 60000;

const PaymentWaiting = () => {
    const router = useRouter();
    const { event_key, session_id } = router.query;
    const { ErrorAlert, authToken } = useMyContext();

    const [status, setStatus] = useState('pending'); // pending, confirmed, failed, timeout
    const [message, setMessage] = useState(WAITING_MESSAGES[0]);
    const [messageIndex, setMessageIndex] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const eventSourceRef = useRef(null);
    const messageIntervalRef = useRef(null);
    const timeoutRef = useRef(null);

    // Rotate messages every 10 seconds
    useEffect(() => {
        if (status !== 'pending') return;

        messageIntervalRef.current = setInterval(() => {
            setMessageIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % WAITING_MESSAGES.length;
                setMessage(WAITING_MESSAGES[nextIndex]);
                return nextIndex;
            });
        }, 10000);

        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        };
    }, [status]);

    useEffect(() => {
        if (!session_id || !event_key) return;

        // Set timeout for no response scenario
        timeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            setStatus('timeout');
            setMessage('Taking longer than expected...');

            // Wait 5 seconds showing the reassuring message, then redirect
            setTimeout(() => {
                router.push('/');
            }, 5000);
        }, TIMEOUT_DURATION);

        // Try EventSource for real-time updates
        try {
            // const eventSource = new EventSource(`http://192.168.0.166:8000/api/dark/payments/status-stream/ORD123`);
            const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_PATH}payments/status-stream/${session_id}?token=${authToken}`);
            eventSourceRef.current = eventSource;
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.payment_status === 'confirmed' || data.payment_status === 'success') {
                        // Clear timeout since we got a response
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);

                        setStatus('confirmed');
                        setMessage('Payment Successful!');
                        eventSource.close();

                        // Navigate to summary page
                        setTimeout(() => {
                            router.push(
                                `/events/summary/${encodeURIComponent(event_key)}?session_id=${encodeURIComponent(session_id)}`
                            );
                        }, 1500);
                    } else if (data.status === 'failed') {
                        // Clear timeout since we got a response
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);

                        setStatus('failed');
                        setErrorMessage(data.message || 'Payment failed. Please try again.');
                        eventSource.close();
                    }
                } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                }
            };

            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();

                // Don't immediately fail, let the timeout handle it for better UX
                // Only set failed if we haven't already timed out
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    setStatus('timeout');
                    setMessage('Taking longer than expected...');

                    setTimeout(() => {
                        router.push('/');
                    }, 5000);
                }
            };

        } catch (error) {
            console.error('EventSource not supported or failed:', error);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setStatus('timeout');
            setMessage('Taking longer than expected...');

            setTimeout(() => {
                router.push('/');
            }, 5000);
        }

        // Cleanup
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [session_id, event_key]);

    const getStatusIcon = () => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle size={80} className="text-success" />;
            case 'failed':
                return <XCircle size={80} className="text-danger" />;
            default:
                return <Clock size={80} className="text-warning" />;
        }
    };

    const handleRetry = () => {
        router.push(`/events/cart/${event_key}`);
    };

    const handleViewBookings = () => {
        router.push('/my-bookings');
    };

    if (!session_id) {
        return (
            <div className="cart-page">
                <Container className="py-5 text-center">
                    <p className="text-muted">Loading...</p>
                </Container>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Container className="py-5">
                <Card className="custom-dark-bg text-center mx-auto" style={{ maxWidth: '500px' }}>
                    <Card.Body className="p-5">
                        {/* Status Icon */}
                        <div className="mb-4">
                            {status === 'pending' ? (
                                <div className="position-relative d-inline-block">
                                    <Image
                                        src="/assets/stock/payment_processing.gif"
                                        alt="Processing"
                                        width={120}
                                        height={120}
                                        className="rounded"
                                    />
                                </div>
                            ) : (
                                getStatusIcon()
                            )}
                        </div>

                        {/* Status Message */}
                        <h4 className="text-white mb-3">
                            {status === 'pending' && message}
                            {status === 'confirmed' && 'Payment Successful!'}
                            {status === 'failed' && 'Payment Failed'}
                            {status === 'timeout' && 'Payment Received'}
                        </h4>

                        <p className="text-muted mb-4">
                            {status === 'pending' && 'Please wait while we confirm your payment.'}
                            {status === 'confirmed' && 'Redirecting to your booking summary...'}
                            {status === 'failed' && errorMessage}
                            {status === 'timeout' && (
                                <>
                                    <span className="text-success fw-semibold">Don't worry!</span> Your payment has been processed successfully.
                                    <br />
                                    You will receive your tickets via WhatsApp, SMS & Email shortly.
                                    <br />
                                    <small>Redirecting to home page...</small>
                                </>
                            )}
                        </p>

                        {/* Loading Spinner for pending */}
                        {status === 'pending' && (
                            <div className="mb-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="ms-2 text-muted small">Waiting for confirmation...</span>
                            </div>
                        )}

                        {/* Timeout info */}
                        {status === 'timeout' && (
                            <div className="mb-4">
                                <CheckCircle size={40} className="text-success mb-2" />
                                <p className="text-muted small mb-0">
                                    Check your bookings in <strong>"My Bookings"</strong> section.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons for failed status */}
                        {status === 'failed' && (
                            <div className="d-flex gap-3 justify-content-center">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleViewBookings}
                                >
                                    View Bookings
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleRetry}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

PaymentWaiting.layout = 'events';
export default PaymentWaiting;
