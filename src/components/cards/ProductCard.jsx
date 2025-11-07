import { memo, useState } from "react";

// react-router-link
// import { Link } from "react-router-dom";
import Link from "next/link";


//components
// import RatingStar from "../rating-star";

//sweetalert2 
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
          <Link href={props?.link || ''}>
            <div className="product-image">
              <img
                src={props.thumbnail}
                className="img-fluid w-100 rounded-3"
                alt=""
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
              {/* <del>{props.price}</del>
              {props.final_price} */}
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

      {/* <ProductModal show={show} handleClose={handleClose} /> */}
    </>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
