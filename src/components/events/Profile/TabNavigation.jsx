import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { User, Ticket, Heart, Gift, Settings } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'bookings', label: 'My Bookings', icon: Ticket },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  const getActiveIndex = () => TABS.findIndex(tab => tab.id === activeTab);
  
  return (
    <Container className="my-4">
      <div className="position-relative">
        <div 
          className="position-absolute top-0 start-0 h-100"
          style={{
            width: '20%',
            transform: `translateX(${getActiveIndex() * 100}%)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 0,
            border: '2px solid #dc3545',
            borderRadius: '1rem',
            background: 'rgba(220, 53, 69, 0.15)',
            boxShadow: '0 0 8px 0 rgba(220, 53, 69, 0.33)'
          }}
        />
        
        <Nav variant="pills" className="nav-fill profile-nav position-relative">
          {TABS.map(({ id, label, icon: IconComponent }) => (
            <Nav.Item key={id}>
              <Nav.Link
                active={activeTab === id}
                onClick={() => onTabChange(id)}
                style={{ zIndex: 1 }}
              >
                <IconComponent size={16} className="me-2" />
                <span className="d-none d-md-inline">{label}</span>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>
    </Container>
  );
};

export default TabNavigation;