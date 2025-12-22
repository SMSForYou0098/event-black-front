import React, { useState, useCallback, useMemo } from 'react';
import { Image, Button, Dropdown, Alert } from 'react-bootstrap';
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
  AlertCircle
} from 'lucide-react';
import { useMyContext } from "@/Context/MyContextProvider";
import TicketModal from '../../../components/Tickets/TicketModal';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import CustomBtn from '../../../utils/CustomBtn';
import CustomDrawer from '../../../utils/CustomDrawer';

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

const BookingCard = React.memo(({ booking, compact = false }) => {
  const [ticketData, setTicketData] = useState([]);
  const [ticketType, setTicketType] = useState({ id: '', type: '' });
  const [show, setShow] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [pendingDownloadType, setPendingDownloadType] = useState('');

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
    return {
      ticket: normalizeBooking?.ticket,
      quantity: booking?.bookings ? booking?.bookings?.length : 1,
      name: normalizeBooking?.ticket?.event?.name,
      amount: booking?.total_amount,
      type: normalizeBooking?.type,
      created_at: formatDate(booking?.created_at),
      thumbnail: normalizeBooking?.ticket?.event?.eventMedia?.thumbnail
    };
  }, [booking]);

  // Memoized handlers
  const handleTicketPreview = useCallback((item, type, id) => {
    setTicketData(item);
    setTicketType({ id, type });
    setShow(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setTicketData([]);
    setTicketType({ id: '', type: '' });
    setShow(false);
  }, []);

  // Handle dropdown item click - Show drawer first
  const handleDownloadSelect = useCallback((type) => {
    setPendingDownloadType(type);
    setShowDrawer(true);
  }, []);

  // Confirm download after reading drawer info
  const handleConfirmDownload = useCallback(() => {
    setShowDrawer(false);

    if (pendingDownloadType === 'combine') {
      handleTicketPreview(booking, 'combine', booking?.id);
    } else if (pendingDownloadType === 'individual') {
      handleTicketPreview(booking, 'individual', booking?.id);
    }
  }, [pendingDownloadType, booking, handleTicketPreview]);

  // Cancel download
  const handleCancelDownload = useCallback(() => {
    setShowDrawer(false);
    setPendingDownloadType('');
  }, []);

  // Check if individual option should be available - EXACT SAME LOGIC AS FIRST COMPONENT
  const hasIndividualOption = booking?.bookings;

  // Memoized image dimensions
  const imageDimensions = useMemo(() => ({
    width: compact ? 60 : 80,
    height: compact ? 80 : 110,
  }), [compact]);

  // Drawer content
  const drawerContent = useMemo(() => (
    <div className="p-3">

      {pendingDownloadType === 'individual' && (
        <>
          <h6 className="alert-heading mb-2 mt-3">Individual QR Codes</h6>
          <p className="mb-0">
            If you select individual QR, each attendee receives a personal QR code for entry,
            and group QRs won't work.
          </p>
        </>
      )}

      {pendingDownloadType === 'combine' && (
        <>
          <h6 className="alert-heading mb-2 mt-3">Group QR Code</h6>
          <p className="mb-0">
            If you select group QR, all attendees must arrive together and show the group QR
            at the venue for entry. Individual QRs will not work.
          </p>
        </>
      )}

      <div className="d-flex gap-2 mt-4">
        <CustomBtn
          buttonText='Ok'
          variant="primary"
          size="sm"
          className="flex-grow-1"
          HandleClick={handleConfirmDownload}
        />


      </div>
    </div>
  ), [pendingDownloadType, handleConfirmDownload, handleCancelDownload]);

  return (
    <>
      <div className={`d-flex align-items-center justify-content-between flex-column flex-sm-row ${compact ? 'mb-3 p-3' : 'mb-4 p-4'} rounded custom-dark-content-bg rounded-4`}>
        <div className="d-flex">
          <Image
            src={bookingData.thumbnail}
            alt={bookingData.ticket?.name}
            width={imageDimensions.width}
            height={imageDimensions.height}
            className="rounded-3 me-3"
            style={{ objectFit: 'cover' }}
            loading="lazy"
          />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <TypeIcon type={bookingData.type} />
              <h6 className={`mb-0 ms-2 ${!compact && 'me-3'}`}>
                {bookingData?.name}
              </h6>
              {!compact && (
                <CustomBadge
                  variant="outline-primary"
                  className="text-uppercase"
                >
                  {bookingData.ticket?.event?.event_type}
                </CustomBadge>
              )}
            </div>

            {/* <small className="text-muted d-block">
              <MapPin size={14} className='custom-text-secondary' /> 
              {bookingData.ticket?.event?.address}
            </small> */}

            <small className="text-muted d-block">
              <Calendar size={14} className='text-warning' />
              {bookingData.ticket?.event?.date_range} • {bookingData.created_at}
            </small>

            <small className="text-muted d-block">
              <Armchair size={14} className='text-success' />
              : {bookingData.ticket?.name} x{' '}
              <span className="text-success fw-bold">{bookingData.quantity}</span>
            </small>

            <small className="text-muted d-block">
              <IndianRupee size={14} className='text-warning' />
              : {bookingData.amount}
            </small>
          </div>
        </div>

        <div className="btn-section d-flex">
          <div className="d-flex flex-row-reverse flex-sm-row gap-2 justify-content-end mt-2">
            {/* Dropdown for Download Options */}
            <Dropdown>
              <Dropdown.Toggle
                as={Button}
                variant="primary"
                size="sm"
                className="iq-button fw-bold rounded-3 d-inline-flex align-items-center gap-2 text-nowrap"
                style={{
                  background: 'var(--bs-primary)',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
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
                  Group QR
                </Dropdown.Item>

                {hasIndividualOption && (
                  <Dropdown.Item
                    onClick={() => handleDownloadSelect('individual')}
                    disabled={ticketType && ticketType.id === booking.id}
                    className="custom-dropdown-item"
                  >
                    Individual QR
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

      </div>

      {/* Custom Drawer for Download Information */}
      <CustomDrawer
        title="Important Information"
        showOffcanvas={showDrawer}
        setShowOffcanvas={setShowDrawer}
      >
        {drawerContent}
      </CustomDrawer>

      {/* Ticket Modal */}
      <TicketModal
        show={show}
        handleCloseModal={handleCloseModal}
        ticketType={ticketType}
        ticketData={ticketData}
        isAccreditation={ticketData?.type === 'AccreditationBooking'}
        showTicketDetails={ticketData?.type === 'AccreditationBooking'}
        formatDateRange={formatDateRange}
      />
    </>
  );
});

BookingCard.displayName = 'BookingCard';

export default BookingCard;
