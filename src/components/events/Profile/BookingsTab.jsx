import React, { useState, useCallback, useMemo } from 'react';
import { Card, Form, Button, Spinner, InputGroup, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { SearchIcon, X, Filter } from 'lucide-react';
import { getUserBookingsPaginated } from '@/services/events';
import { useDebounce } from '@/hooks/useDebounce';
import { useMyContext } from '@/Context/MyContextProvider';
import BookingCard from './BookingCard';
import GlassCard from './../../../utils/ProfileUtils/GlassCard';
import CustomBtn from '../../../utils/CustomBtn';

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

  // Modal & Temp States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [tempDateRange, setTempDateRange] = useState([]);

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
  // Handlers for Modal
  const handleOpenFilters = useCallback(() => {
    setTempSearchTerm(searchTerm);
    setTempDateRange(dateRange);
    setShowFilterModal(true);
  }, [searchTerm, dateRange]);

  const handleApplyFilters = useCallback(() => {
    setSearchTerm(tempSearchTerm);
    setDateRange(tempDateRange);
    setShowFilterModal(false);
  }, [tempSearchTerm, tempDateRange]);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setDateRange([]);
    setShowFilterModal(false);
  }, []);

  // Handlers for removing individual tags
  const clearSearchTerm = useCallback(() => setSearchTerm(''), []);
  const clearDateRange = useCallback(() => setDateRange([]), []);

  const handleTempDateRangeChange = useCallback((dates) => setTempDateRange(dates || []), []);

  // Generate stable key for booking
  const makeBookingKey = useCallback((booking, idx) => {
    const id = booking?.id || booking?.reference || booking?.booking_reference || booking?.bookingId || idx;
    return `booking-${id}-${idx}`;
  }, []);

  // Helper to format date for display
  const formatDateDisplay = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  // Render states
  const isEmpty = !isLoading && uniqueBookings.length === 0;
  const hasFilters = debouncedSearch || dateRange.length > 0;

  // Search controls
  // Header Controls (Filter Button + Active Tags)
  const searchControls = useMemo(
    () => (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">My Bookings</h6>
          <CustomBtn
            variant="primary"
            size="sm"
            HandleClick={handleOpenFilters}
            className="d-flex align-items-center gap-2"
            icon={<Filter size={16} />}
            btnText=""
          />
        </div>

        {/* Active Filters Display */}
        {(searchTerm || dateRange.length > 0) && (
          <div className="d-flex flex-wrap gap-2 mt-2">
            {searchTerm && (
              <Badge bg="light" text="dark" className="d-flex align-items-center gap-2 border fw-normal">
                Search: {searchTerm}
                <X
                  size={14}
                  className="cursor-pointer text-muted hover-text-dark"
                  onClick={clearSearchTerm}
                  style={{ cursor: 'pointer' }}
                />
              </Badge>
            )}
            {dateRange.length === 2 && (
              <Badge bg="light" text="dark" className="d-flex align-items-center gap-2 border fw-normal">
                Date: {formatDateDisplay(dateRange[0])} - {formatDateDisplay(dateRange[1])}
                <X
                  size={14}
                  className="cursor-pointer text-muted hover-text-dark"
                  onClick={clearDateRange}
                  style={{ cursor: 'pointer' }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    ),
    [searchTerm, dateRange, handleOpenFilters, clearSearchTerm, clearDateRange]
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
      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header className='p-3'>
          <Modal.Title className='fe-5'>Filter Bookings</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-3'>
          <Form>
            <Form.Group className="mb-3">
              <InputGroup>
                {/* <InputGroup.Text className="bg-dark">
                  <SearchIcon size={18} />
                </InputGroup.Text> */}
                <Form.Control
                  type="text"
                  placeholder="Event name, ID, etc."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              {/* <Form.Label>Date Range</Form.Label> */}
              <Flatpickr
                value={tempDateRange}
                options={{ ...FLATPICKR_OPTIONS, static: true }}
                placeholder="Select date range"
                onChange={handleTempDateRangeChange}
                className="form-control w-100"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <CustomBtn
            variant="secondary"
            HandleClick={handleClearAll}
            buttonText="Clear All"
            hideIcon={true}
            size='sm'
          />
          <CustomBtn
            variant="primary"
            HandleClick={handleApplyFilters}
            buttonText="Show Results"
            hideIcon={true}
            size='sm'
          />
        </Modal.Footer>
      </Modal>
    </GlassCard>
  );
};

export default BookingsTab;