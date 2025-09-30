import React, { Fragment } from "react";
import Link from "next/link";

const GenersCard = ({ image, title, slug, type }) => {
  return (
    <Fragment>
      <div className="iq-card-geners card-hover-style-two">
        <div className="block-images position-relative w-100">
          <div className="img-box rounded position-relative">
            <img
              src={image || 'https://placehold.co/500x250'}
              alt={title || "geners-img"}
              className="img-fluid object-cover w-100 rounded"
            />
            <div className="blog-description">
              <h6 className="mb-0 iq-title">
                  {title}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default GenersCard;
