// ============================================
// EventSeatsListener Component
// Listens to event-seats WebSocket channel and updates seat status in real-time
// ============================================

import { useEffect, useRef } from 'react';
import echo from '@/services/reverb';
import { useMyContext } from "@/Context/MyContextProvider";

/**
 * Component that listens to event-seats channel and updates seat status in UI
 * 
 * @param {object} props
 * @param {number|string} props.eventId - The event ID to listen to
 * @param {Array} props.sections - Sections state array
 * @param {Function} props.setSections - Function to update sections state
 * @param {object} props.selectedSeats - Currently selected seats object
 * @param {Function} props.setSelectedSeats - Function to update selected seats
 * @param {number|string} props.currentUserId - Current user ID to filter out self-triggered updates
 */
const EventSeatsListener = ({ eventId, sections, setSections, selectedSeats, setSelectedSeats, currentUserId }) => {
    const channelRef = useRef(null);
    const { ErrorAlert } = useMyContext()
    useEffect(() => {
        // Don't listen if no eventId or sections
        if (!eventId || !sections || !setSections) {
            return;
        }

        // Don't run on server or if echo is not initialized
        if (!echo) {
            console.warn('Echo not initialized (likely SSR). Skipping WebSocket connection.');
            return;
        }

        const channelName = `event-seats.${eventId}`;
        console.log(`🎫 Listening to event-seats channel: ${channelName}`);

        // Get the channel
        const channel = echo.channel(channelName);

        // Listen to seat status updates
        channel.listen('.seat.status.updated', (data) => {
            console.log('📡 Seat update received:', data);
            console.log('🔍 Triggering user ID:', data.triggeringUserId, 'My ID:', currentUserId);

            if (Number(data.triggeringUserId) === Number(currentUserId)) {
                console.log("Ignoring update triggered by me");
                return;
            }

            if (!data || !data.seatIds || !Array.isArray(data.seatIds) || !data.status) {
                console.warn('Invalid seat update data:', data);
                return;
            }

            // Backend sends numeric IDs, add "seat_" prefix to match DB format
            const seatIds = data.seatIds.map(seatId => {
                const idStr = String(seatId).trim();
                return idStr.startsWith('seat_') ? idStr : `seat_${idStr}`;
            });

            console.log('🔍 Seat IDs from socket:', seatIds, 'Status:', data.status);

            // Check if any of the locked seats are in current user's selection
            if ((data.status === 'locked' || data.status === 'hold' || data.status === 'booked') && selectedSeats?.seats && setSelectedSeats) {
                const selectedSeatIds = selectedSeats.seats.map(s => s.seat_id);
                const conflictingSeats = seatIds.filter(id => selectedSeatIds.includes(id));

                if (conflictingSeats.length > 0) {
                    // Remove conflicting seats from selection
                    const removedSeatLabels = [];

                    // Get seat labels for the message
                    sections.forEach(section => {
                        section.rows.forEach(row => {
                            row.seats.forEach(seat => {
                                if (conflictingSeats.includes(seat.id)) {
                                    removedSeatLabels.push(`${row.title}${seat.number}`);
                                }
                            });
                        });
                    });

                    // Update selectedSeats to remove conflicting seats
                    setSelectedSeats(prevSeats => {
                        if (!prevSeats?.seats) return prevSeats;

                        const filteredSeats = prevSeats.seats.filter(
                            s => !conflictingSeats.includes(s.seat_id)
                        );

                        // Recalculate totals
                        const newQuantity = filteredSeats.length;
                        const newSubTotal = filteredSeats.reduce((sum, s) => sum + (s.price || 0), 0);

                        return {
                            ...prevSeats,
                            seats: filteredSeats,
                            quantity: newQuantity,
                            subTotal: newSubTotal
                        };
                    });

                    // Show toast message
                    const statusText = data.status === 'booked' ? 'booked' : 'locked';
                    ErrorAlert(
                        // `Seat${conflictingSeats.length > 1 ? 's' : ''} ${removedSeatLabels.join(', ')} ${conflictingSeats.length > 1 ? 'have' : 'has'} been ${statusText} by another user.`,
                        `Seat${conflictingSeats.length > 1 ? 's' : ''} ${removedSeatLabels.join(', ')} no longer available`,
                        { autoClose: 5000 }
                    );
                }
            }

            // Update sections state based on status
            if (data.status === 'booked' || data.status === 'reserved') {
                // Mark as booked (removes hold)
                setSections(prevSections =>
                    prevSections.map(section => ({
                        ...section,
                        rows: section.rows.map(row => ({
                            ...row,
                            seats: row.seats.map(seat => {
                                if (seatIds.includes(seat.id)) {
                                    return {
                                        ...seat,
                                        status: 'booked',
                                        hold_by: null
                                    };
                                }
                                return seat;
                            })
                        }))
                    }))
                );
            } else if (data.status === 'locked' || data.status === 'hold') {
                // Update to hold status with hold_by user ID
                setSections(prevSections =>
                    prevSections.map(section => ({
                        ...section,
                        rows: section.rows.map(row => ({
                            ...row,
                            seats: row.seats.map(seat => {
                                if (seatIds.includes(seat.id)) {
                                    return {
                                        ...seat,
                                        status: 'hold',
                                        hold_by: data.triggeringUserId ? String(data.triggeringUserId) : null
                                    };
                                }
                                return seat;
                            })
                        }))
                    }))
                );
            } else if (data.status === 'available' || data.status === 'unlocked') {
                // Update to available (removes hold_by)
                setSections(prevSections =>
                    prevSections.map(section => ({
                        ...section,
                        rows: section.rows.map(row => ({
                            ...row,
                            seats: row.seats.map(seat => {
                                if (seatIds.includes(seat.id)) {
                                    return {
                                        ...seat,
                                        status: 'available',
                                        hold_by: null
                                    };
                                }
                                return seat;
                            })
                        }))
                    }))
                );
            }

            console.log(`✅ Updated ${seatIds.length} seat(s) to status: ${data.status}`);
        });

        channelRef.current = channel;

        // Cleanup
        return () => {
            if (channelRef.current) {
                console.log(`🔌 Leaving event-seats channel: ${channelName}`);
                channelRef.current.stopListening('.seat.status.updated');
                echo.leaveChannel(channelName);
                channelRef.current = null;
            }
        };
    }, [eventId, sections, setSections, selectedSeats, setSelectedSeats, currentUserId]);

    // This component doesn't render anything
    return null;
};

export default EventSeatsListener;

