import { Fragment, memo } from "react";
import Link from "next/link";
import Image from "next/image";

// sale tag
const SaleTag = (props) => (
  <span className="bg-primary text-white fs-6 position-relative p-1 me-2 rounded-3">
    {props.text}
  </span>
);

// price data
const PriceData = (props) => {
  return (
    <>
      {props.lowest_ticket_price !== undefined &&
        props.lowest_ticket_price !== null && (
          <div className="movie-price" style={{ fontSize: '12px' }}>
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
                      ₹{props.lowest_sale_price || 0}
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

  return (
    <Fragment>
      <div className="iq-top-ten-block">
        <div className="block-image position-relative">
          <div className="img-box rounded-3 overflow-hidden">
            <Link href={props.link || "#"} className="overly-images">
              <Image
                src={imageSrc}
                alt="movie-card"
                loading="lazy"
                width={180}
                height={270}
                className="img-fluid card-img"
              />
              {props.message ? (
                <span className="position-absolute top-0 start-0 m-2 z-index-3">
                  <SaleTag text={props.message} />
                </span>
              ) : (
                props.on_sale && (
                  <span className="position-absolute top-0 start-0 m-2 z-index-3">
                    <SaleTag text="Sale!" />
                  </span>
                )
              )}
            </Link>
          </div>
          <div className="evnt-desc mt-3">
            <div>
              <h6 style={{ fontSize: "14px" }} className="text-capitalize">
                <Link href={props.link || "#"}>{props.title}</Link>
              </h6>
              {props.message ? (
                <></>
              ) :
                <PriceData {...props} />
              }
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;