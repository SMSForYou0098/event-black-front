import { Fragment, memo } from "react";

//react-router-dom
// import { Link } from "react-router-dom";
import Link from "next/link";

const ShopSectionSlider = memo((props) => {
  return (
    <Fragment>
      <div className="category-inner position-relative">
        <div className="category_image">
          <Link href={`/merchandise/shop`}>
            <img src={props.shopsellingImg} className="img-fluid" alt="" />
          </Link>
          <div className="category-details">
            <h5 className="category-title">
              <Link href={`/merchandise/shop`}>{props.shopsellingText}</Link>
            </h5>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

ShopSectionSlider.displayName = "ShopSectionSlider";
export default ShopSectionSlider;
