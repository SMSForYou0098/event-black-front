import React from 'react';
import { Badge } from 'react-bootstrap';
import { User } from 'lucide-react';

const UserInfoCard = ({ user, phoneNumber }) => (
  <div className="rounded-3 p-1 mb-3 card-glassmorphism">
    <div className="d-flex align-items-center gap-2 p-2">
      <div
        className="rounded-circle bg-success bg-opacity-25 d-flex align-items-center justify-content-center"
        style={{ width: 40, height: 40 }}
      >
        <User size={20} className="text-success" />
      </div>
      <div className="flex-grow-1">
        <div className="fw-semibold text-light">{user?.name || 'Verified User'}</div>
        <small className="text-muted">{phoneNumber}</small>
      </div>
      <Badge bg="success" className="text-white">Verified</Badge>
    </div>
  </div>
);

export default UserInfoCard;
