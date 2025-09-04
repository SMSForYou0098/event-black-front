import React, { memo, Fragment } from "react";
import Link from 'next/link'

const CustomButton = memo((props) => {
  return (
    <Fragment>
      {props.linkButton === "true" && (
        <div className="iq-button link-button">
          <Link
            href={props.link}
            className="btn text-capitalize position-relative"
          >
            <span className="button-text">{props.buttonTitle}</span>
          </Link>
        </div>
      )}
      {props.linkButton === "false" && (
        <div className="iq-button">
          <Link
            href={props.link}
            className="btn text-uppercase position-relative"
          >
            <span className="button-text">{props.buttonTitle}</span>
            <i className="fa-solid fa-play"></i>
          </Link>
        </div>
      )}
    </Fragment>
  );
});

CustomButton.displayName = "CustomButton";
export default CustomButton;