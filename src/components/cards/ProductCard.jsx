import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import 'sweetalert2/src/sweetalert2.scss'
import { PriceData, ProductBlock } from "./CardStyle";

const ProductCard = memo((props) => {
  const isSale = props.on_sale;
  const isNew = props.is_new;

  return (
    // <>
    //   <div className="product-block">
    //     {props?.message ? <span className="onsale bg-primary rounded-3 fw-light h6">{props?.message}</span> :
    //       isSale ? (
    //         <span className="onsale bg-primary rounded-3 fw-light h6">Sale!</span>
    //       ) : isNew ? (
    //         <span className="onsale bg-primary rounded-3 fw-light h6">New!</span>
    //       ) : (
    //         ""
    //       )}
    //     <div className="image-wrap block-images position-relative w-100">

    //       {/* ✅ House Full Stamp - Top Right Corner */}
    //       {props?.houseFull && (
    //         <>
    //           {/* semi-transparent dark overlay */}
    //           <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded-3 z-2" style={{ pointerEvents: "none" }}></div>

    //           {/* fully booked stamp - top right */}
    //           <Image
    //             src="/assets/images/hfull.webp"
    //             alt="Fully booked"
    //             width={80}
    //             height={80}
    //             className="position-absolute top-0 end-0 shadow-lg z-3"
    //             style={{
    //               transform: "rotate(-15deg)",
    //               margin: "11px",
    //               pointerEvents: "none",
    //               objectFit: "contain"
    //             }}
    //           />
    //         </>
    //       )}

    //       <Link href={props?.link || "#"}>
    //         <div className="product-image rounded-3 overflow-hidden">
    //           <Image
    //             src={props.thumbnail || "/assets/images/no-banner.jpg"}
    //             alt={props?.product_name || "Product"}
    //             width={400}
    //             height={300}
    //             className="img-fluid w-100"
    //             loading="lazy"
    //           />
    //         </div>
    //       </Link>
    //     </div>

    //     {
    //       !props?.imageOnly &&
    //       <PriceData {...props} />
    //     }
    //   </div>
    // </>
    <ProductBlock {...props} />

  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;