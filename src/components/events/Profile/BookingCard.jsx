import React, { useState } from 'react';
import { Image, Button, Dropdown } from 'react-bootstrap';
import { Film, Music, Calendar, Trophy, CheckCircle, Clock, XCircle, Download, Share2, Star, MapPin, ChevronDown } from 'lucide-react';
import { Armchair } from 'lucide-react';
import { useMyContext } from "@/Context/MyContextProvider"; //done
import TicketModal from '../../../components/Tickets/TicketModal';

import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
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

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
  const IconComponent = config.icon;

  return (
    <CustomBadge variant={config.variant} className="d-flex align-items-center gap-1">
      <IconComponent size={14} />
      <span className="text-capitalize">{status}</span>
    </CustomBadge>
  );
};

const BookingCard = ({ booking, compact = false }) => 
  {
    const [ticketData, setTicketData] = useState([]);
        const { isMobile, formatDateRange } = useMyContext()

    const [ticketType, setTicketType] = useState({ id: '', type: '' });
    const [show, setShow] = useState(false);
    const {getCurrencySymbol} = useMyContext();
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
    return(
  <div className={`d-flex align-items-center ${compact ? 'mb-3 p-3' : 'mb-4 p-4'} rounded custom-dark-content-bg rounded-4`}>
    <Image
      src={booking?.ticket?.background_image}
      alt={booking?.ticket?.name}
      width={compact ? 60 : 80}
      height={compact ? 80 : 110}
      className="rounded-3 me-3"
      style={{ objectFit: 'cover' }}
    />
    <div className="flex-grow-1">
      <div className="d-flex align-items-center mb-1">
        <TypeIcon type={booking.type} />
        <h6 className={`mb-0 ms-2 ${!compact && 'me-3'}`}>{booking?.ticket?.name}</h6>
        {!compact && <CustomBadge variant="outline-secondary" className="text-uppercase">{booking?.ticket?.event?.event_type}</CustomBadge>}
      </div>
      <small className="text-muted d-block">
        <MapPin size={14} className='custom-text-secondary'/> {booking?.ticket?.event.address}
      </small>
      <small className="text-muted d-block">
        <Calendar size={14} className='text-warning'/> {booking?.ticket?.event.date_range} • {booking.created_at}
      </small>
      <small className="text-muted">
        <Armchair size={14} className='text-success'/> : {booking?.attendees?.length ?? 1}
      </small>
    </div>
    <div className="text-end">
      <h5 className={`${compact ? 'mb-1' : 'mb-2'}`}>{getCurrencySymbol(booking?.ticket?.currency)}{booking.amount}</h5>
      {/* <StatusBadge status={booking?.status} />
      {booking.status === 'confirmed' && !compact && ( */}
        <div className="d-flex gap-2 justify-content-end mt-2">
          <Dropdown>
                                                    <Dropdown.Toggle
                                                        className='d-flex align-items-center gap-1'
                                                        as={Button}
                                                        variant="btn-primary"
                                                        bsPrefix="btn-primary mb-3 "
                                                    >
                                                        Generate E-Ticket{" "}
                                                        <ChevronDown />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <li>
                                                            <Dropdown.Item
                                                                disabled={ticketType && ticketType.id === booking.id}
                                                                onClick={() => handleTicketPreview(booking, 'combine', booking?.id)}>
                                                                Combine
                                                            </Dropdown.Item>
                                                        </li>

                                                        {booking?.bookings &&
                                                            <>
                                                                <li>
                                                                    <Dropdown.Divider />
                                                                </li>
                                                                <li>
                                                                    <Dropdown.Item
                                                                        disabled={ticketType && ticketType.id === booking.id}
                                                                        onClick={() => handleTicketPreview(booking, 'individual', booking?.id)}>
                                                                        Individual
                                                                    </Dropdown.Item>
                                                                </li>
                                                            </>
                                                        }
                                                    </Dropdown.Menu>
                                                </Dropdown>
          <Button variant="outline-secondary" size="sm">
            <Share2 size={14} className="me-1" />
            Share
          </Button>
        </div>
      {/* )} */}
      {booking.rating && (
        <div className="d-flex justify-content-end align-items-center mt-1">
          <Star size={14} className="text-warning me-1" fill="currentColor" />
          <small className="text-muted">{booking?.rating}</small>
        </div>
      )}
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
)};

export default BookingCard;