import React, { useState, useCallback, useMemo } from 'react';
import { Card, Form, Button, Spinner, InputGroup, Row, Col } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { SearchIcon, X } from 'lucide-react';
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
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 w-100">
        <h6 className="mb-0 text-nowrap">My Bookings</h6>

        <div className="d-flex flex-column flex-sm-row gap-2 w-100 justify-content-end">
          {/* Search Input */}
          <div style={{ flexGrow: 1, maxWidth: '400px' }}>
            <InputGroup size='sm'>
              <InputGroup.Text className="border-end-0 bg-dark">
                <SearchIcon size={16} className="text-light" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border-0 shadow-none ps-0"
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  className="border-0 bg-dark"
                  onClick={handleClearSearch}
                >
                  <X size={16} />
                </Button>
              )}
            </InputGroup>
          </div>

          {/* Date Range Picker */}
          <div style={{ minWidth: '220px' }}>
            <Flatpickr
              value={dateRange}
              options={FLATPICKR_OPTIONS}
              placeholder="Select date range"
              onChange={handleDateRangeChange}
              className="form-control form-control-sm"
            />
          </div>
        </div>
      </div>
    ),
    [dateRange, searchTerm, handleDateRangeChange, handleSearchChange, handleClearSearch]
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
      <Card.Header>
        {searchControls}
      </Card.Header>

      <Card.Body className="px-2 px-sm-4">


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
    </GlassCard>
  );
};

export default BookingsTab;