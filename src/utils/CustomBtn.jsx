import React from "react";
import { Button } from "react-bootstrap";

const CustomBtn = (props) => {
  const { style, HandleClick, buttonText, disabled = false, type = "button", icon, variant = 'primary', className, hideIcon = false, loading = false } = props;
  return (
    <div className="button-primary">
      <Button style={style} variant={variant} type={type} className={`iq-button fw-bold rounded-3 ${className}`} onClick={HandleClick} disabled={disabled}>
        <span className="d-flex gap-2 align-items-center justify-content-center text-small">
          {buttonText}
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            hideIcon === false && icon ? icon : <i className="fa-solid fa-play"></i>
          )}
        </span>
      </Button>
    </div>
  );
};

export default CustomBtn;
