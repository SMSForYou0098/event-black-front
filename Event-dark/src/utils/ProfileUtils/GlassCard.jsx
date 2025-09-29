import React from 'react';
import { Card } from 'react-bootstrap';

const GlassCard = ({ children, className = '', ...props }) => (
  <Card className={`custom-dark-bg text-light border-secondary ${className}`} {...props}>
    {children}
  </Card>
);

export default GlassCard;