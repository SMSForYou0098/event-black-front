import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { getErrorMessage } from '@/utils/errorUtils';
import { api } from '@/lib/axiosInterceptor';


// Rotating messages to display while waiting
const WAITING_MESSAGES = [
    'Processing your payment...',
    'Confirming with your bank...',
    'Almost there, securing your stall...',
    'Just a moment, finalizing your booking...',
    'Verifying payment details...',
    'Preparing your confirmation details...',
];

// Timeout duration in milliseconds (60 seconds)
const TIMEOUT_DURATION = 60000;

const StallPaymentWaiting = () => {
    const router = useRouter();
    const { event_id, session_id } = router.query;
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
        if (!router.isReady || !session_id) return;

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

        const handleSuccess = (data) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setStatus('confirmed');
            setMessage('Payment Successful!');
            if (eventSourceRef.current) eventSourceRef.current.close();

            setTimeout(() => {
                const eventIdParam = event_id || data.event_id || '';
                router.push(
                    `/events/exhibition/booking/summary?event_id=${encodeURIComponent(eventIdParam)}&session_id=${encodeURIComponent(session_id)}`
                );
            }, 1500);
        };

        const handleFailure = (data) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setStatus('failed');
            const isCancelled = data.status === 'cancelled' || data.payment_status === 'cancelled';
            setErrorMessage(getErrorMessage(data, isCancelled ? 'Payment was cancelled.' : 'Payment failed. Please try again.'));
            if (eventSourceRef.current) eventSourceRef.current.close();
        };

        // Try EventSource for real-time updates
        const eventSourceTimeout = setTimeout(() => {
            try {
                const base = process.env.NEXT_PUBLIC_API_PATH.endsWith('/')
                    ? process.env.NEXT_PUBLIC_API_PATH.slice(0, -1)
                    : process.env.NEXT_PUBLIC_API_PATH;
                const fullUrl = `${base}/payments/stall-status-stream/${session_id}?token=${authToken}`;

                console.log('Final EventSource URL:', fullUrl);
                const eventSource = new EventSource(fullUrl);
                eventSourceRef.current = eventSource;

                console.log('Event so', eventSource)

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('SSE Data Received:', data);
                        if (data.application_status === 'confirmed' || data.application_status === 'success' || data.status === 'confirmed' || data.status === 'success') {
                            handleSuccess(data);
                        } else if (data.status === 'failed' || data.payment_status === 'failed' || data.status === 'error' || data.payment_status === 'error' || data.status === 'cancelled' || data.payment_status === 'cancelled') {
                            handleFailure(data);
                        }
                    } catch (e) { console.error('SSE Parse Error', e); }
                };

                eventSource.onerror = async (err) => {
                    console.warn('EventSource aborted (likely due to MIME type mismatch). Checking status via manual API call...');
                    eventSource.close();

                    try {
                        // If EventSource failed because the server sent JSON, we fetch that status manually
                        const res = await api.post('/stall/application/verify-session', { session_id });
                        const data = res.data;

                        if (data.application_status === 'confirmed' || data.application_status === 'success' || data.status === 'confirmed' || data.status === 'success') {
                            handleSuccess(data);
                        } else if (data.status === 'failed' || data.payment_status === 'failed' || data.status === 'error' || data.payment_status === 'error' || data.status === 'cancelled' || data.payment_status === 'cancelled') {
                            handleFailure(data);
                        }
                    } catch (manualError) {
                        console.error('Manual fallback check failed:', manualError);
                    }
                };

            } catch (error) {
                console.error('Failed to initialize EventSource:', error);
            }
        }, 1000);

        return () => {
            clearTimeout(eventSourceTimeout);
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
    }, [session_id, event_id, authToken, router, router.isReady]);

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
        router.push(`/events/exhibition/booking?event_id=${event_id}`);
    };

    const handleViewBookings = () => {
        router.push('/bookings');
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

                        <h4 className="text-white mb-3">
                            {status === 'pending' && message}
                            {status === 'confirmed' && 'Payment Successful!'}
                            {status === 'failed' && 'Payment Failed'}
                            {status === 'timeout' && 'Status Pending'}
                        </h4>

                        <p className="text-muted mb-4">
                            {status === 'pending' && 'Please wait while we confirm your payment.'}
                            {status === 'confirmed' && 'Your stall booking has been confirmed.'}
                            {status === 'failed' && errorMessage}
                            {status === 'timeout' && (
                                <>
                                    <span className="text-warning fw-semibold">Wait a moment!</span> We are still confirming your booking status.
                                    <br />
                                    If your payment was successful, you will receive confirmation shortly.
                                    <br />
                                    <small>Redirecting to home page...</small>
                                </>
                            )}
                        </p>

                        {status === 'pending' && (
                            <div className="mb-4">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="ms-2 text-muted small">Waiting for confirmation...</span>
                            </div>
                        )}

                        {status === 'timeout' && (
                            <div className="mb-4">
                                <Clock size={40} className="text-warning mb-2" />
                                <p className="text-muted small mb-0">
                                    You can check your booking status in <strong>"My Bookings"</strong> soon.
                                </p>
                            </div>
                        )}

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

StallPaymentWaiting.layout = 'events';
export default StallPaymentWaiting;
