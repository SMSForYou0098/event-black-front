import { FC, Fragment, memo } from "react";
import Link from 'next/link';
import Image from "next/image";

const TopTenCard = memo(({ link, image, countValue, houseFull }) => {
  return (
    <Fragment>
      <div className="product-block rounded-2">
        <div className="block-image position-relative">
          <div className="img-box position-relative">

            {/* ✅ House Full Stamp - Top Right Corner */}
            {houseFull && (
              <>
                {/* semi-transparent dark overlay */}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded-3 z-2" style={{ pointerEvents: "none" }}></div>

                {/* fully booked stamp - top right */}
                <Image
                  src="/assets/images/hfull.webp"
                  alt="Fully booked"
                  width={80}
                  height={80}
                  className="position-absolute top-0 end-0 shadow-lg z-3"
                  style={{
                    transform: "rotate(-15deg)",
                    margin: "10px",
                    pointerEvents: "none",
                    objectFit: "contain"
                  }}
                />
              </>
            )}

            <Link className="overly-images" href={link}>
              <Image
                src={image || "/assets/images/no-banner.jpg"}
                alt="movie-card"
                loading="lazy"
                width={180}
                height={270}
                className="img-fluid card-img rounded-3"
              />
            </Link>
            <span className="top-ten-numbers texture-text">{countValue}</span>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

TopTenCard.displayName = "TopTenCard";
export default TopTenCard;