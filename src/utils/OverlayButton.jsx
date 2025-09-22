import React from "react";
import { Button } from "react-bootstrap";

const OverlayButton = React.forwardRef((props, ref) => {
  const { 
    style, 
    onClick,  // Using standard onClick instead of HandleClick
    buttonText, 
    disabled = false, 
    type = "button", 
    icon, 
    variant = 'primary', 
    className, 
    hideIcon = false, 
    loading = false,
    size = 'md',
    iconPosition = 'right'
  } = props;
  
  return (
    <div className="button-primary" ref={ref}>
      <Button 
        style={style} 
        variant={variant} 
        size={size} 
        type={type} 
        className={`iq-button fw-bold rounded-3 ${className}`} 
        onClick={onClick} 
        disabled={disabled}
      >
        <span className="d-flex gap-2 align-items-center justify-content-center text-small">
          {iconPosition === 'left' && !loading && !hideIcon && (icon || <i className="fa-solid fa-play"></i>)}
          {buttonText}
          {iconPosition === 'right' && !loading && !hideIcon && (icon || <i className="fa-solid fa-play"></i>)}
          {loading && <div className="spinner-border spinner-border-sm" role="status"></div>}
        </span>
      </Button>
    </div>
  );
});

OverlayButton.displayName = 'OverlayButton';

export default OverlayButton;