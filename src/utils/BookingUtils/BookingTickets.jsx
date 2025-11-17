import React, { useCallback, useEffect, useState } from "react";
import CustomCounter from "../CustomCounter";
import { Table } from "react-bootstrap";
import CommonPricingComp from "../../components/Tickets/CommonPricingComp";
import { useMyContext } from "@/Context/MyContextProvider";

const BookingTickets = ({
    cartItems,
    isMobile,
    setSelectedTickets,
    selectedTickets,
    tax_data, // e.g. { id: 346, user_id: "9385", convenience_fee: "20", type: "percentage" }
}) => {

    const { getCurrencySymbol } = useMyContext();
    const [resetCounterTrigger, setResetCounterTrigger] = useState(0);

    const getTicketCount = useCallback(
        (quantity, category, price, id) => {
            setSelectedTickets(() => {
                // If quantity is 0, clear selection
                if (quantity === 0) return null;
                const round = (n) => +Number(n ?? 0).toFixed(2);
                // Per-unit base
                const baseAmount = round(price);

                

                // --- Convenience Fee (from tax_data) ---
                // Supports:
                //  - type: "percentage"  => per-unit fee = baseAmount * (fee/100)
                //  - type: "flat"/"fixed"/"amount" => per-unit fee = fee
                const feeRaw = Number(tax_data?.convenience_fee) || 0;
                const feeType = String(tax_data?.type || "").toLowerCase();

                let convenienceFee = 0;
                if (feeType === "percentage" || feeType === "percent") {
                    convenienceFee = round(baseAmount * (feeRaw / 100));
                } else if (["flat", "fixed", "amount"].includes(feeType)) {
                    convenienceFee = round(feeRaw);
                } else {
                    // default/fallback: no convenience fee
                    convenienceFee = 0;
                }
                // --- GST (kept as-is) ---
                const centralGST = round(convenienceFee * 0.09);
                const stateGST = round(convenienceFee * 0.09);
                const totalTax = round(centralGST + stateGST + convenienceFee);
                const finalAmount = round(baseAmount + totalTax);
                // Totals
                const totalBaseAmount = round(baseAmount * quantity);
                const totalCentralGST = round(centralGST * quantity);
                const totalStateGST = round(stateGST * quantity);
                const totalConvenienceFee = round(convenienceFee * quantity);
                const totalTaxTotal = round(
                    totalCentralGST + totalStateGST + totalConvenienceFee
                );
                const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);

                return {
                    id,
                    category,
                    quantity,
                    price: round(price),

                    // per-unit
                    baseAmount,
                    centralGST,
                    stateGST,
                    convenienceFee,
                    totalTax,
                    finalAmount,

                    // totals
                    totalBaseAmount,
                    totalCentralGST,
                    totalStateGST,
                    totalConvenienceFee,
                    totalTaxTotal,
                    totalFinalAmount,

                    // convenience
                    subTotal: round(price * quantity),
                    grandTotal: totalFinalAmount,
                };
            });
        },
        [setSelectedTickets, tax_data]
    );

    const getSubtotal = (item) => {
        const price = Number(item?.sale === 1 ? item?.sale_price : item?.price);
        const quantity = Number(selectedTickets?.quantity);
        if (
            quantity > 0 &&
            selectedTickets?.category === item.name &&
            selectedTickets?.id === item.id
        ) {
            return +(price * quantity).toFixed(2);
        }
        return 0;
    };

    return (
        <Table responsive className="cart-table rounded-4">
            <thead className="border-bottom">
                <tr>
                    <th scope="col" className="font-size-16 fw-500">
                        Title
                    </th>
                    <th
                        scope="col"
                        className={`font-size-16 fw-500 ${isMobile ? "text-end" : "text-center"}`}
                    >
                        Quantity
                    </th>
                    {!isMobile && (
                        <th scope="col" className="font-size-16 fw-500">
                            Subtotal
                        </th>
                    )}
                </tr>
            </thead>
            <tbody>
            {(() => {
  const activeItems = cartItems?.filter((item) => Number(item.status) === 1) || [];

  if (activeItems.length === 0) {
    return (
      <tr>
        <td colSpan={isMobile ? 2 : 3} className="text-center py-4 text-muted fw-semibold">
          No tickets available.
        </td>
      </tr>
    );
  }

  return activeItems.map((item) => (
    <tr key={item.id} data-item="list">
      <td>
        <span className="fw-500 d-flex flex-column justify-content-start">
          {item.name} 
          <span>
            Price:{" "}
            <CommonPricingComp
              currency={item?.currency}
              price={item?.price}
              isSale={item?.sale}
              salePrice={item?.sale_price}
              soldOut={item?.sold_out === 1}
              booking_not_open={item?.booking_not_open ===1}
              fast_filling={item?.fast_filling ===1}
            />
          </span>
        </span>
      </td>

      <td className={isMobile ? "text-end" : "text-center"}>
        <CustomCounter
          resetCounterTrigger={resetCounterTrigger}
          getTicketCount={getTicketCount}
          category={item.name}
          price={item?.sale === 1 ? item?.sale_price : item?.price}
          limit={10}
          ticketID={item.id}
          selectedTickets={selectedTickets}
          isDisable={item?.sold_out === 1 || item?.booking_not_open ===1}
        />
      </td>

      {!isMobile && (
        <td>
          <span className="fw-500">
            {item?.currency ? getCurrencySymbol(item.currency) : "₹"}
            {getSubtotal(item).toLocaleString("en-IN")}
          </span>
        </td>
      )}
    </tr>
  ));
})()}


            </tbody>
        </Table>
    );
};

export default BookingTickets;
