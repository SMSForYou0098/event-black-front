'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';
import useBooking from '../SeatingModule/components/Usebooking';
import SeatingGrid from './components/SeatingGrid';
import StandingQuantityPicker from './components/StandingQuantityPicker';

function SeatingGridSkeleton() {
  return (
    <div className="custom-dark-bg rounded-3 overflow-hidden position-relative" style={{ minHeight: 400 }}>
      <div className="p-3 border-bottom border-secondary border-opacity-25" style={{ height: 40 }} />
      <div className="d-flex flex-column gap-3 p-4 align-items-center">
        {[1, 2, 3, 4].map((row) => (
          <div key={row} className="d-flex gap-2 justify-content-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded placeholder-glow"
                style={{ width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const BookingLayout = (props) => {
  const { layoutId, eventId, setSelectedTkts, event, cartItems, scrollToSectionId, scrollToRowTitle } = props;
  const { UserData, ErrorAlert } = useMyContext();
  const selectedSeatsRef = useRef(null);

  // Compute dynamic maxSeats from the highest selection_limit across all cart items
  const dynamicMaxSeats = useMemo(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 10;
    const limits = cartItems
      .map(t => parseInt(t.selection_limit, 10))
      .filter(n => Number.isFinite(n) && n >= 1);
    return limits.length > 0 ? Math.max(...limits) : 10;
  }, [cartItems]);

  const {
    selectedSeats,
    setSelectedSeats,
    sections,
    setSections,
    handleSeatClick,
  } = useBooking({
    maxSeats: dynamicMaxSeats,
    holdDuration: 600,
    autoHoldTimeout: true,
    event: event ?? null,
  });

  selectedSeatsRef.current = selectedSeats;

  // Same as SeatingModule/Bookinglayout: enforce per-ticket selection_limit (single-object selectedSeats).
  // Returns false when selection is rejected (e.g. limit reached) so SeatingGrid only centers on success.
  const handleSeatClickWithLimit = async (seat, sectionId, rowId) => {
    const current = selectedSeatsRef.current;
    const ticketId = seat.ticket?.id != null ? Number(seat.ticket.id) : null;
    const isAlreadySelected = (current?.seats || []).some((s) => s.seat_id === seat.id);
    if (!isAlreadySelected && ticketId && Array.isArray(cartItems) && cartItems.length) {
      const ticketConfig = cartItems.find((t) => Number(t.id) === ticketId);
      const limit = ticketConfig ? parseInt(ticketConfig.selection_limit, 10) : Infinity;
      if (Number.isFinite(limit) && limit >= 1) {
        const currentCountForTicket = current?.ticket_id === ticketId ? (current?.quantity || 0) : 0;
        if (currentCountForTicket >= limit) {
          const ticketName = ticketConfig?.name || 'this category';
          const message = `You can only select up to ${limit} ticket(s) for ${ticketName}.`;
          ErrorAlert(message);
          toast.error(message);
          return false;
        }
      }
    }

    await handleSeatClick(seat, sectionId, rowId);
    return true;
  };

  useEffect(() => {
    // Cart page expects itemId to resolve ticket in cartItems; old useBooking uses id/ticket_id
    const payload = selectedSeats?.ticket_id
      ? { ...selectedSeats, itemId: selectedSeats.ticket_id ?? selectedSeats.id }
      : selectedSeats;
    setSelectedTkts(payload);
  }, [selectedSeats, setSelectedTkts]);

  // SeatingGrid expects array of ticket entries; old useBooking uses single object
  const selectedSeatsForGrid = useMemo(
    () => (selectedSeats?.ticket_id ? [selectedSeats] : []),
    [selectedSeats]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [layoutData, setLayoutData] = useState(null);
  const [stage, setStage] = useState(null);

  // Standing section quantity picker state
  const [standingPicker, setStandingPicker] = useState({ show: false, section: null, ticket: null });

  const handleStandingSectionClick = useCallback((section, ticket) => {
    setStandingPicker({ show: true, section, ticket });
  }, []);

  const handleStandingConfirm = useCallback(({ section, ticket, quantity }) => {
    if (!ticket || quantity <= 0) return;

    const round = (n) => +Number(n ?? 0).toFixed(2);
    const ticketId = Number(ticket.id);
    const basePrice = parseFloat(ticket.price || 0);
    const baseAmount = round(basePrice);

    // Tax calculation (same logic as useBooking)
    const taxData = event?.tax_data || event?.taxData;
    const feeRaw = Number(taxData?.convenience_fee) || 0;
    const feeType = String(taxData?.type || '').toLowerCase();
    let convenienceFee = 0;
    if (feeType === 'percentage' || feeType === 'percent') {
      convenienceFee = round(baseAmount * (feeRaw / 100));
    } else if (['flat', 'fixed', 'amount'].includes(feeType)) {
      convenienceFee = round(feeRaw);
    }
    const centralGST = round(convenienceFee * 0.09);
    const stateGST = round(convenienceFee * 0.09);
    const totalTax = round(centralGST + stateGST + convenienceFee);
    const finalAmount = round(baseAmount + totalTax);

    // Build the ticket selection object (matches useBooking pattern)
    const totalBaseAmount = round(baseAmount * quantity);
    const totalCentralGST = round(centralGST * quantity);
    const totalStateGST = round(stateGST * quantity);
    const totalConvenienceFee = round(convenienceFee * quantity);
    const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
    const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

    const standingTicket = {
      id: ticketId,
      ticket_id: ticketId,
      category: ticket.name || 'Standing',
      ticket: ticket,
      quantity,
      seats: [],
      isStanding: true,
      sectionId: section.id,
      sectionName: section.name,
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
      subTotal: round(basePrice * quantity),
      grandTotal: totalFinalAmount,
    };

    setSelectedSeats(standingTicket);
    toast.success(`${quantity} ${ticket.name || 'standing'} ticket(s) selected`);
  }, [event, setSelectedSeats]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchLayoutData = async () => {
      if (!layoutId) return;
      setIsLoading(true);
      setSelectedSeats({});
      try {
        const response = await api.get(
          `layout/theatre/${layoutId}?eventId=${eventId}`,
          { signal: abortController.signal }
        );
        if (!isMounted) return;

        const data = response?.data?.data || response?.data;
        if (data?.stage) {
          setStage({
            ...data.stage,
            x: parseFloat(data.stage.x) || 0,
            y: parseFloat(data.stage.y) || 0,
            width: parseFloat(data.stage.width) || 800,
            height: parseFloat(data.stage.height) || 50,
          });
        }

        if (data?.sections && Array.isArray(data.sections)) {
          let seatStatus;
          const processedSections = data.sections.map((section) => ({
            ...section,
            x: parseFloat(section.x) || 0,
            y: parseFloat(section.y) || 0,
            width: parseFloat(section.width) || 600,
            height: parseFloat(section.height) || 250,
            rows: (section.rows || []).map((row) => ({
              ...row,
              numberOfSeats: parseInt(row.numberOfSeats, 10) || 0,
              curve: parseFloat(row.curve) || 0,
              spacing: parseFloat(row.spacing) || 40,
              seats: (row.seats || []).map((seat) => {
                seatStatus = seat.status || 'available';
                if (
                  seat.status === 'hold' &&
                  String(seat.hold_by) === String(UserData?.id)
                ) {
                  seatStatus = 'available';
                }
                return {
                  ...seat,
                  number: parseInt(seat.number, 10) || 0,
                  x: parseFloat(seat.x) || 0,
                  y: parseFloat(seat.y) || 0,
                  radius: parseFloat(seat.radius) || 12,
                  status: seatStatus,
                  ticket: seat.ticket || null,
                };
              }),
            })),
          }));
          setSections(processedSections);
        }

        setLayoutData(data);
        toast.success('Layout loaded successfully');
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!isMounted) return;
        console.error('Error fetching layout:', error);
        toast.error('Failed to load seating layout');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLayoutData();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [layoutId, eventId, UserData?.id, setSections]);

  if (isLoading) {
    return (
      <div className="rounded-4" style={{ width: '100%' }}>
        <SeatingGridSkeleton />
      </div>
    );
  }

  return (
    <div className="booking-layout">
      <Row>
        <Col>
          <div className="rounded-4" style={{ width: '100%' }}>
            <SeatingGrid
              sections={sections}
              selectedSeats={selectedSeatsForGrid}
              onSeatClick={handleSeatClickWithLimit}
              onStandingSectionClick={handleStandingSectionClick}
              stage={stage}
              storageKey={layoutId ? `layout_${layoutId}` : undefined}
              scrollToSectionId={scrollToSectionId}
              scrollToRowTitle={scrollToRowTitle}
            />
          </div>
        </Col>
      </Row>

      {/* Standing section quantity picker */}
      <StandingQuantityPicker
        show={standingPicker.show}
        onHide={() => setStandingPicker({ show: false, section: null, ticket: null })}
        section={standingPicker.section}
        ticket={standingPicker.ticket}
        onConfirm={handleStandingConfirm}
      />
    </div>
  );
};

BookingLayout.displayName = 'BookingLayout';
export default BookingLayout;
