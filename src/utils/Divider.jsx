import React from 'react';

const Divider = ({ 
  orientation = 'horizontal', 
  variant = 'solid',
  className = '',
  my = 3,
  mx = 0,
  thickness = 1,
  color = 'secondary',
  children,
  align = 'center' // 'left', 'center', 'right'
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  const lineStyle = {
    border: 'none',
    borderTop: `${thickness}px ${variant} var(--bs-${color})`,
    flex: 1,
    margin: 0
  };

  const marginClass = isHorizontal ? `my-${my}` : `mx-${mx}`;

  // If there's content, render a flex container
  if (children && isHorizontal) {
    const justifyContent = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    }[align];

    return (
      <div 
        className={`d-flex align-items-center ${marginClass} ${className}`}
        style={{ gap: '1rem' }}
      >
        {align !== 'left' && <hr style={lineStyle} />}
        <div className="flex-shrink-0">
          {children}
        </div>
        {align !== 'right' && <hr style={lineStyle} />}
      </div>
    );
  }

  // Simple divider without content
  const style = {
    border: 'none',
    borderTop: isHorizontal ? `${thickness}px ${variant} var(--bs-${color})` : 'none',
    borderLeft: !isHorizontal ? `${thickness}px ${variant} var(--bs-${color})` : 'none',
    height: isHorizontal ? 0 : '100%',
    width: isHorizontal ? '100%' : 0,
    margin: 0
  };

  return (
    <hr 
      className={`${marginClass} ${className}`}
      style={style}
    />
  );
};

export default Divider;