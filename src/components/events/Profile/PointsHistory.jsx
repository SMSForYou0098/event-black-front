import React from 'react';
import { Card } from 'react-bootstrap';
import GlassCard from '../../../utils/ProfileUtils/GlassCard';

const PointsHistory = ({ pointsHistory }) => (
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
);

export default PointsHistory;