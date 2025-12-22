import React, { useState, useCallback, useMemo } from 'react';
import { Card, Form, Button, Spinner, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { SearchIcon } from 'lucide-react';
import { getUserBookingsPaginated } from '@/services/events';
import { useDebounce } from '@/hooks/useDebounce';
import { useMyContext } from '@/Context/MyContextProvider';
import BookingCard from './BookingCard';
import GlassCard from './../../../utils/ProfileUtils/GlassCard';

// Constants
const DEBOUNCE_DELAY = 300;
const PER_PAGE = 15;
const FLATPICKR_OPTIONS = {
  mode: 'range',
  dateFormat: 'Y-m-d',
  allowInput: true,
  rangeSeparator: ' to ',
  disableMobile: true,
  placeholder: 'Select date range',
  static: true,
};

const BookingsTab = () => {
  const { UserData } = useMyContext();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // Format date range for API
  const formattedDateRange = useMemo(() => {
    if (!Array.isArray(dateRange) || dateRange.length !== 2) {
      return { startDate: '', endDate: '' };
    }

    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    return {
      startDate: formatDate(dateRange[0]),
      endDate: formatDate(dateRange[1]),
    };
  }, [dateRange]);

  // Infinite query for bookings
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['userBookings', UserData?.id, debouncedSearch, formattedDateRange.startDate, formattedDateRange.endDate],
    queryFn: ({ pageParam = 1 }) =>
      getUserBookingsPaginated({
        userId: UserData?.id,
        page: pageParam,
        perPage: PER_PAGE,
        search: debouncedSearch,
        startDate: formattedDateRange.startDate,
        endDate: formattedDateRange.endDate,
      }),
    getNextPageParam: (lastPage) => {
      // Check if there's a next page
      if (!lastPage?.pagination) return undefined;

      const { current_page, last_page } = lastPage.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    enabled: !!UserData?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true,
  });

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Trigger fetch when load more element is in view
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all bookings from all pages
  const allBookings = useMemo(() => {
    if (!data?.pages) return [];

    return data.pages.flatMap((page) => {
      // Handle different response structures
      return page?.bookings || page?.data || [];
    });
  }, [data]);

  // Deduplicate bookings by ID
  const uniqueBookings = useMemo(() => {
    const seen = new Set();
    const unique = [];

    for (const booking of allBookings) {
      const id = booking?.id || booking?.reference || booking?.booking_reference || booking?.bookingId;
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(booking);
      } else if (!id) {
        // If no ID, include it anyway (shouldn't happen in production)
        unique.push(booking);
      }
    }

    return unique;
  }, [allBookings]);

  // Handlers
  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleClearSearch = useCallback(() => setSearchTerm(''), []);
  const handleDateRangeChange = useCallback((dates) => setDateRange(dates || []), []);
  const handleClearDateRange = useCallback(() => setDateRange([]), []);
  const openSearchModal = useCallback(() => setShowSearchModal(true), []);
  const closeSearchModal = useCallback(() => setShowSearchModal(false), []);

  // Generate stable key for booking
  const makeBookingKey = useCallback((booking, idx) => {
    const id = booking?.id || booking?.reference || booking?.booking_reference || booking?.bookingId || idx;
    return `booking-${id}-${idx}`;
  }, []);

  // Render states
  const isEmpty = !isLoading && uniqueBookings.length === 0;
  const hasFilters = debouncedSearch || dateRange.length > 0;

  // Search controls
  const searchControls = useMemo(
    () => (
      <div className="d-flex align-items-center justify-content-between gap-2 w-100">
        <h6 className="mb-0">My Bookings</h6>

        {/* Date Range Picker */}
        <div style={{ minWidth: '200px', flexGrow: 1 }}>
          <Flatpickr
            value={dateRange}
            options={FLATPICKR_OPTIONS}
            placeholder="Select date range"
            onChange={handleDateRangeChange}
            className="form-control form-control-sm"
          />
        </div>

        {/* Search Icon */}
        <SearchIcon
          size={20}
          onClick={openSearchModal}
          style={{ cursor: 'pointer' }}
          aria-label="Open search"
        />
      </div>
    ),
    [dateRange, handleDateRangeChange, openSearchModal]
  );

  // Loading state
  if (isLoading) {
    return (
      <GlassCard>
        <Card.Header>{searchControls}</Card.Header>
        <Card.Body className="px-2 px-sm-4">
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" role="status" size="sm" className="me-2" />
            <span>Loading bookings...</span>
          </div>
        </Card.Body>
      </GlassCard>
    );
  }

  // Error state
  if (isError) {
    return (
      <GlassCard>
        <Card.Header>{searchControls}</Card.Header>
        <Card.Body className="px-2 px-sm-4">
          <div className="text-center text-danger py-4">
            <p>Error loading bookings: {error?.message || 'Unknown error'}</p>
            <Button variant="outline-primary" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card.Body>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <Card.Header className="d-flex justify-content-between align-items-center flex-column flex-sm-row gap-2">
        {searchControls}
      </Card.Header>

      <Card.Body className="px-2 px-sm-4">
        {/* Active Filters Display */}
        {hasFilters && (
          <div className="mb-3 d-flex flex-wrap gap-2">
            {debouncedSearch && (
              <span className="badge bg-primary d-inline-flex align-items-center gap-1">
                Search: {debouncedSearch}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: '0.6rem' }}
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                />
              </span>
            )}
            {dateRange.length === 2 && (
              <span className="badge bg-info d-inline-flex align-items-center gap-1">
                Date: {formattedDateRange.startDate} to {formattedDateRange.endDate}
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: '0.6rem' }}
                  onClick={handleClearDateRange}
                  aria-label="Clear date range"
                />
              </span>
            )}
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="text-center text-muted py-5">
            {hasFilters
              ? 'No bookings match your search criteria.'
              : 'No bookings found.'}
          </div>
        )}

        {/* Bookings Grid */}
        {!isEmpty && (
          <>
            <Row className="g-3">
              {uniqueBookings.map((booking, idx) => (
                <Col key={makeBookingKey(booking, idx)} xs={12} md={6} lg={4}>
                  <BookingCard booking={booking} />
                </Col>
              ))}
            </Row>

            {/* Load More Trigger */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="text-center py-4">
                {isFetchingNextPage ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" role="status" size="sm" className="me-2" />
                    <span>Loading more bookings...</span>
                  </div>
                ) : (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => fetchNextPage()}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}

            {/* End of List Indicator */}
            {!hasNextPage && uniqueBookings.length > 0 && (
              <div className="text-center text-muted py-3">
                <small>You've reached the end of your bookings</small>
              </div>
            )}
          </>
        )}
      </Card.Body>

      {/* Search Modal */}
      <Modal show={showSearchModal} onHide={closeSearchModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Search Bookings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup>
            <Form.Control
              autoFocus
              size="sm"
              type="text"
              placeholder="Search by event name, user name, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search bookings"
            />
            {searchTerm && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                ×
              </Button>
            )}
          </InputGroup>
          <div className="mt-2">
            <small className="text-muted">
              Search is debounced with {DEBOUNCE_DELAY}ms delay
            </small>
          </div>
        </Modal.Body>
      </Modal>
    </GlassCard>
  );
};

export default BookingsTab;