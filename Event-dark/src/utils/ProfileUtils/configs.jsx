export const STATUS_CONFIG = {
  confirmed: { variant: 'outline-success', icon: 'CheckCircle', color: 'text-success' },
  completed: { variant: 'outline-success', icon: 'CheckCircle', color: 'text-primary' },
  pending: { variant: 'outline-warning', icon: 'Clock', color: 'text-warning' },
  cancelled: { variant: 'outline-primary', icon: 'XCircle', color: 'text-danger' }
};

export const TYPE_CONFIG = {
  movie: { icon: 'Film', label: 'Movie' },
  concert: { icon: 'Music', label: 'Concert' },
  event: { icon: 'Calendar', label: 'Event' },
  sports: { icon: 'Trophy', label: 'Sports' }
};

export const TABS = [
  { id: 'overview', label: 'Overview', icon: 'User' },
  { id: 'bookings', label: 'My Bookings', icon: 'Ticket' },
  { id: 'wishlist', label: 'Wishlist', icon: 'Heart' },
  { id: 'rewards', label: 'Rewards', icon: 'Gift' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];