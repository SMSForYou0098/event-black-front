import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { CheckCircle, Trophy, Camera, Settings  } from 'lucide-react';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';
import AvatarImage from '../../../utils/ProfileUtils/AvatarImage';
import CustomBadge from '../../../utils/ProfileUtils/getBadgeClass';
const ProfileHeader = ({ user, onEditClick }) => (
  <div className='custom-dark-bg'>
    <Container>
      <GlassCard>
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
                  style={{ 
                    bottom: '-5px', 
                    right: '-5px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #ffc107, #fd7e14)' 
                  }}
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
              </div>
              <Row>
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Number', value: user.phone },
                ].map((stat, index) => (
                  <Col key={index} xs={6} md={4} className="text-center mb-2">
                    <small className="text-muted">{stat.label}</small>
                    <h6 className="mb-0">{stat.value}</h6>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col md={2} className="text-center">
              <CustomBadge 
                variant="outline-primary" 
                className='py-2 d-flex align-items-center w-50 cursor-pointer'
                onClick={onEditClick}
              >
                <Settings size={16} className="me-1" />
                Edit Profile
              </CustomBadge>
            </Col>
          </Row>
      </GlassCard>
    </Container>
  </div>
);

export default ProfileHeader;