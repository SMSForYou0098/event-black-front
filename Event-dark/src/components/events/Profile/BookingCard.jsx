import React, { useState, useCallback, useMemo } from 'react';
import { Image, Button, Dropdown } from 'react-bootstrap';
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
  Armchair 
} from 'lucide-react';
import { useMyContext } from "@/Context/MyContextProvider";
import TicketModal from '../../../components/Tickets/TicketModal';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import CustomBtn from '../../../utils/CustomBtn';

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

  const { isMobile, formatDateRange, getCurrencySymbol } = useMyContext();

  // Memoized booking data normalization
  const bookingData = useMemo(() => {
    const normalizeBooking = booking?.bookings ? booking.bookings[0] : booking;
    return {
      ticket: normalizeBooking?.ticket,
      quantity: booking?.bookings ? booking?.bookings?.length : 1,
      name: normalizeBooking?.ticket?.event?.name,
      amount: normalizeBooking?.amount,
      type: normalizeBooking?.type,
      created_at: normalizeBooking?.created_at
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

  // Memoized image dimensions
  const imageDimensions = useMemo(() => ({
    width: compact ? 60 : 80,
    height: compact ? 80 : 110,
  }), [compact]);

  return (
    <>
      <div className={`d-flex align-items-center justify-content-between flex-column flex-sm-row ${compact ? 'mb-3 p-3' : 'mb-4 p-4'} rounded custom-dark-content-bg rounded-4`}>
        <div className="d-flex">
          <Image
            src={bookingData.ticket?.background_image}
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
                  variant="outline-secondary" 
                  className="text-uppercase"
                >
                  {bookingData.ticket?.event?.event_type}
                </CustomBadge>
              )}
            </div>
            
            <small className="text-muted d-block">
              <MapPin size={14} className='custom-text-secondary' /> 
              {bookingData.ticket?.event?.address}
            </small>
            
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
        
        <div className="btn-secttion d-flex">
          <div className="d-flex flex-row-reverse flex-sm-row gap-2 justify-content-end mt-2">
            {/* Custom Button with Dropdown */}
            <Dropdown>
              <Dropdown.Toggle
                as={Button}
                variant="primary"
                className="iq-button fw-bold rounded-3 mb-3 d-flex align-items-center gap-2"
                style={{ 
                  background: 'var(--bs-primary)', 
                  border: 'none',
                  padding: '0.5rem 1rem'
                }}
              >
                <span className="d-flex gap-2 align-items-center justify-content-center text-small">
                  Generate E-Ticket
                  {/* <ChevronDown size={14} /> */}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <li>
                  <Dropdown.Item
                    disabled={ticketType && ticketType.id === booking.id}
                    onClick={() => handleTicketPreview(booking, 'combine', booking?.id)}
                  >
                    Combine
                  </Dropdown.Item>
                </li>

                {booking?.bookings && (
                  <>
                    <Dropdown.Divider />
                    <li>
                      <Dropdown.Item
                        disabled={ticketType && ticketType.id === booking.id}
                        onClick={() => handleTicketPreview(booking, 'individual', booking?.id)}
                      >
                        Individual
                      </Dropdown.Item>
                    </li>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>

            <CustomBtn
              buttonText="Share"
              icon={<Share2 size={14} className="me-1" />}
              className="mb-3 btn-sm"
              variant="outline-secondary"
            />
          </div>
        </div>
      </div>
      
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
