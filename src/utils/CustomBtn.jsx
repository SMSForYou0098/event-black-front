import React from "react";
import { Button } from "react-bootstrap";

const CustomBtn = ({style, HandleClick,buttonText, disabled = false , type = "button",icon ,variant= 'primary',className}) => {
  return (
    <div className="button-primary">
      <Button style={style} variant={variant} type={type} className={`fw-bold rounded-3 ${className}`} onClick={HandleClick} disabled={disabled}>
        <span className="d-flex gap-3 align-items-center justify-content-center">
          {buttonText}
          {icon ? icon :
          <i className="fa-solid fa-play"></i>
          }
        </span>
      </Button>
    </div>
  );
};

export default CustomBtn;
