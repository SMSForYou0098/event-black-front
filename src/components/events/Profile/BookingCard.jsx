import React, { useState, useCallback, useMemo } from 'react';
import { Image, Button, OverlayTrigger, Popover } from 'react-bootstrap';
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
  Star, 
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

// Memoized ticket popover component
const TicketPopover = React.memo(({ 
  booking, 
  ticketType, 
  onTicketPreview, 
  onClosePopover 
}) => (
  <Popover id="ticket-popover">
    <Popover.Body className='p-2'>
      <ul className="list-unstyled mb-0">
        <li>
          <Button
            variant="link"
            className="text-small rounded-3 w-100 text-start py-1 my-1 text-capitalize text-light text-decoration-none bg-primary"
            disabled={ticketType?.id === booking.id}
            onClick={() => {
              onTicketPreview(booking, 'combine', booking?.id);
              onClosePopover();
            }}
          >
            Combine
          </Button>
        </li>
        {booking?.bookings && (
          <li>
            <Button
              variant="link"
              className="text-small rounded-3 w-100 text-start py-1 my-1 text-capitalize text-light text-decoration-none bg-primary"
              disabled={ticketType?.id === booking.id}
              onClick={() => {
                onTicketPreview(booking, 'individual', booking?.id);
                onClosePopover();
              }}
            >
              Individual
            </Button>
          </li>
        )}
      </ul>
    </Popover.Body>
  </Popover>
));

TicketPopover.displayName = 'TicketPopover';

const BookingCard = React.memo(({ booking, compact = false }) => {
  const [ticketData, setTicketData] = useState([]);
  const [showPopover, setShowPopover] = useState(false);
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

  const handleClosePopover = useCallback(() => {
    setShowPopover(false);
  }, []);

  const togglePopover = useCallback(() => {
    setShowPopover(prev => !prev);
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
            <OverlayTrigger
              trigger="click"
              placement="bottom-end"
              show={showPopover}
              onToggle={togglePopover}
              overlay={
                <TicketPopover 
                  booking={booking}
                  ticketType={ticketType}
                  onTicketPreview={handleTicketPreview}
                  onClosePopover={handleClosePopover}
                />
              }
              rootClose
            >
              <span>
                <CustomBtn
                  buttonText="Download E-Ticket"
                  icon={<Download size={14} className="me-1" />}
                  className="mb-3 btn-sm"
                  variant="primary"
                />
              </span>
            </OverlayTrigger>
            
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