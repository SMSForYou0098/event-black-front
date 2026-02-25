import React, { useState, useCallback, useMemo } from 'react';
import { Image, Button, Dropdown, Row, Col } from 'react-bootstrap';
import {
  Film,
  Music,
  Calendar,
  Trophy,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Share2,
  MapPin,
  ChevronDown,
  IndianRupee,
  Armchair,
  AlertCircle,
  ArrowRightLeft
} from 'lucide-react';
import { useMyContext } from "@/Context/MyContextProvider";
import TicketDrawer from '../../../components/Tickets/TicketDrawer';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import CustomBtn from '../../../utils/CustomBtn';
import { MobileOnly, TabletAndDesktop, DesktopOnly } from "@/utils/ResponsiveRenderer";
import TransferBookingDrawer from './TransferBookingDrawer';

// Constants moved outside component to prevent recreation
const TYPE_CONFIG = {
  movie: { icon: Film, label: 'Movie' },
  concert: { icon: Music, label: 'Concert' },
  event: { icon: Calendar, label: 'Event' },
  sports: { icon: Trophy, label: 'Sports' }
};

const STATUS_CONFIG = {
  confirmed: { variant: 'outline-success', icon: CheckCircle },
  completed: { variant: 'outline-success', icon: CheckCircle },
  pending: { variant: 'outline-warning', icon: Clock },
  cancelled: { variant: 'outline-primary', icon: XCircle }
};

// Memoized TypeIcon component
const TypeIcon = React.memo(({ type, size = 16 }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.movie;
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
});

TypeIcon.displayName = 'TypeIcon';

const BookingCard = React.memo(({ booking, compact = false, onRefetch }) => {
  const [ticketData, setTicketData] = useState([]);
  const [ticketType, setTicketType] = useState({ id: '', type: '' });
  const [showTicketDrawer, setShowTicketDrawer] = useState(false);
  const [showTransferDrawer, setShowTransferDrawer] = useState(false);

  const { isMobile, formatDateRange, getCurrencySymbol } = useMyContext();

  // Memoized booking data normalization
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const bookingData = useMemo(() => {
    const normalizeBooking = booking?.bookings ? booking.bookings[0] : booking;
    const approvalStatus = booking?.approval_status || booking?.bookings?.[0]?.approval_status;
    // Check if any booking is scanned - for master bookings check all, for single check directly
    const isScanned = booking?.bookings
      ? booking.bookings.some(b => b.is_scanned === true)
      : (booking?.is_scanned === true);
    return {
      ticket: normalizeBooking?.ticket,
      quantity: booking?.bookings ? booking?.bookings?.length : 1,
      name: normalizeBooking?.event?.name,
      amount: booking?.total_amount,
      type: normalizeBooking?.type,
      created_at: formatDate(booking?.created_at),
      thumbnail: normalizeBooking?.event?.event_media?.thumbnail,
      ticketTransferEnabled: (normalizeBooking?.event?.event_controls?.ticket_transfer || normalizeBooking?.ticket?.event?.event_controls?.ticket_transfer) ?? false,
      isApprovalPending: approvalStatus === "pending",
      isScanned: isScanned,
      date_range: normalizeBooking?.event?.date_range,
      event_type: normalizeBooking?.event?.event_type,
    };
  }, [booking]);

  // Memoized handlers
  const handleTicketPreview = useCallback((type, id) => {
    setTicketData(booking);
    setTicketType({ id, type });
    setShowTicketDrawer(true);
  }, [booking]);

  const handleCloseDrawer = useCallback(() => {
    setTicketData([]);
    setTicketType({ id: '', type: '' });
    setShowTicketDrawer(false);
  }, []);

  // Handle dropdown item click - directly open ticket drawer
  const handleDownloadSelect = useCallback((type) => {
    handleTicketPreview(type, booking?.id);
  }, [handleTicketPreview, booking?.id]);

  // Check if individual option should be available
  const hasIndividualOption = booking?.bookings;

  // Memoized image dimensions
  const imageDimensions = useMemo(() => ({
    width: compact ? 60 : 80,
    height: compact ? 80 : 110,
  }), [compact]);

  return (
    <>
      <div className={`${compact ? 'p-3' : 'p-2 p-sm-4'} rounded custom-dark-content-bg rounded-4 h-100`}>
        <Row className="g-3">
          {/* Image and Button Column */}
          <Col xs="6" className="d-flex flex-column align-items-center gap-2">
            <Image
              src={bookingData?.thumbnail}
              alt={bookingData.ticket?.name}
              width={imageDimensions.width}
              height={imageDimensions.height}
              className="rounded-3 flex-shrink-0"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />

          </Col>

          {/* Content Column */}
          <Col xs="6" className="d-flex flex-column justify-content-start">
            <div className="d-flex align-items-center flex-wrap gap-1 gap-sm-2 mb-1">
              <TypeIcon type={bookingData.type} />
              <h6 className="mb-0 text-truncate" style={{ maxWidth: '100%' }}>
                {bookingData?.name}
              </h6>
              {!compact && (
                <CustomBadge
                  variant="outline-primary"
                  className="text-uppercase flex-shrink-0"
                >
                  {bookingData?.event_type}
                </CustomBadge>
              )}
            </div>

            <small className="text-muted d-block mt-1">
              <Calendar size={14} className='text-warning me-1' />
              <span className="text-break">{formatDateRange(bookingData?.date_range)}</span>
            </small>
            <small className="text-muted d-block mt-1">
              <Calendar size={14} className='text-warning me-1' /> Booked On:
              <span className="text-break">{formatDate(bookingData?.created_at)}</span>
            </small>

            <small className="text-muted d-block mt-1">
              <Armchair size={14} className='text-success me-1' />
              {bookingData.ticket?.name} x{' '}
              <span className="text-success fw-bold">{bookingData.quantity}</span>
            </small>

            <small className="text-muted d-block mt-1">
              <IndianRupee size={14} className='text-warning me-1' />
              {bookingData.amount}
            </small>
          </Col>


          <Col xs="6">
            {/* Transfer Button - Only show if ticket transfer is enabled, not pending approval, and not scanned */}
            {bookingData.ticketTransferEnabled && !bookingData.isApprovalPending && !bookingData.isScanned && (
              <Button
                variant="outline-primary"
                size="sm"
                className="p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-1 w-100"
                onClick={() => setShowTransferDrawer(true)}
              >
                <ArrowRightLeft size={14} />
                Transfer
              </Button>
            )}
          </Col>
          <Col xs="6">
            {!bookingData.isApprovalPending && (
              <Dropdown>
                <Dropdown.Toggle
                  as={Button}
                  variant="primary"
                  size="sm"
                  className="iq-button p-2 fw-bold rounded-3 d-inline-flex align-items-center justify-content-center gap-2 text-nowrap w-100"
                  style={{
                    background: 'var(--bs-primary)',
                    border: 'none',
                    lineHeight: 1.7,
                  }}
                  disabled={ticketType && ticketType.id === booking.id}
                >
                  Download
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="custom-dropdown-menu">
                  <Dropdown.Item
                    onClick={() => handleDownloadSelect('combine')}
                    disabled={ticketType && ticketType.id === booking.id}
                    className="custom-dropdown-item"
                  >
                    Group Ticket
                  </Dropdown.Item>

                  {hasIndividualOption && (
                    <Dropdown.Item
                      onClick={() => handleDownloadSelect('individual')}
                      disabled={ticketType && ticketType.id === booking.id}
                      className="custom-dropdown-item"
                    >
                      Single Ticket
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Col>
        </Row>
      </div>

      {/* Ticket Drawer */}
      <TicketDrawer
        show={showTicketDrawer}
        onClose={handleCloseDrawer}
        ticketType={ticketType}
        ticketData={ticketData}
        showTicketDetails={true}
      />

      {/* Transfer Drawer */}
      <TransferBookingDrawer
        show={showTransferDrawer}
        onHide={() => setShowTransferDrawer(false)}
        booking={booking}
        onTransferSuccess={onRefetch}
      />
    </>
  );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;