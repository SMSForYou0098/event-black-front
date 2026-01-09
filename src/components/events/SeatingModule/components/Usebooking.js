import { useState, useCallback, useEffect, useRef } from 'react';
import {
  calculateTotalAmount,
  getTicketCategoryCounts,
  canSelectSeat,
  isMaxSeatsReached,
  validateBookingData
} from './Bookingutils';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

/**
 * Custom hook for managing booking state and logic
 * @param {Object} options - Configuration options
 * @param {Object} options.event - Event object with tax_data
 * @returns {Object} - Booking state and methods
 */
const useBooking = (options = {}) => {
  const {
    maxSeats = 10,
    holdDuration = 600, // 10 minutes in seconds
    autoHoldTimeout = true,
    event = null // Event data with tax_data
  } = options;

  // State
  const [selectedSeats, setSelectedSeats] = useState({});
  const [sections, setSections] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(holdDuration);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Ref to hold current selectedSeats value (avoids stale closure)
  const selectedSeatsRef = useRef(selectedSeats);

  // Keep ref in sync with state
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // Timer effect for seat hold
  useEffect(() => {
    if (!autoHoldTimeout) return;
    let interval;

    const hasSeats = selectedSeats?.quantity > 0;

    if (hasSeats && isTimerActive) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleClearSelection();
            toast.warning('Time expired! Please select seats again.');
            setIsTimerActive(false);
            return holdDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!hasSeats) {
      setTimeRemaining(holdDuration);
      setIsTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedSeats, isTimerActive, autoHoldTimeout, holdDuration]);

  // Start timer when first seat is selected
  useEffect(() => {
    if (selectedSeats?.quantity === 1 && !isTimerActive && autoHoldTimeout) {
      setIsTimerActive(true);
    }
  }, [selectedSeats?.quantity, isTimerActive, autoHoldTimeout]);

  /**
   * Handle seat selection/deselection
   */

  // Create a message key for seat selection updates
  const SEAT_MESSAGE_KEY = 'seat-selection-message';

  const updateSeatStatus = useCallback((sectionId, rowId, seatId, status) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            rows: section.rows.map(row =>
              row.id === rowId
                ? {
                  ...row,
                  seats: row.seats.map(seat =>
                    seat.id === seatId ? { ...seat, status } : seat
                  )
                }
                : row
            )
          }
          : section
      )
    );
  }, []);

  const handleSeatClick = useCallback(async (seat, sectionId, rowId) => {
    // Use ref to get current value (not stale closure)
    const currentSelectedSeats = selectedSeatsRef.current;
    const validation = canSelectSeat(seat);
    if (!validation.valid) {
      toast.warning(validation.reason);
      return;
    }

    const ticketId = parseInt(seat.ticket?.id);

    // Check if selecting from different ticket category
    if (currentSelectedSeats?.ticket_id && currentSelectedSeats.ticket_id !== ticketId) {
      const currentCategory = currentSelectedSeats.category;
      const newCategory = seat.ticket?.name || 'General';
      const currentSeatsCount = currentSelectedSeats.quantity;

      const result = await Swal.fire({
        title: 'Different Ticket Category',
        html: `You have <strong>${currentSeatsCount} seat${currentSeatsCount > 1 ? 's' : ''}</strong> selected from <strong>${currentCategory}</strong> category.<br><br>Selecting a seat from <strong>${newCategory}</strong> category will clear your current selection.<br><br>Do you want to continue?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Continue',
        cancelButtonText: 'No, Keep Current',
      });

      if (!result.isConfirmed) return;

      // Clear previous selections
      currentSelectedSeats.seats.forEach(s => {
        updateSeatStatus(s.section_id, s.row_id, s.seat_id, 'available');
      });

      setSelectedSeats({});
      selectedSeatsRef.current = {}; // Update ref immediately
      toast.info(`Switched to ${newCategory} category.`);
      // Don't return here - continue to select the new seat below
    }

    setSelectedSeats(prevSelectedSeats => {
      // Check if this specific seat is already selected
      const isSeatAlreadySelected = (prevSelectedSeats?.seats || []).some(s => s.seat_id === seat.id);

      // Calculate current total seats
      const currentTotalSeats = prevSelectedSeats?.quantity || 0;

      if (isSeatAlreadySelected) {
        // Deselect seat - remove this seat from seats array
        const updatedSeats = prevSelectedSeats.seats.filter(s => s.seat_id !== seat.id);

        // If no more seats, clear selection completely
        if (updatedSeats.length === 0) {
          updateSeatStatus(sectionId, rowId, seat.id, 'available');
          showSeatSelectionMessage(0);
          return {};
        }

        // Helper function for consistent rounding
        const round = (n) => +Number(n ?? 0).toFixed(2);

        // Recalculate totals based on new quantity
        const newQuantity = updatedSeats.length;
        updateSeatStatus(sectionId, rowId, seat.id, 'available');

        // Totals
        const totalBaseAmount = round(prevSelectedSeats.baseAmount * newQuantity);
        const totalCentralGST = round(prevSelectedSeats.centralGST * newQuantity);
        const totalStateGST = round(prevSelectedSeats.stateGST * newQuantity);
        const totalConvenienceFee = round(prevSelectedSeats.convenienceFee * newQuantity);
        const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
        const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

        const updatedTicket = {
          ...prevSelectedSeats,
          quantity: newQuantity,
          seats: updatedSeats,
          totalBaseAmount,
          totalCentralGST,
          totalStateGST,
          totalTaxTotal,
          totalConvenienceFee,
          totalFinalAmount,
          subTotal: round(prevSelectedSeats.price * newQuantity),
          grandTotal: totalFinalAmount,
        };

        showSeatSelectionMessage(newQuantity);
        return updatedTicket;
      } else {
        // Check max seats limit
        if (isMaxSeatsReached(currentTotalSeats, maxSeats)) {
          toast.warning(`Maximum ${maxSeats} seats allowed`);
          return prevSelectedSeats;
        }

        // Get section and row info
        const section = sections.find(s => s.id === sectionId);
        const row = section?.rows.find(r => r.id === rowId);

        if (!section || !row) {
          toast.error('Invalid section or row');
          return prevSelectedSeats;
        }

        // Helper function for consistent rounding
        const round = (n) => +Number(n ?? 0).toFixed(2);

        // Get ticket price - Per-unit base
        const basePrice = parseFloat(seat.ticket?.price || 0);
        const baseAmount = round(basePrice);

        // Get tax data from event (support both property names)
        const taxData = event?.tax_data || event?.taxData;

        // Convenience Fee calculation
        const feeRaw = Number(taxData?.convenience_fee) || 0;
        const feeType = String(taxData?.type || "").toLowerCase();

        let convenienceFee = 0;
        if (feeType === "percentage" || feeType === "percent") {
          convenienceFee = round(baseAmount * (feeRaw / 100));
        } else if (["flat", "fixed", "amount"].includes(feeType)) {
          convenienceFee = round(feeRaw);
        } else {
          convenienceFee = 0;
        }

        // GST calculation
        const centralGST = round(convenienceFee * 0.09);
        const stateGST = round(convenienceFee * 0.09);
        const totalTax = round(centralGST + stateGST + convenienceFee);
        const finalAmount = round(baseAmount + totalTax);

        // Create seat info
        const seatInfo = {
          seat_id: seat.id,
          seat_name: `${row.title}${seat.number}`,
          ticket_id: ticketId,
          section_id: sectionId,
          row_id: rowId,
          sectionName: section.name,
          rowTitle: row.title,
          number: seat.number
        };

        if (prevSelectedSeats?.ticket_id) {
          // Ticket already exists - add seat to its seats array
          const newQuantity = prevSelectedSeats.quantity + 1;
          const updatedSeats = [...prevSelectedSeats.seats, seatInfo];

          // Totals
          const totalBaseAmount = round(prevSelectedSeats.baseAmount * newQuantity);
          const totalCentralGST = round(prevSelectedSeats.centralGST * newQuantity);
          const totalStateGST = round(prevSelectedSeats.stateGST * newQuantity);
          const totalConvenienceFee = round(prevSelectedSeats.convenienceFee * newQuantity);
          const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
          const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

          const updatedTicket = {
            ...prevSelectedSeats,
            quantity: newQuantity,
            seats: updatedSeats,
            totalBaseAmount,
            totalCentralGST,
            totalStateGST,
            totalTaxTotal,
            totalConvenienceFee,
            totalFinalAmount,
            subTotal: round(prevSelectedSeats.price * newQuantity),
            grandTotal: totalFinalAmount,
          };

          updateSeatStatus(sectionId, rowId, seat.id, 'selected');
          showSeatSelectionMessage(newQuantity);
          return updatedTicket;
        } else {
          // New ticket - create new object
          const totalBaseAmount = round(baseAmount * 1);
          const totalCentralGST = round(centralGST * 1);
          const totalStateGST = round(stateGST * 1);
          const totalConvenienceFee = round(convenienceFee * 1);
          const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
          const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

          const newTicket = {
            id: ticketId,
            ticket_id: ticketId,
            category: seat.ticket?.name || 'General',
            ticket: seat.ticket,
            quantity: 1,
            seats: [seatInfo],
            price: round(basePrice),
            baseAmount,
            centralGST,
            stateGST,
            convenienceFee,
            totalTax,
            finalAmount,
            totalBaseAmount,
            totalCentralGST,
            totalStateGST,
            totalConvenienceFee,
            totalTaxTotal,
            totalFinalAmount,
            subTotal: round(basePrice * 1),
            grandTotal: totalFinalAmount,
          };

          updateSeatStatus(sectionId, rowId, seat.id, 'selected');
          showSeatSelectionMessage(1);
          return newTicket;
        }
      }
    });
  }, [sections, maxSeats, event, updateSeatStatus]);

  /**
   * Shows a single updating message for seat selection
   * Uses the same key to update existing message instead of creating new ones
   */
  const showSeatSelectionMessage = (totalSeats) => {
    if (totalSeats === 0) {
      // Dismiss the message when no seats selected
      toast.dismiss(SEAT_MESSAGE_KEY);
      return;
    }

    const seatText = totalSeats === 1 ? 'seat' : 'seats';

    toast.success({
      content: `${totalSeats} ${seatText} selected`,
      key: SEAT_MESSAGE_KEY,
      duration: 2, // Auto-close after 2 seconds of inactivity
    });
  };





  /**
   * Remove specific seat from selection
   */
  const handleRemoveSeat = useCallback((seatId, sectionId, rowId) => {
    if (!selectedSeats?.ticket_id) return;

    const updatedSeats = selectedSeats.seats.filter(s => s.seat_id !== seatId);

    if (updatedSeats.length === 0) {
      setSelectedSeats({});
    } else {
      // Helper function for consistent rounding
      const round = (n) => +Number(n ?? 0).toFixed(2);

      const newQuantity = updatedSeats.length;

      // Totals
      const totalBaseAmount = round(selectedSeats.baseAmount * newQuantity);
      const totalCentralGST = round(selectedSeats.centralGST * newQuantity);
      const totalStateGST = round(selectedSeats.stateGST * newQuantity);
      const totalConvenienceFee = round(selectedSeats.convenienceFee * newQuantity);
      const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
      const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

      setSelectedSeats({
        ...selectedSeats,
        quantity: newQuantity,
        seats: updatedSeats,
        totalBaseAmount,
        totalCentralGST,
        totalStateGST,
        totalTaxTotal,
        totalConvenienceFee,
        totalFinalAmount,
        // convenience fields
        subTotal: round(selectedSeats.price * newQuantity),
        grandTotal: totalFinalAmount,
      });
    }

    updateSeatStatus(sectionId, rowId, seatId, 'available');
    toast.success('Seat removed');
  }, [selectedSeats, updateSeatStatus]);




  const handleClearSelection = useCallback(() => {
    if (!selectedSeats?.ticket_id) return;

    selectedSeats.seats.forEach(seat => {
      updateSeatStatus(seat.section_id, seat.row_id, seat.seat_id, 'available');
    });
    setSelectedSeats({});
    setTimeRemaining(holdDuration);
    setIsTimerActive(false);

    toast.info('Selection cleared');
  }, [selectedSeats, updateSeatStatus, holdDuration]);

  /**
   * Get total amount
   */
  const getTotalAmount = useCallback(() => {
    if (!selectedSeats?.ticket_id) return calculateTotalAmount([]);
    return calculateTotalAmount([selectedSeats]);
  }, [selectedSeats]);

  /**
   * Get ticket category counts
   */
  const getTicketCounts = useCallback(() => {
    if (!selectedSeats?.ticket_id) return getTicketCategoryCounts([]);
    return getTicketCategoryCounts([selectedSeats]);
  }, [selectedSeats]);

  /**
   * Validate booking before submission
   */
  const validateBooking = useCallback((customerData) => {
    const bookingData = {
      ...customerData,
      seats: selectedSeats?.ticket_id ? [selectedSeats] : [],
      totalAmount: getTotalAmount()
    };

    return validateBookingData(bookingData);
  }, [selectedSeats, getTotalAmount]);

  /**
   * Mark selected seats as booked (after successful booking)
   */
  const markSeatsAsBooked = useCallback(() => {
    if (!selectedSeats?.ticket_id) return;

    selectedSeats.seats.forEach(seat => {
      updateSeatStatus(seat.section_id, seat.row_id, seat.seat_id, 'booked');
    });
    setSelectedSeats({});
    setTimeRemaining(holdDuration);
    setIsTimerActive(false);
  }, [selectedSeats, updateSeatStatus, holdDuration]);

  /**
   * Reset timer
   */
  const resetTimer = useCallback(() => {
    setTimeRemaining(holdDuration);
    if (selectedSeats?.ticket_id) {
      setIsTimerActive(true);
    }
  }, [holdDuration, selectedSeats]);

  /**
   * Extend timer (if user needs more time)
   */
  const extendTimer = useCallback((additionalSeconds = 300) => {
    setTimeRemaining(prev => prev + additionalSeconds);
    toast.success(`Timer extended by ${Math.floor(additionalSeconds / 60)} minutes`);
  }, []);

  /**
   * Check if a specific seat is selected
   */
  const isSeatSelected = useCallback((seatId) => {
    if (!selectedSeats?.ticket_id) return false;
    return selectedSeats.seats.some(seat => seat.seat_id === seatId);
  }, [selectedSeats]);

  /**
   * Get selected seats count
   */
  const getSelectedSeatsCount = useCallback(() => {
    return selectedSeats?.quantity || 0;
  }, [selectedSeats]);

  /**
   * Check if max seats reached
   */
  const isMaxLimitReached = useCallback(() => {
    const count = selectedSeats?.quantity || 0;
    return isMaxSeatsReached(count, maxSeats);
  }, [selectedSeats, maxSeats]);

  return {
    // State
    selectedSeats,
    sections,
    timeRemaining,
    isTimerActive,

    // Setters
    setSections,
    setSelectedSeats,

    // Methods
    handleSeatClick,
    handleRemoveSeat,
    handleClearSelection,
    getTotalAmount,
    getTicketCounts,
    validateBooking,
    markSeatsAsBooked,
    resetTimer,
    extendTimer,
    isSeatSelected,
    getSelectedSeatsCount,
    isMaxLimitReached,

    // Configuration
    maxSeats,
    holdDuration
  };
};

export default useBooking;