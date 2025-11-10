import React from "react";
import { useMyContext } from "@/Context/MyContextProvider";

const CommonPricingComp = ({ currency, isSale, price, salePrice, soldOut }) => {
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
      {
        soldOut && <p className="text-primary p-0 m-0">Sold Out</p>
      }
    </>
  );
};

export default CommonPricingComp;
