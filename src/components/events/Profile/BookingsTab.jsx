import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import BookingCard from './BookingCard';
import GlassCard from './../../../utils/ProfileUtils/GlassCard';

// Constants
const DEBOUNCE_DELAY = 300;
const FLATPICKR_OPTIONS = {
  mode: 'range',
  dateFormat: 'Y-m-d',
  allowInput: true,
  rangeSeparator: ' to ',
};

const BookingsTab = ({ userBookings = [], loading = false }) => {
  // UI & data state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const flatpickrRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Normalize bookings
  const normalizedBookings = useMemo(() => {
    return Array.isArray(userBookings) ? userBookings : [];
  }, [userBookings]);

  // Helper: convert various date strings to a Date or null
  const toDate = useCallback((raw) => {
    if (!raw) return null;
    if (raw instanceof Date) {
      return Number.isNaN(raw.getTime()) ? null : raw;
    }
    let s = String(raw).trim();

    // "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS"
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s)) {
      s = s.replace(/\s+/, 'T');
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  // Returns an array of Date objects found for a booking item (top-level and children)
  const getAllBookingDates = useCallback(
    (item) => {
      const dates = [];

      // top-level candidate fields
      const topCandidates = [
        item?.dates,
        item?.booking_date,
        item?.created_at,
        item?.date,
        item?.event_date,
      ];
      for (const c of topCandidates) {
        const d = toDate(c);
        if (d) dates.push(d);
      }

      // child bookings[] entries (MasterBooking style)
      if (Array.isArray(item?.bookings) && item.bookings.length > 0) {
        for (const b of item.bookings) {
          const childCandidates = [b?.dates, b?.created_at, b?.booking_date, b?.date];
          for (const c of childCandidates) {
            const d = toDate(c);
            if (d) dates.push(d);
          }
        }
      }

      return dates;
    },
    [toDate]
  );

  // Returns searchable strings for an item: checks top-level and child bookings[]
  const getSearchableText = useCallback((item) => {
    const pushAndLower = (v) => String(v ?? '').toLowerCase();

    // top-level values
    const eventNameTop = item?.ticket?.event?.name ?? item?.ticket?.event?.title ?? '';
    const userNameTop = item?.name ?? item?.user?.name ?? '';
    const userNumberTop = item?.number ?? item?.user?.number ?? item?.user?.phone ?? '';
    const ticketNameTop = item?.ticket?.name ?? '';

    // aggregate child bookings values (if present)
    let eventNameChildren = '';
    let userNameChildren = '';
    let userNumberChildren = '';
    let ticketNameChildren = '';

    if (Array.isArray(item?.bookings)) {
      for (const b of item.bookings) {
        eventNameChildren += ' ' + (b?.ticket?.event?.name ?? b?.ticket?.event?.title ?? '');
        userNameChildren += ' ' + (b?.name ?? b?.user?.name ?? '');
        userNumberChildren += ' ' + (b?.number ?? b?.user?.number ?? b?.user?.phone ?? '');
        ticketNameChildren += ' ' + (b?.ticket?.name ?? '');
      }
    }

    return {
      eventName: pushAndLower(eventNameTop + ' ' + eventNameChildren),
      userName: pushAndLower(userNameTop + ' ' + userNameChildren),
      userNumber: String(userNumberTop) + ' ' + String(userNumberChildren),
      ticketName: pushAndLower(ticketNameTop + ' ' + ticketNameChildren),
    };
  }, []);

  // Filtering function (handles top-level and child bookings)
  const filterBookings = useCallback(
    (term, dates) => {
      if (!Array.isArray(normalizedBookings) || normalizedBookings.length === 0) return [];

      let filtered = normalizedBookings;

      // Search term filter
      if (term?.trim()) {
        const searchValue = term.toLowerCase();
        filtered = filtered.filter((item) => {
          const s = getSearchableText(item);
          return (
            (s.eventName && s.eventName.includes(searchValue)) ||
            (s.userName && s.userName.includes(searchValue)) ||
            (String(s.userNumber) && String(s.userNumber).includes(searchValue)) ||
            (s.ticketName && s.ticketName.includes(searchValue))
          );
        });
      }

      // Date range filter - keep item if ANY of its candidate dates falls in range
      if (Array.isArray(dates) && dates.length === 2) {
        const startDate = new Date(dates[0]);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dates[1]);
        endDate.setHours(23, 59, 59, 999);

        filtered = filtered.filter((item) => {
          const candDates = getAllBookingDates(item); // array of Date objects
          if (!candDates || candDates.length === 0) return false;
          return candDates.some((bd) => bd >= startDate && bd <= endDate);
        });
      }

      return filtered;
    },
    [normalizedBookings, getSearchableText, getAllBookingDates]
  );

  // Memoized filtered bookings
  const filteredBookings = useMemo(() => filterBookings(searchTerm, dateRange), [
    filterBookings,
    searchTerm,
    dateRange,
  ]);

  // Debounced effect for filtering indicator
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setIsFiltering(true);
    debounceTimeoutRef.current = setTimeout(() => setIsFiltering(false), DEBOUNCE_DELAY);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, dateRange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  // --- Duplicate-key fix: stable unique keys & dedupe list ---

  // Create a stable key for a booking. Prefer DB id/reference + timestamp; fallback to idx.
  const makeBookingKey = useCallback((booking, idx) => {
    const idPart =
      booking?.id ??
      booking?.reference ??
      booking?.booking_reference ??
      booking?.bookingId ??
      booking?.order_id ??
      '';
    let timePart = '';
    const rawTime = booking?.created_at ?? booking?.booking_date ?? booking?.date ?? booking?.event_date;
    const t = toDate(rawTime);
    if (t) timePart = String(t.getTime());

    return `${idPart || 'no-id'}-${timePart || 'no-time'}-${idx}`;
  }, [toDate]);

  // Deduplicate filteredBookings by id/reference (keeps first occurrence)
  const uniqueFilteredBookings = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (let i = 0; i < filteredBookings.length; i++) {
      const b = filteredBookings[i];
      // choose a canonical unique key for dedupe:
      const dedupeKey =
        (b?.id ?? b?.reference ?? b?.booking_reference ?? b?.bookingId ?? b?.order_id) || JSON.stringify(b);
      if (!seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        out.push(b);
      } else {
        // Optional: uncomment to debug duplicates in console
        // console.warn('Duplicate booking skipped (dedupeKey):', dedupeKey, b);
      }
    }
    return out;
  }, [filteredBookings]);

  // Handlers
  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleClearSearch = useCallback(() => setSearchTerm(''), []);
  const handleDateRangeChange = useCallback((dates) => setDateRange(dates || []), []);
  const handleClearDateRange = useCallback(() => {
    setDateRange([]);
    if (flatpickrRef.current?.flatpickr) {
      try {
        flatpickrRef.current.flatpickr.clear();
      } catch (err) {
        /* ignore */
      }
    }
  }, []);

  // Memoize states
  const isLoading = loading || isFiltering;
  const isEmpty = uniqueFilteredBookings.length === 0;

  // Search controls
  const searchControls = useMemo(
    () => (
      <div className="d-flex gap-2 align-items-center" style={{ minWidth: 420 }}>
        <InputGroup style={{ minWidth: 220 }}>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Search by name, email, ticket, event, city, payment method..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search bookings"
          />
          {searchTerm && (
            <Button size="sm" variant="outline-secondary" onClick={handleClearSearch} aria-label="Clear search">
              ×
            </Button>
          )}
        </InputGroup>

        <div style={{ position: 'relative', minWidth: 200 }}>
          <Flatpickr
  ref={flatpickrRef}
  value={dateRange}
  options={FLATPICKR_OPTIONS}
  placeholder="Select date range"
  onChange={handleDateRangeChange}
/>

          {dateRange.length > 0 && (
            <Button
              size="sm"
              variant="link"
              className="position-absolute"
              style={{
                right: 4,
                top: 4,
                padding: '0.25rem 0.5rem',
                color: '#6c757d',
              }}
              onClick={handleClearDateRange}
              aria-label="Clear date range"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    ),
    [searchTerm, dateRange, handleSearchChange, handleClearSearch, handleDateRangeChange, handleClearDateRange]
  );

  // Booking cards render — use uniqueFilteredBookings and stable keys
  const bookingCards = useMemo(() => {
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center py-4">
          <Spinner animation="border" role="status" size="sm" className="me-2" />
          <span>Loading bookings...</span>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="text-center text-muted py-4">
          {searchTerm || dateRange.length > 0 ? 'No bookings match your search criteria.' : 'No bookings found.'}
        </div>
      );
    }

    return uniqueFilteredBookings.map((booking, idx) => (
      <BookingCard key={makeBookingKey(booking, idx)} booking={booking} />
    ));
  }, [uniqueFilteredBookings, isLoading, isEmpty, searchTerm, dateRange, makeBookingKey]);

  return (
    <GlassCard>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">My Bookings</h5>
        {searchControls}
      </Card.Header>

      <Card.Body className="px-0 px-sm-4">{bookingCards}</Card.Body>
    </GlassCard>
  );
};

export default BookingsTab;