import { FC, Fragment, memo } from "react";
import Link from 'next/link';
import Image from "next/image";


const TopTenCard = memo(({ link, image, countValue }) => {
  return (
    <Fragment>
      <div className="product-block rounded-2 ">
        <div className="block-image position-relative">
          <div className="img-box">
            <Link className="overly-images" href={link}>
              <Image
                src={image}
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
