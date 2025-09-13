import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Badge, Form, ProgressBar, Image, ListGroup } from 'react-bootstrap';
import { User, Calendar, Settings, CreditCard, MapPin, Bell, Shield, Edit3, Camera, Phone, Mail, Star, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Film, Music, Ticket, Gift, Heart, Download, Share2, Users, Trophy, Zap, Settings2Icon } from 'lucide-react';
import CustomBadge from '../../utils/ProfileUtils/getBadgeClass';
import { useMyContext } from '@/Context/MyContextProvider';
// Constants
const MEMBERSHIP_TIERS = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum'
};

const STATUS_CONFIG = {
  confirmed: { variant: 'outline-success', icon: CheckCircle, color: 'text-success' },
  completed: { variant: 'outline-success', icon: CheckCircle, color: 'text-primary' },
  pending: { variant: 'outline-warning', icon: Clock, color: 'text-warning' },
  cancelled: { variant: 'outline-primary', icon: XCircle, color: 'text-danger' }
};

const TYPE_CONFIG = {
  movie: { icon: Film, label: 'Movie', },
  concert: { icon: Music, label: 'Concert', },
  event: { icon: Calendar, label: 'Event', },
  sports: { icon: Trophy, label: 'Sports', }
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: User, variant: 'primary' },
  { id: 'bookings', label: 'My Bookings', icon: Ticket, variant: 'primary' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, variant: 'primary' },
  { id: 'rewards', label: 'Rewards', icon: Gift, variant: 'primary' },
  { id: 'settings', label: 'Settings', icon: Settings, variant: 'primary' }
];

// Utility Components
const IconContainer = ({ children, bgColor = 'rgba(220, 53, 69, 0.2)', size = 40 }) => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: bgColor,
      borderRadius: '12px'
    }}
  >
    {children}
  </div>
);

const GlassCard = ({ children, className = '', ...props }) => (
  <Card className={`custom-dark-bg text-light border-secondary ${className}`} {...props}>
    {children}
  </Card>
);

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

const TypeIcon = ({ type, size = 16 }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.movie;
  const IconComponent = config.icon;
  return <IconComponent size={size} />;
};

const getInitials = (name = "") => {
  const names = name?.trim().split(" ");
  if (names?.length === 0) return "";
  if (names?.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
  // Generate consistent color based on name
  const colors = [
    '#dc3545', '#6f42c1', '#0d6efd', '#198754', '#fd7e14',
    '#20c997', '#6610f2', '#d63384', '#fd7e14', '#198754'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// AvatarImage Component
const AvatarImage = ({ src, alt, name, size = 100, className = "", style = {} }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [src]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Show initials if no src, image failed to load, or still loading and failed
  const shouldShowInitials = !src || imageError;

  if (shouldShowInitials) {
    const initials = getInitials(name);
    const bgColor = getAvatarColor(name || 'Default');
    
    return (
      <div
        className={`d-flex justify-content-center align-items-center ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: bgColor,
          color: 'white',
          fontSize: `${size * 0.4}px`,
          fontWeight: 'bold',
          //border: '4px solid #dc3545',
          ...style
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        roundedCircle
        width={size}
        height={size}
        className={className}
        style={{ 
          border: '4px solid #dc3545',
          display: imageLoading ? 'none' : 'block',
          ...style 
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      {/* Show loading placeholder while image loads */}
      {imageLoading && (
        <div
          className={`d-flex justify-content-center align-items-center ${className}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: '#6c757d',
            color: 'white',
            fontSize: `${size * 0.3}px`,
            fontWeight: 'bold',
            border: '4px solid #dc3545',
            ...style
          }}
        >
          ...
        </div>
      )}
    </>
  );
};
// Custom Hooks
const useUserData = () => {
  const { UserData } = useMyContext();
  return useMemo(() => ({
    user: {
      name: UserData?.name,
      email: UserData?.email,
      phone: UserData?.number,
      avatar: UserData?.photo,
      verified: true,
      totalBookings: 47,
      totalSpent: 1240,
      city: UserData?.city
    },
    bookings: [
      {
        id: '1',
        title: 'Spider-Man: No Way Home',
        type: 'movie',
        venue: 'AMC Empire 25',
        date: '2024-01-15',
        time: '7:30 PM',
        seats: ['H7', 'H8'],
        status: 'confirmed',
        amount: 28,
        poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 4.5
      },
      {
        id: '2',
        title: 'Coldplay World Tour',
        type: 'concert',
        venue: 'Madison Square Garden',
        date: '2024-01-10',
        time: '8:00 PM',
        seats: ['A12', 'A13'],
        status: 'completed',
        amount: 180,
        poster: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 5
      },
      {
        id: '3',
        title: 'The Lion King',
        type: 'event',
        venue: 'Broadway Theatre',
        date: '2024-01-05',
        time: '2:00 PM',
        seats: ['M15', 'M16'],
        status: 'completed',
        amount: 95,
        poster: 'https://images.pexels.com/photos/3137890/pexels-photo-3137890.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop',
        rating: 4.8
      },
      {
        id: '4',
        title: 'Lakers vs Warriors',
        type: 'sports',
        venue: 'Crypto.com Arena',
        date: '2024-01-02',
        time: '7:00 PM',
        seats: ['Section 101, Row 5'],
        status: 'cancelled',
        amount: 240,
        poster: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'
      },
    ],
    rewards: [
      { id: 1, title: 'Free Movie Ticket', description: 'Valid for any movie', points: 500, icon: Ticket, bgColor: 'rgba(220, 53, 69, 0.2)', iconColor: 'text-danger' },
      { id: 2, title: '$10 Food Voucher', description: 'Use at any cinema', points: 300, icon: Gift, bgColor: 'rgba(25, 135, 84, 0.2)', iconColor: 'text-success' }
    ],
    pointsHistory: [
      { id: 1, action: 'Movie Booking', details: 'Spider-Man: No Way Home', points: 50, type: 'earned' },
      { id: 2, action: 'Review Posted', details: 'The Lion King', points: 25, type: 'earned' },
      { id: 3, action: 'Redeemed Reward', details: 'Free Movie Ticket', points: 500, type: 'spent' }
    ],
    monthlyStats: [
      { label: '3 Bookings', sublabel: 'This month', icon: Ticket, bgColor: 'rgba(220, 53, 69, 0.2)', iconColor: 'text-danger', trending: true },
      { label: '4.8 Rating', sublabel: 'Average given', icon: Star, bgColor: 'rgba(25, 135, 84, 0.2)', iconColor: 'text-success' },
      { label: '12 Friends', sublabel: 'Invited', icon: Users, bgColor: 'rgba(13, 110, 253, 0.2)', iconColor: 'text-primary' }
    ]
  }), []);
};

// Components
const ProfileHeader = ({ user, onEditClick }) => (
  <div className='custom-dark-bg'>
    <Container>
      <GlassCard>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={2} className="text-center mb-3 mb-md-0">
              <div className="position-relative d-inline-block">
                <AvatarImage
                  src={user.avatar}
                  alt="Profile"
                  name={user.name}
                  size={100}
                />
                <Button
                  variant="warning"
                  size="sm"
                  className="position-absolute px-1 px-3"
                  style={{ bottom: '-5px', right: '-5px', borderRadius: '50%',background: 'linear-gradient(135deg, #ffc107, #fd7e14)', }}
                >
                  <Camera size={16} />
                </Button>
              </div>
            </Col>
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <h2 className="mb-0 me-3">{user.name}</h2>
                {user.verified && (
                  <CustomBadge variant="outline-success" className="me-2">
                    <CheckCircle size={14} className="me-1" />
                    Verified
                  </CustomBadge>
                )}
                <Badge bg="warning" text="dark">
                  <Trophy size={14} className="me-1" />
                  {user.membershipTier}
                </Badge>
              </div>
              {/* <p className="text-muted mb-3">
                <MapPin size={16} className="me-1" />
                {user.city} • Member since {user.joinDate}
              </p> */}
              <Row>
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email', value: `${user.email}` },
                  { label: 'number', value: user.phone },
                ].map((stat, index) => (
                  <Col key={index} xs={6} md={4} className="text-center mb-2">
                    <small className="text-muted">{stat.label}</small>
                    <h6 className=" mb-0">{stat.value}</h6>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col md={2} className="text-center">
              <CustomBadge variant="outline-primary" className='py-2 d-flex align-items-center w-50 cursor-pointer'>
                <Settings size={16} className="me-1" />
                Edit Profile
              </CustomBadge>
            </Col>
          </Row>
        </Card.Body>
      </GlassCard>
    </Container>
  </div>
);

const TabNavigation = ({ activeTab, onTabChange }) => (
  <Container className="my-4">
    <Nav variant="pills" className="nav-fill">
      {TABS.map(({ id, label, icon: IconComponent, variant }) => (
        <Nav.Item key={id}>
          <Nav.Link
            variant={variant}
            active={activeTab === id}
            onClick={() => onTabChange(id)}
            className={activeTab === id ? 'bg-primary text-light rounded-3' : 'text-light'}
          >
            <IconComponent size={16} className="me-2" />
            <span className="d-none d-md-inline">{label}</span>
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  </Container>
);

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
      <small className="text-muted d-block">{booking.venue}</small>
      <small className="text-muted d-block">{booking.date} • {booking.time}</small>
      <small className="text-muted">Seats: {booking.seats.join(', ')}</small>
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
        <div className={`d-flex ${compact ? 'justify-content-end' : 'justify-content-end'} align-items-center mt-1`}>
          <Star size={14} className="text-warning me-1" fill="currentColor" />
          <small className="text-muted">{booking.rating}</small>
        </div>
      )}
    </div>
  </div>
);

const StatCard = ({ icon: IconComponent, label, sublabel, bgColor, iconColor, trending }) => (
  <div className="d-flex justify-content-between align-items-center mb-3">
    <div className="d-flex align-items-center">
      <IconContainer bgColor={bgColor}>
        <IconComponent size={20} className={iconColor} />
      </IconContainer>
      <div className="ms-3">
        <div className="fw-bold">{label}</div>
        <small className="text-muted">{sublabel}</small>
      </div>
    </div>
    {trending && <TrendingUp size={16} className="text-success" />}
  </div>
);

const PersonalInfoField = ({ icon: IconComponent, label, value }) => (
  <Col md={6} className="mb-3">
    <Form.Label className="text-muted small">{label}</Form.Label>
    <div className="d-flex align-items-center p-3 rounded"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <IconComponent size={16} className="text-muted me-3" />
      <span>{value}</span>
    </div>
  </Col>
);

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { user, bookings, rewards, pointsHistory, monthlyStats } = useUserData();

  const recentBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  return (
    <div className='section-padding'>
      <ProfileHeader user={user} onEditClick={() => setIsEditing(!isEditing)} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <Container className="pb-5">
        {activeTab === 'overview' && (
          <Row>
            <Col lg={8}>
              {/* Recent Bookings */}
              <GlassCard className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Bookings</h5>
                  <CustomBadge variant="outline-primary cursor-pointer">View All</CustomBadge>
                </Card.Header>
                <Card.Body>
                  {recentBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} compact />
                  ))}
                </Card.Body>
              </GlassCard>

              {/* Personal Info */}
              <GlassCard>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Personal Information</h5>
                  <Button variant="link" className="text-danger p-0">
                    <Edit3 size={16} />
                  </Button>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <PersonalInfoField icon={Mail} label="Email" value={user.email} />
                    <PersonalInfoField icon={Phone} label="Phone" value={user.phone} />
                    <PersonalInfoField icon={MapPin} label="City" value={user.city} />
                    <PersonalInfoField icon={Film} label="Favorite Genre" value={user.favoriteGenre} />
                  </Row>
                </Card.Body>
              </GlassCard>
            </Col>

            <Col lg={4}>
              {/* Membership Status */}
              <GlassCard className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Membership Status</h5>
                </Card.Header>
                <Card.Body className="text-center">
                  <div className="d-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                      borderRadius: '50%',
                      margin: '0 auto'
                    }}>
                    <Trophy size={32} color="black" />
                  </div>
                  <h5 className="text-warning">{user.membershipTier} Member</h5>
                  <small className="text-muted">Next tier: Platinum (150 points away)</small>
                  <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">Reward Points</small>
                      <strong className="text-danger">{user.points}</strong>
                    </div>
                    <ProgressBar striped variant="primary" now={75} className='rounded-4' style={{ height: 5 }} />
                  </div>
                </Card.Body>
              </GlassCard>

              {/* Monthly Stats */}
              <GlassCard className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">This Month</h5>
                </Card.Header>
                <Card.Body>
                  {monthlyStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ))}
                </Card.Body>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard>
                <Card.Header>
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {[
                      { icon: Film, text: 'Book Movie Tickets' },
                      { icon: Music, text: 'Find Events & Shows' },
                      { icon: Heart, text: 'View Wishlist' },
                      { icon: Gift, text: 'Redeem Points' }
                    ].map(({ icon: IconComponent, text }, index) => (
                      <ListGroup.Item key={index} className="bg-transparent text-light border-secondary d-flex align-items-center py-3" action>
                        <IconComponent size={16} className="text-danger me-3" />
                        {text}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </GlassCard>
            </Col>
          </Row>
        )}

        {activeTab === 'bookings' && (
          <GlassCard>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Bookings</h5>
              <div className="d-flex gap-2">
                {['All Types', 'All Status'].map((placeholder, index) => (
                  <Form.Select key={index} size="sm" className="bg-secondary text-light border-secondary">
                    <option>{placeholder}</option>
                  </Form.Select>
                ))}
              </div>
            </Card.Header>
            <Card.Body>
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </Card.Body>
          </GlassCard>
        )}

        {activeTab === 'wishlist' && (
          <GlassCard>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Wishlist</h5>
              <small className="text-muted">8 items</small>
            </Card.Header>
            <Card.Body>
              <Row>
                {Array.from({ length: 6 }, (_, index) => (
                  <Col key={index} xs={6} md={4} lg={2} className="mb-4">
                    <div className="position-relative">
                      <Image
                        src="https://images.pexels.com/photos/796602/pexels-photo-796602.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop"
                        alt="Movie poster"
                        fluid
                        className="rounded"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-50 start-50 translate-middle opacity-0 hover-opacity-100 transition">
                        <Button variant="danger" className="rounded-circle p-2">
                          <Heart size={16} fill="currentColor" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <div className="fw-medium small">Avengers: Secret Wars</div>
                        <small className="text-muted">Coming Soon</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </GlassCard>
        )}

        {activeTab === 'rewards' && (
          <Row>
            <Col lg={6}>
              <GlassCard className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Available Rewards</h5>
                </Card.Header>
                <Card.Body>
                  {rewards.map(({ id, title, description, points, icon: IconComponent, bgColor, iconColor }) => (
                    <div key={id} className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="d-flex align-items-center">
                        <IconContainer bgColor={bgColor} size={48}>
                          <IconComponent size={24} className={iconColor} />
                        </IconContainer>
                        <div className="ms-3">
                          <div className="fw-bold">{title}</div>
                          <small className="text-muted">{description}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-danger mb-1">{points} pts</div>
                        <Button variant="danger" size="sm">Redeem</Button>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </GlassCard>
            </Col>
            <Col lg={6}>
              <GlassCard>
                <Card.Header>
                  <h5 className="mb-0">Points History</h5>
                </Card.Header>
                <Card.Body>
                  {pointsHistory.map(({ id, action, details, points, type }) => (
                    <div key={id} className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div>
                        <div className="fw-bold">{action}</div>
                        <small className="text-muted">{details}</small>
                      </div>
                      <div className={`fw-bold ${type === 'earned' ? 'text-success' : 'text-danger'}`}>
                        {type === 'earned' ? '+' : '-'}{points}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </GlassCard>
            </Col>
          </Row>
        )}

        {activeTab === 'settings' && (
          <Row>
            <Col lg={6}>
              <GlassCard className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Notification Preferences</h5>
                </Card.Header>
                <Card.Body>
                  {[
                    { icon: Bell, text: 'Booking Confirmations', checked: true },
                    { icon: Film, text: 'New Movie Releases', checked: true },
                    { icon: Gift, text: 'Offers & Promotions', checked: false }
                  ].map(({ icon: IconComponent, text, checked }, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-3 rounded"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="d-flex align-items-center">
                        <IconComponent size={16} className="text-danger me-3" />
                        <span>{text}</span>
                      </div>
                      <Form.Check
                        type="switch"
                        id={`notification-${index}`}
                        defaultChecked={checked}
                        className="text-danger"
                      />
                    </div>
                  ))}
                </Card.Body>
              </GlassCard>
            </Col>
            <Col lg={6}>
              <GlassCard>
                <Card.Header>
                  <h5 className="mb-0">Account Security</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {[
                      { icon: Shield, text: 'Change Password' },
                      { icon: Zap, text: 'Enable Two-Factor Auth' },
                      { icon: CreditCard, text: 'Payment Methods' }
                    ].map(({ icon: IconComponent, text }, index) => (
                      <ListGroup.Item key={index} className="bg-transparent text-light border-secondary d-flex align-items-center py-3" action>
                        <IconComponent size={16} className="text-danger me-3" />
                        {text}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </GlassCard>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default UserProfile;