import { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import 'sweetalert2/src/sweetalert2.scss'

const ProductCard = memo((props) => {
  const isSale = props.on_sale;
  const isNew = props.is_new;
  return (
    <>
      <div className="product-block card-hover">
        {isSale ? (
          <span className="onsale bg-primary">Sale!</span>
        ) : isNew ? (
          <span className="onsale bg-primary">New!</span>
        ) : (
          ""
        )}
        <div className="image-wrap block-images position-relative w-100">

          {/* ✅ House Full Stamp - Top Right Corner */}
          {props?.houseFull && (
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

          <Link href={props?.link || ""}>
            <div className="product-image">
              <Image
                src={props.thumbnail}
                alt={props?.product_name || "Product"}
                width={400}
                height={300}
                className="img-fluid w-100 rounded-3"
                loading="lazy"
              />
            </div>
          </Link>
        </div>

        {
          !props?.imageOnly && 
          <div className="product-caption">
            <p className="fs-6 my-0 fw-bold">
              <Link
                href={props?.link || ''}
                className="title-link"
              >
                {props?.product_name}
              </Link>
            </p>
            <span>{props?.city}</span>
            <div className="">
              <span className="fs-6 price" >
                {
                  !props?.noPrice && 
                  <>
                    {props.lowest_ticket_price === 0 ? (
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
                          ₹{props.lowest_ticket_price}
                        </span>
                        <span className="ms-2">onwards</span>
                      </>
                    )}
                  </>
                }
              </span>
            </div>
            <div className="container-rating">
              <div className="star-rating text-primary">
                {/* <RatingStar count={props.rating} count1={props.count1} starColor="text-warning" /> */}
              </div>
            </div>
          </div>
        }
      </div>
    </>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;