import React from 'react';
import { Card, Button } from 'react-bootstrap';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';
import CustomBtn from './../../../utils/CustomBtn';

const IconContainer = ({ children, bgColor, size = 48 }) => (
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

const AvailableRewards = ({ rewards }) => (
  <GlassCard className="mb-4">
    <Card.Header>
      <h5 className="mb-0">Available Rewards</h5>
    </Card.Header>
    <Card.Body>
      {rewards.map(({ id, title, description, points, icon: IconComponent, bgColor, iconColor }) => (
        <div key={id} className="d-flex justify-content-between align-items-center mb-3 p-3 custom-dark-content-bg rounded-3">
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
            <div className="fw-bold custom-text-secondary  mb-1">{points} pts</div>
            {/* <CustomBt variant="primary" size="sm">Redeem</Button> */}
            <CustomBtn buttonText="Redeem" variant="primary" size="sm" className="btn-sm"/>
          </div>
        </div>
      ))}
    </Card.Body>
  </GlassCard>
);

export default AvailableRewards;