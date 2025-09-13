import React from 'react';
import { Image, Button } from 'react-bootstrap';
import { Film, Music, Calendar, Trophy, CheckCircle, Clock, XCircle, Download, Share2, Star, MapPin } from 'lucide-react';
import { Armchair } from 'lucide-react';
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

const BookingCard = ({ booking, compact = false }) => (
  <div className={`d-flex align-items-center ${compact ? 'mb-3 p-3' : 'mb-4 p-4'} rounded custom-dark-content-bg rounded-4`}>
    <Image
      src={booking.poster}
      alt={booking.title}
      width={compact ? 60 : 80}
      height={compact ? 80 : 110}
      className="rounded me-3"
      style={{ objectFit: 'cover' }}
    />
    <div className="flex-grow-1">
      <div className="d-flex align-items-center mb-1">
        <TypeIcon type={booking.type} />
        <h6 className={`mb-0 ms-2 ${!compact && 'me-3'}`}>{booking.title}</h6>
        {!compact && <CustomBadge variant="outline-secondary" className="text-uppercase">{booking.type}</CustomBadge>}
      </div>
      <small className="text-muted d-block">
        <MapPin size={14} className='custom-text-secondary'/> {booking.venue}
      </small>
      <small className="text-muted d-block">
        <Calendar size={14} className='text-warning'/> {booking.date} • {booking.time}
      </small>
      <small className="text-muted">
        <Armchair size={14} className='text-success'/> : {booking.seats.join(', ')}
      </small>
    </div>
    <div className="text-end">
      <h5 className={`${compact ? 'mb-1' : 'mb-2'}`}>${booking.amount}</h5>
      <StatusBadge status={booking.status} />
      {booking.status === 'confirmed' && !compact && (
        <div className="d-flex gap-2 justify-content-end mt-2">
          <Button variant="danger" size="sm">
            <Download size={14} className="me-1" />
            Download
          </Button>
          <Button variant="outline-secondary" size="sm">
            <Share2 size={14} className="me-1" />
            Share
          </Button>
        </div>
      )}
      {booking.rating && (
        <div className="d-flex justify-content-end align-items-center mt-1">
          <Star size={14} className="text-warning me-1" fill="currentColor" />
          <small className="text-muted">{booking.rating}</small>
        </div>
      )}
    </div>
  </div>
);

export default BookingCard;