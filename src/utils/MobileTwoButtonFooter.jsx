import React from 'react';
import StickyBottom from './StickyBottom';

const MobileTwoButtonFooter = ({
  leftButton,
  rightButton,
  className = "",
}) => {
  return (
    <StickyBottom>
      <div className="container">
        <div className="d-flex gap-2 justify-content-center">
          {/* Left Button */}
          {leftButton && (
            <div className="flex-fill">
              {leftButton}
            </div>
          )}

          {/* Right Button */}
          {rightButton && (
            <div className="flex-fill">
              {rightButton}
            </div>
          )}
        </div>
      </div>
    </StickyBottom>
  );
};

export default MobileTwoButtonFooter;