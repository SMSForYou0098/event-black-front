import React from "react";
import { Button, Spinner } from "react-bootstrap";

const CustomBtn = (props) => {
  const { 
    style, 
    HandleClick, 
    buttonText, 
    disabled = false, 
    type = "button", 
    icon, 
    variant = 'primary', 
    className, 
    hideIcon = false, 
    loading = false,
    size = 'md',
    iconPosition = 'right'  // new prop with default 'right'
  } = props;
  return (
    <div className="button-primary">
      <Button style={style} variant={variant} size={size} type={type} className={`iq-button fw-bold rounded-3 ${className}`} onClick={HandleClick} disabled={disabled}>
        <span className="d-flex gap-2 align-items-center justify-content-center text-small">
          {iconPosition === 'left' && !loading && !hideIcon && (icon || <i className="fa-solid fa-play"></i>)}
          {buttonText}
          {iconPosition === 'right' && !loading && !hideIcon && (icon || <i className="fa-solid fa-play"></i>)}
          {loading && <Spinner animation="border" size="sm" />}
        </span>
      </Button>
    </div>
  );
};

export default CustomBtn;
