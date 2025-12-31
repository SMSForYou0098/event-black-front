import React, { useState, useEffect } from 'react';
import { Clock, ShoppingCart, Ticket } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { CustomHeader } from '../ModalUtils/CustomModalHeader';
import CustomBtn from '../CustomBtn';
import { useRouter } from 'next/router';
const Timer = ({ timestamp, onExpire, navigateOnExpire }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now();
            const startTime = parseInt(timestamp);
            const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
            const targetTime = startTime + tenMinutesInMs;
            const difference = targetTime - now;

            if (difference > 0) {
                return Math.floor(difference / 1000); // Convert to seconds
            }
            return 0;
        };

        const checkIfExpired = () => {
            const now = Date.now();
            const startTime = parseInt(timestamp);
            const timeDiff = now - startTime;
            const tenMinutesInMs = 10 * 60 * 1000;

            // If more than 10 minutes have passed since timestamp
            if (timeDiff > tenMinutesInMs) {
                setShowModal(true);
                if (!hasExpired && onExpire) {
                    // console.log('⏰ Timer expired - calling onExpire callback');
                    setHasExpired(true);
                    onExpire();
                }
                return true;
            }
            return false;
        };

        // Check if already expired
        if (checkIfExpired()) {
            setTimeLeft(0);
            return;
        }

        // Set initial time
        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            if (checkIfExpired()) {
                clearInterval(interval);
                setTimeLeft(0);
                return;
            }

            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (newTimeLeft <= 0) {
                if (!hasExpired && onExpire) {
                    setHasExpired(true);
                    onExpire();
                }
                clearInterval(interval);
                setShowModal(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timestamp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const router = useRouter();
    const handleCloseModal = () => {
        setShowModal(false);
        navigateOnExpire();
    };

    const isTimeRunningLow = timeLeft > 0 && timeLeft <= 60;
    return (
        <>
            <div className="text-center">
                <div
                    className={`fw-bold d-flex align-items-center justify-content-center gap-2 mb-3 ${timeLeft === 0
                        ? 'text-danger'
                        : isTimeRunningLow
                            ? 'text-warning'
                            : 'text-primary'
                        }`}
                    style={{
                        // 🔧 Add pulsing animation when time is running low
                        animation: isTimeRunningLow ? 'pulse 1s infinite' : 'none'
                    }}
                >
                    <Clock size={20} />
                    <span>
                        {timeLeft === 0
                            ? 'Time expired!'
                            : `Complete your booking within ${formatTime(timeLeft)} mins`
                        }
                    </span>
                </div>
            </div>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                backdrop="static" // 🔧 Prevent dismissal by clicking outside
                keyboard={false}  // 🔧 Prevent dismissal by pressing Esc
            >
                <CustomHeader
                    title="⏰ Session Expired"
                    onClose={handleCloseModal}
                    closable={false} // 🔧 Remove X button, force use of "Go Home" button
                />
                <Modal.Body className='p-4'>
                    {/* 🐛 BUG #9: Vague error message */}
                    {/* ❌ OLD: "More than 10 minutes have passed here." - unclear */}
                    {/* ✅ NEW: Clear, actionable message */}
                    <div className="text-center">
                        <p className="mb-3">
                            Your booking session has expired after 10 minutes of inactivity.
                        </p>
                        <p className="text-muted mb-0">
                            Please start a new booking to continue.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0 pt-0">
                    {/* 🔧 Make button more prominent */}
                    <CustomBtn
                        HandleClick={handleCloseModal}
                        className="px-4"
                        icon={<Ticket size={16} />}
                        buttonText="Go Cart"
                    />
                </Modal.Footer>
            </Modal >

            {/* 🔧 ADD: CSS for pulsing animation */}
            <style style jsx > {`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>
        </>
    );
};

export default Timer;