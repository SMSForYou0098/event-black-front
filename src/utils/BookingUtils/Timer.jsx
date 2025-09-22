import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import { CustomHeader } from '../ModalUtils/CustomModalHeader';
import CustomBtn from '../CustomBtn';
import { useRouter } from 'next/router';
const Timer = ({ timestamp }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [showModal, setShowModal] = useState(false);

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
    const router =useRouter();
    const handleCloseModal = () => {
        setShowModal(false);
        router.push('/');
    };

    return (
        <>
            <div className="text-center">
                <div className="text-primary fw-bold d-flex align-items-center justify-content-center gap-2 mb-3">
                    <Clock size={20} />
                    <span>
                        Complete your booking within {formatTime(timeLeft)} Mins
                    </span>
                </div>

                {timeLeft === 0 && (
                    <div className="text-danger">
                        <span>Time expired!</span>
                    </div>
                )}
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <CustomHeader title="Time Expired" onClose={handleCloseModal} closable/>
                <Modal.Body className='p-4'>
                    <p>More than 10 minutes have passed here.</p>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Timer;