import React from 'react';
import { Row, Col, Card, ListGroup, ProgressBar } from 'react-bootstrap';
import { Trophy, Film, Music, Heart, Gift, TrendingUp } from 'lucide-react';
import BookingCard from './BookingCard';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';

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

const OverviewTab = ({ recentBookings, user, monthlyStats }) => (
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
          <div className="mt-3 p-3 rounded custom-dark-content-bg rounded-4">
            <div className="d-flex justify-content-between mb-2">
              <small>Reward Points</small>
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
    </Col>
  </Row>
);

export default OverviewTab;