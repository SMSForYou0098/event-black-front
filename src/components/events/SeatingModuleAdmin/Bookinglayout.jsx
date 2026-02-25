'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { api } from '@/lib/axiosInterceptor';
import { useMyContext } from '@/Context/MyContextProvider';
import useBooking from '../SeatingModule/components/Usebooking';
import SeatingGrid from './components/SeatingGrid';

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

  const {
    selectedSeats,
    setSelectedSeats,
    sections,
    setSections,
    handleSeatClick,
  } = useBooking({
    maxSeats: 10,
    holdDuration: 600,
    autoHoldTimeout: true,
    event: event ?? null,
  });

  selectedSeatsRef.current = selectedSeats;

  // Same as SeatingModule/Bookinglayout: enforce per-ticket selection_limit (single-object selectedSeats)
  const handleSeatClickWithLimit = (seat, sectionId, rowId) => {
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
          return;
        }
      }
    }

    handleSeatClick(seat, sectionId, rowId);
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

  const handleRemoveSeat = () => setSelectedSeats([]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchLayoutData = async () => {
      if (!layoutId) return;
      setIsLoading(true);
      handleRemoveSeat();
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
              stage={stage}
              storageKey={layoutId ? `layout_${layoutId}` : undefined}
              scrollToSectionId={scrollToSectionId}
              scrollToRowTitle={scrollToRowTitle}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

BookingLayout.displayName = 'BookingLayout';
export default BookingLayout;
