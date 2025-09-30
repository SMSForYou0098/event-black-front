import { Fragment, memo } from "react";
import Link from "next/link";
import Image from "next/image";

const SaleTag = () => (
  <span className="bg-primary fs-6 position-relative p-1 me-2 rounded-3">
    On Sale!
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
                <span className="text-success fw-bold">Free</span>
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
              <div className="d-none d-sm-block">
              {props.on_sale && <SaleTag />}
              </div>
            </div>
          </div>
        )}
    </>
  );
};

const CardStyle = memo((props) => {
  return (
    <Fragment>
      <div className="iq-card card-hover">
        <div className="block-images position-relative">
          <div className="img-box">
            <Link
              href={props.link}
              className="position-absolute top-0 bottom-0 start-0 end-0"
            />
            {props.on_sale && (
              <span className="position-absolute top-0 end-0 m-2 z-index-1">
                <SaleTag />
              </span>
            )}
            <Image
              src={props?.image || 'https://placehold.co/500x400'}
              alt="movie-card"
              loading="lazy"
              width={180}
              height={270}
              className="img-fluid card-img"
            />
          </div>
          <div className="card-description with-transition p-0">
            <div className="cart-content">
              <div className="content-left">
                <h5 className="iq-title text-capitalize">
                  <Link href={props.link}>{props.title}</Link>
                </h5>
                <PriceData {...props} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="d-block d-sm-none card-mobile-description">
        <div className="cart-mobile-contents">
          <div className="content-left py-2">
            <h4 className="iq-title text-capitalize fw-bold">
              <Link href={props.link}>{props.title}</Link>
            </h4>
            <PriceData {...props} />
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;