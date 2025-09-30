import React, { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";

const GenersCard = ({ image, title, slug, type }) => {
  return (
    <Fragment>
      <div className="iq-card-geners card-hover-style-two">
        <div className="block-images position-relative w-100">
          <div className="img-box rounded position-relative">
            <Image
              src={image || 'https://placehold.co/500x250'}
              alt={title || "geners-img"}
              className="img-fluid object-cover w-100 rounded-3"
              width={500}
              height={50}
              loading="lazy"
              style={{ height: '150px',
                objectFit: 'cover'
               }}
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
