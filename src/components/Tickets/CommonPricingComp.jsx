import React from "react";
import { useMyContext } from "@/Context/MyContextProvider";

const CommonPricingComp = ({ currency, isSale, price, salePrice }) => {
  const { getCurrencySymbol } = useMyContext();

  const symbol = (typeof getCurrencySymbol === "function" ? getCurrencySymbol(currency) : "") || "";
  const p = Number(price);
  const sp = Number(salePrice);

  const fmt = (val) =>
    Number.isFinite(val) ? val.toLocaleString("en-IN") : "";

  if (isSale === 1 && Number.isFinite(sp)) {
    return (
        <span>
        {isSale === 1 ? (
          <>
            <span
              className="mb-0 text-muted me-1"
              style={{ textDecorationLine: "line-through" }}
            >
              {`${getCurrencySymbol(currency)}${price}`}
            </span>
            <span className="mb-0">
              {`${getCurrencySymbol(currency)}${salePrice}`}
            </span>
          </>
        ) : (
          `${getCurrencySymbol(currency)}${price}`
        )}
      </span>
      
    );
  }

  return <span>{`${symbol}${fmt(p)}`}</span>;
};

export default CommonPricingComp;
