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
export const PriceData = (props) => {
  return (
    <div className="product-caption" style={{ fontSize: '12px' }}>
      <p className="fs-6 my-0 fw-bold">
        <Link
          href={props?.link || '#'}
          style={{ fontSize: "14px" }}
          className="title-link"
        >
          {props.title}
        </Link>
      </p>
      <div>
        {props.message ? (
          <></>
        ) : (
          <span className="price">
            {
              !props?.noPrice &&
              <>
                {props.lowest_ticket_price == 0 ? (
                  <span className="text-primary fw-bold">Free</span>
                ) : props.on_sale &&
                  Number(props.lowest_sale_price) < props.lowest_ticket_price ? (
                  <>
                    <del className="text-muted">
                      ₹{props.lowest_ticket_price}
                    </del>
                    <span className="ms-1 fw-bold">
                      ₹{props.lowest_sale_price}
                    </span>
                    <small className="ms-1 text-warning">onwards</small>
                  </>
                ) : (
                  <>
                    <span className="fw-bold">
                      ₹{props.lowest_ticket_price || 0}
                    </span>
                    <span className="ms-2">onwards</span>
                  </>
                )}
              </>
            }
          </span>
        )}
      </div>
      <span>{props?.city}</span>
      <div className="container-rating">
        <div className="star-rating text-primary">
          {/* <RatingStar count={props.rating} count1={props.count1} starColor="text-warning" /> */}
        </div>
      </div>
    </div>
  );
};

export const ProductBlock = (props) => {
  const rawImage = props.image;

  return (
    <div className="product-block">
      <div className="block-image position-relative">
        <div className="img-box rounded-3 overflow-hidden">
          <Link href={props.link || "#"} className="overly-images">
            <Image
              src={rawImage}
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
          <PriceData {...props} />
        </div>
      </div>
    </div>
  )
}

const CardStyle = memo((props) => {


  return (
    <div className="swiper-wrapper swiper-slide">
      <ProductBlock {...props} />
    </div>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;