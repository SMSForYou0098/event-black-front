import React from "react";
import { useMyContext } from "@/Context/MyContextProvider";
import { Badge } from "react-bootstrap";
import CustomBadge from "../../utils/ProfileUtils/getBadgeClass";
import { CheckCircle, RiseOutlined } from "lucide-react";

const CommonPricingComp = ({ currency, isSale, price, salePrice, soldOut, booking_not_open = false, fast_filling = false }) => {
  const { getCurrencySymbol } = useMyContext();

  const symbol =
    (typeof getCurrencySymbol === "function" ? getCurrencySymbol(currency) : "") || "";

  const p = Number(price);
  const sp = Number(salePrice);

  const fmt = (val) => (Number.isFinite(val) ? val.toLocaleString("en-IN") : "");
  const onSale = isSale === 1 && Number.isFinite(sp);

  return (
    <>
      {onSale ? (
        <>
          <span
            className="mb-0 text-muted me-1"
            style={{ textDecorationLine: "line-through" }}
          >
            {`${symbol}${fmt(p)}`}
          </span>
          <span className="mb-0">{`${symbol}${fmt(sp)}`}</span>
        </>
      ) : (
        `${symbol}${fmt(p)}`
      )}
      {soldOut && (
        <CustomBadge
          variant="outline-primary"
          className="py-0 ms-2 px-2 d-inline-flex align-items-center"
          style={{ lineHeight: 2 }}
        >
          <CheckCircle size={14} className="me-1" />
          <span className="small">Sold Out</span>
        </CustomBadge>
      )}

      {booking_not_open && (

        <CustomBadge
          variant="outline-warning"
          className="py-0 ms-2 px-2 d-inline-flex align-items-center"
          style={{ lineHeight: 2 }}
        >
          <CheckCircle size={14} className="me-1" />
          <span className="small">Booking Not Open</span>
        </CustomBadge>
      )}

      {fast_filling && (
        <CustomBadge
          variant="outline-danger"
          className="py-0 px-2 ms-2 d-inline-flex align-items-center"
          style={{ lineHeight: 2 }}
        >
          <RiseOutlined size={14} className="me-1" />
          <span className="small">Fast Filling</span>
        </CustomBadge>
      )}

    </>
  );
};

export default CommonPricingComp;
