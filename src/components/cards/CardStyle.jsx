import { Fragment, memo } from "react";
import Link from "next/link";
import Image from "next/image";

const SaleTag = () => (
  <span className="bg-primary text-white fs-6 position-relative p-1 me-2 rounded-3">
    Sale!
  </span>
);

const PriceData = (props) => {
  return (
    <>
      {props.lowest_ticket_price !== undefined &&
        props.lowest_ticket_price !== null && (
          <div className="movie-price">
            <div className="d-flex align-items-center gap-2">
              {props.lowest_ticket_price === 0 ? (
                <span className="text-primary fw-bold">Free</span>
              ) : props.on_sale &&
                Number(props.lowest_sale_price) < props.lowest_ticket_price ? (
                <div className="d-flex align-items-center gap-2">
                  <del className="text-muted">
                    ₹{props.lowest_ticket_price}
                  </del>
                  <div>
                    <span className="fw-bold">
                      ₹{props.lowest_sale_price}
                    </span>
                    <small className="ms-1 text-warning">onwards</small>
                  </div>
                </div>
              ) : (
                <>
                  <span className="fw-bold">
                    ₹{props.lowest_ticket_price}
                  </span>
                  <div className="text-fw-normal">onwards</div>
                </>
              )}
              {/* <div className="d-none d-sm-block">
                {props.on_sale && <SaleTag />}
              </div> */}
            </div>
          </div>
        )}
    </>
  );
};

const CardStyle = memo((props) => {
  const rawImage = props?.image;

  // Normalize src for next/image
  const getImageSrc = (src) => {
    if (!src) {
      return "https://placehold.co/500x400";
    }

    // If already full URL (http/https) → use as is
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // If you want to serve it from your backend server:
    // e.g. src = "gallery/events/thumbnail/..."
    const BASE_URL = "http://192.168.0.164:8000/"; // or from env: process.env.NEXT_PUBLIC_API_URL
    return BASE_URL + src.replace(/^\/+/, ""); // remove any leading slashes just in case
  };

  const imageSrc = getImageSrc(rawImage);

  console.log("raw props.image:", rawImage);
  console.log("normalized imageSrc:", imageSrc);

  return (
    <Fragment>
      <div className="iq-top-ten-block">
        <div className="block-image position-relative">
          <div className="img-box">
            <Link href={props.link} className="overly-images">
              {props.on_sale && (
                <span className="position-absolute top-0 end-0 m-2 z-index-3">
                  <SaleTag />
                </span>
              )}
              <Image
                src={imageSrc}
                alt="movie-card"
                loading="lazy"
                width={180}
                height={270}
                className="img-fluid card-img"
              />
            </Link>
          </div>
          <div className="evnt-desc mt-3">
            <div>
              <h5 className="text-capitalize">
                <Link href={props.link}>{props.title}</Link>
              </h5>
              <PriceData {...props} />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;