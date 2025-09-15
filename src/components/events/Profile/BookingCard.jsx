import React, { useState } from 'react';
import { Image, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { Film, Music, Calendar, Trophy, CheckCircle, Clock, XCircle, Download, Share2, Star, MapPin, ChevronDown, IndianRupee } from 'lucide-react';
import { Armchair } from 'lucide-react';
import { useMyContext } from "@/Context/MyContextProvider"; //done
import TicketModal from '../../../components/Tickets/TicketModal';

import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
import CustomBtn from '../../../utils/CustomBtn';
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

const TypeIcon = ({ type, size = 16 }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.movie;
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
};


const BookingCard = ({ booking, compact = false }) => {
  const [ticketData, setTicketData] = useState([]);
  const { isMobile, formatDateRange } = useMyContext()
  const [showPopover, setShowPopover] = useState(false);
  const [ticketType, setTicketType] = useState({ id: '', type: '' });
  const [show, setShow] = useState(false);
  const { getCurrencySymbol } = useMyContext();

  // Extract booking data based on whether it's a master booking or regular booking
  const normalizeBooking = booking?.bookings ? booking.bookings[0] : booking;
  const bookingData = {
    ticket: normalizeBooking?.ticket,
    quantity: booking?.bookings 
      ? booking?.bookings?.length
      : 1,
    name: normalizeBooking?.ticket?.event?.name,
    amount: normalizeBooking?.amount,
    type: normalizeBooking?.type,
    created_at: normalizeBooking?.created_at
  };
  const handleTicketPreview = (item, type, id) => {
    setTicketData(item)
    setTicketType({ id: id, type: type })
    setShow(true)
  }

  function handleCloseModal() {
    setTicketData([])
    setTicketType()
    setShow(false)
  }

  const ticketPopover = (
    <Popover id="ticket-popover">
      <Popover.Body className='p-2'>
        <ul className="list-unstyled mb-0">
          <li>
            <Button
              variant="link"
              className="text-small rounded-3 w-100 text-start py-1 my-1 text-capitalize text-light text-decoration-none bg-primary"
              disabled={ticketType && ticketType.id === booking.id}
              onClick={() => {
                handleTicketPreview(booking, 'combine', booking?.id);
                setShowPopover(false); // Close popover
              }}
            >
              Combine
            </Button>
          </li>
          {booking?.bookings && (
            <>
              <li>
                <Button
                  variant="link"
                  className="text-small rounded-3 w-100 text-start py-1 my-1 text-capitalize text-light text-decoration-none bg-primary"
                  disabled={ticketType && ticketType.id === booking.id}
                  onClick={() => {
                    handleTicketPreview(booking, 'individual', booking?.id);
                    setShowPopover(false); // Close popover
                  }}
                >
                  Individual
                </Button>
              </li>
            </>
          )}
        </ul>
      </Popover.Body>
    </Popover>
  );

  return (
    <div className={`d-flex align-items-center justify-content-between flex-column flex-sm-row ${compact ? 'mb-3 p-3' : 'mb-4 p-4'} rounded custom-dark-content-bg rounded-4`}>
      <div className="d-flex">
        <Image
          src={bookingData.ticket?.background_image}
          alt={bookingData.ticket?.name}
          width={compact ? 60 : 80}
          height={compact ? 80 : 110}
          className="rounded-3 me-3"
          style={{ objectFit: 'cover' }}
        />
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-1">
            <TypeIcon type={bookingData.type} />
            <h6 className={`mb-0 ms-2 ${!compact && 'me-3'}`}>{bookingData?.name}</h6>
            {!compact && <CustomBadge variant="outline-secondary" className="text-uppercase">{bookingData.ticket?.event?.event_type}</CustomBadge>}
          </div>
          <small className="text-muted d-block">
            <MapPin size={14} className='custom-text-secondary' /> {bookingData.ticket?.event?.address}
          </small>
          <small className="text-muted d-block">
            <Calendar size={14} className='text-warning' /> {bookingData.ticket?.event?.date_range} • {bookingData.created_at}
          </small>
          <small className="text-muted d-block">
            <Armchair size={14} className='text-success' /> : {bookingData.ticket?.name} x <span className="text-success fw-bold">{bookingData.quantity}</span>
          </small>
          <small className="text-muted d-block">
            {/* {getCurrencySymbol(bookingData.ticket?.currency)} */}
            <IndianRupee size={14} className='text-warning' /> : {bookingData.amount}
          </small>
        </div>
      </div>
      <div className="btn-secttion d-flex">
        <div className="d-flex flex-row-reverse flex-sm-row gap-2 justify-content-end mt-2">
          <OverlayTrigger
            trigger="click"
            placement="bottom-end"
            show={showPopover}
            onToggle={() => setShowPopover(!showPopover)}
            overlay={ticketPopover}
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
      <TicketModal
        show={show}
        handleCloseModal={handleCloseModal}
        ticketType={ticketType}
        ticketData={ticketData}
        isAccreditation={ticketData?.type === 'AccreditationBooking'}
        showTicketDetails={ticketData?.type === 'AccreditationBooking'}
        formatDateRange={formatDateRange}
      />
    </div>
  )
};

export default BookingCard;