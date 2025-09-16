import { Fragment, memo } from "react";

//react-router-dom
import Link from "next/link";

interface Props {
  link: string;
  watchlistLink: string;
  image: string;
  title: string;
  movieTime: string;
  lowest_ticket_price: number;
  lowest_sale_price: string;
  on_sale: string;
}
const SaleTag = () => (
  <span className="onsale bg-primary fs-6 position-relative p-1 me-2">
    Sale!
  </span>
);
const CardStyle = memo((props: Props) => {
  return (
    <Fragment>
      <div className="iq-card card-hover">
        <div className="block-images position-relative w-100">
          <div className="img-box w-100">
            <Link
              href={props.link}
              className="position-absolute top-0 bottom-0 start-0 end-0"
            />
            {props.on_sale && (
              <span
                className="onsale bg-primary position-absolute p-1"
                style={{ top: "10px", left: "10px", zIndex: 2 }}
              >
                Sale!
              </span>
            )}
            <img
              src={props.image}
              alt="movie-card"
              className="img-fluid object-cover w-100 d-block border-0"
            />
          </div>
          <div className="card-description with-transition">
            <div className="cart-content">
              <div className="content-left">
                <h5 className="iq-title text-capitalize">
                  {props.on_sale && (
                    <span className="onsale bg-primary fs-6 position-relative p-1 me-2">
                      Sale!
                    </span>
                  )}
                  <Link href={props.link}>{props.title}</Link>
                </h5>
                <div className="movie-time d-flex align-items-center my-2">
                  <span className="movie-time-text font-normal">
                    {props.movieTime}
                  </span>
                </div>
                {props.lowest_ticket_price !== undefined &&
                  props.lowest_ticket_price !== null && (
                    <div className="movie-price">
                      {props.lowest_ticket_price === 0 ? (
                        <span className="text-success fw-bold">Free</span>
                      ) : props.on_sale &&
                        Number(props.lowest_sale_price) <
                        props.lowest_ticket_price ? (
                        <div className="d-flex align-items-center gap-2">
                          <del className="text-muted">
                            ₹{props.lowest_ticket_price}
                          </del>
                          <span className="fw-bold">
                            ₹{props.lowest_sale_price}
                          </span>
                        </div>
                      ) : (
                        <span className="fw-bold">
                          ₹{props.lowest_ticket_price}
                        </span>
                      )}
                    </div>
                  )}
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
                        <span className="fw-bold">
                          ₹{props.lowest_sale_price}
                        </span>
                      </div>
                    ) : (
                      <span className="fw-bold">
                        ₹{props.lowest_ticket_price}
                      </span>
                    )}
                    {props.on_sale && (
                      <SaleTag/>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;
