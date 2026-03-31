import React from 'react';

/**
 * Reusable Card Container for Event Sidebars/Details
 */
export const CardContainer = ({ children, className = "", style = {} }) => (
  <div className={`custom-dark-bg p-3 rounded-3 mb-3 ${className}`} style={style}>
    {children}
  </div>
);

/**
 * Reusable Card Header with Icon
 */
export const CardHeader = ({ icon: Icon, title, iconColor = "text-warning", className = "" }) => (
  <h5 className={`mb-3 fw-500 text-light d-flex align-items-center gap-2 ${className}`} style={{ fontSize: '18px' }}>
    {Icon && <Icon size={20} className={iconColor} />} {title}
  </h5>
);

/**
 * Reusable Detail Item (Icon + Label + Value)
 */
export const DetailItem = ({ icon: Icon, label, value, isLast = false }) => (
  <div className={isLast ? "mb-0" : "mb-3"}>
    <div className="d-flex align-items-center mb-1">
      {Icon && <Icon size={16} className="custom-text-secondary" />}
      <span className="ms-2 text-muted" style={{ fontSize: '12px' }}>{label}</span>
    </div>
    <div className="fw-bold text-light ms-4" style={{ fontSize: '14px' }}>{value}</div>
  </div>
);
