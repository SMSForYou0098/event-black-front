import React from 'react';
import StickyBottom from './StickyBottom';

const MobileTwoButtonFooter = ({
  leftButton,
  rightButton,
  className = "",
}) => {
  const isSingleButton = (leftButton && !rightButton) || (!leftButton && rightButton);

  return (
    <StickyBottom>
      <div className="container">
        <div className="d-flex gap-2 w-100 justify-content-between">

          {/* Left Button */}
          {leftButton && (
            <div className={isSingleButton ? "w-100" : ""}>
              {leftButton}
            </div>
          )}

          {/* Right Button */}
          {rightButton && (
            <div className={isSingleButton ? "w-100" : ""}>
              {rightButton}
            </div>
          )}

        </div>
      </div>
    </StickyBottom>
  );
};

export default MobileTwoButtonFooter;