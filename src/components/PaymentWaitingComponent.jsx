import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useMyContext } from '@/Context/MyContextProvider';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import { getErrorMessage } from '@/utils/errorUtils';

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
const EVENT_SOURCE_DELAY = 3000; // 3 second delay before starting EventSource

/**
 * PaymentWaitingComponent - Reusable component for payment confirmation waiting
 * 
 * @param {Object} props
 * @param {string} props.event_key - Event key from router
 * @param {string} props.session_id - Session ID from router
 * @param {Function} props.getSuccessRedirectPath - Returns redirect path on success
 * @param {Function} props.getFailureRedirectPath - Returns redirect path on failure
 * @param {Function} props.getTimeoutRedirectPath - Returns redirect path on timeout
 * @param {boolean} props.showTimeoutAsSuccess - If true, shows timeout as success message (default: false)
 */
const PaymentWaitingComponent = ({
    event_key,
    session_id,
    getSuccessRedirectPath,
    getFailureRedirectPath,
    getTimeoutRedirectPath,
    showTimeoutAsSuccess = false,
}) => {
    const router = useRouter();
    const { authToken } = useMyContext();

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

        // Check if status is already provided in URL query params
        const urlStatus = router.query.status;
        if (urlStatus) {
            const statusVal = urlStatus.toString().toLowerCase();
            
            // Handle terminal states from URL
            if (statusVal === 'confirmed' || statusVal === 'success') {
                setStatus('confirmed');
                setMessage('Payment Successful!');
                setTimeout(() => {
                    const redirectPath = getSuccessRedirectPath();
                    router.push(redirectPath);
                }, 1500);
                return;
            } else if (statusVal === 'failed' || statusVal === 'error' || statusVal.includes('cancel')) {
                setStatus('failed');
                const isCancelled = statusVal.includes('cancel');
                setErrorMessage(
                    getErrorMessage(
                        { status: urlStatus },
                        isCancelled ? 'Payment was cancelled.' : 'Payment failed. Please try again.'
                    )
                );
                setTimeout(() => {
                    const redirectPath = getFailureRedirectPath();
                    router.push(redirectPath);
                }, 1500);
                return;
            }
        }

        // Set timeout for no response scenario
        timeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            setStatus('timeout');
            setMessage('Taking longer than expected...');

            // Wait 5 seconds showing the reassuring message, then redirect
            setTimeout(() => {
                const redirectPath = getTimeoutRedirectPath();
                router.push(redirectPath);
            }, 5000);
        }, TIMEOUT_DURATION);

        // Try EventSource for real-time updates
        // Delay EventSource creation by 3 seconds
        const eventSourceTimeout = setTimeout(() => {
            try {
                const eventSource = new EventSource(
                    `${process.env.NEXT_PUBLIC_API_PATH}payments/status-stream/${session_id}?token=${authToken}`
                );
                eventSourceRef.current = eventSource;

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        const statusVal = (data.status ?? data.payment_status ?? '')
                            .toString()
                            .toLowerCase();

                        // Check for success
                        if (statusVal === 'confirmed' || statusVal === 'success') {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);

                            setStatus('confirmed');
                            setMessage('Payment Successful!');
                            eventSource.close();

                            // Navigate to summary page
                            setTimeout(() => {
                                const redirectPath = getSuccessRedirectPath();
                                router.push(redirectPath);
                            }, 1500);
                        }
                        // Check for failure
                        else if (statusVal === 'failed' || statusVal === 'error' || statusVal.includes('cancel')) {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            setStatus('failed');
                            const isCancelled = statusVal.includes('cancel');
                            setErrorMessage(
                                getErrorMessage(
                                    data,
                                    isCancelled ? 'Payment was cancelled.' : 'Payment failed. Please try again.'
                                )
                            );
                            eventSource.close();

                            setTimeout(() => {
                                const redirectPath = getFailureRedirectPath();
                                router.push(redirectPath);
                            }, 1500);
                        }
                        // Check for other unknown states
                        else {
                            const waitingStates = new Set([
                                'pending',
                                'processing',
                                'awaiting',
                                'awaiting_payment',
                                'initiated',
                                'created',
                                'in_progress',
                                'in-progress',
                            ]);

                            if (statusVal && !waitingStates.has(statusVal)) {
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                setStatus('failed');
                                setErrorMessage(getErrorMessage(data, 'Payment could not be completed.'));
                                eventSource.close();

                                setTimeout(() => {
                                    const redirectPath = getFailureRedirectPath();
                                    router.push(redirectPath);
                                }, 1500);
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing SSE data:', parseError);
                    }
                };

                eventSource.onerror = (error) => {
                    console.error('EventSource error:', error);
                    eventSource.close();

                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        setStatus('timeout');
                        setMessage('Taking longer than expected...');

                        setTimeout(() => {
                            const redirectPath = getTimeoutRedirectPath();
                            router.push(redirectPath);
                        }, 5000);
                    }
                };
            } catch (error) {
                console.error('EventSource not supported or failed:', error);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setStatus('timeout');
                setMessage('Taking longer than expected...');

                setTimeout(() => {
                    const redirectPath = getTimeoutRedirectPath();
                    router.push(redirectPath);
                }, 5000);
            }
        }, EVENT_SOURCE_DELAY);

        // Cleanup
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
    }, [session_id, event_key, router, authToken, getSuccessRedirectPath, getFailureRedirectPath, getTimeoutRedirectPath]);

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
        const redirectPath = getFailureRedirectPath();
        router.push(redirectPath);
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
                            {status === 'timeout' && (showTimeoutAsSuccess ? 'Payment Received' : 'Status Pending')}
                        </h4>

                        <p className="text-muted mb-4">
                            {status === 'pending' && 'Please wait while we confirm your payment.'}
                            {status === 'confirmed' && 'Redirecting to your booking summary...'}
                            {status === 'failed' && (
                                <>
                                    {errorMessage}
                                    <br />
                                    <small className="text-muted">Redirecting to your cart...</small>
                                </>
                            )}
                            {status === 'timeout' && showTimeoutAsSuccess && (
                                <>
                                    <span className="text-success fw-semibold">Don't worry!</span> Your payment has been processed successfully.
                                    <br />
                                    You will receive your tickets via WhatsApp, SMS & Email shortly.
                                    <br />
                                    <small>Redirecting to home page...</small>
                                </>
                            )}
                            {status === 'timeout' && !showTimeoutAsSuccess && (
                                <>
                                    <span className="text-warning fw-semibold">Wait a moment!</span> We are still confirming your booking status.
                                    <br />
                                    If your payment was successful, you will receive your tickets via WhatsApp shortly.
                                    <br />
                                    <small>Redirecting to your cart...</small>
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
                                {showTimeoutAsSuccess ? (
                                    <CheckCircle size={40} className="text-success mb-2" />
                                ) : (
                                    <Clock size={40} className="text-warning mb-2" />
                                )}
                                <p className="text-muted small mb-0">
                                    You can check your booking status in <strong>"My Bookings"</strong> soon.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons for failed status */}
                        {status === 'failed' && (
                            <div className="d-flex gap-3 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleViewBookings}
                                >
                                    View Bookings
                                </button>
                                <button
                                    type="button"
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

export default PaymentWaitingComponent;
