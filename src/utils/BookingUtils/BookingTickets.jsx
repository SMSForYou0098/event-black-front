import React, { useCallback, useEffect, useState } from "react";
import CustomCounter from "../CustomCounter";
import { Table, Accordion } from "react-bootstrap";
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
  const [expandedTicket, setExpandedTicket] = useState(null);

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
        // --- GST (calculated without intermediate rounding for precision) ---
        const centralGST = convenienceFee * 0.09;
        const stateGST = convenienceFee * 0.09;
        const totalTax = centralGST + stateGST + convenienceFee;
        const finalAmount = baseAmount + totalTax;

        // Totals (calculated without intermediate rounding)
        const totalBaseAmount = baseAmount * quantity;
        const totalCentralGST = centralGST * quantity;
        const totalStateGST = stateGST * quantity;
        const totalConvenienceFee = convenienceFee * quantity;
        const totalTaxTotal = totalCentralGST + totalStateGST + totalConvenienceFee;
        const totalFinalAmount = totalBaseAmount + totalTaxTotal;

        return {
          id,
          category,
          quantity,
          price: round(price),

          // per-unit (rounded for display)
          baseAmount: round(baseAmount),
          centralGST: round(centralGST),
          stateGST: round(stateGST),
          convenienceFee: round(convenienceFee),
          totalTax: round(totalTax),
          finalAmount: round(finalAmount),

          // totals (rounded for display)
          totalBaseAmount: round(totalBaseAmount),
          totalCentralGST: round(totalCentralGST),
          totalStateGST: round(totalStateGST),
          totalConvenienceFee: round(totalConvenienceFee),
          totalTaxTotal: round(totalTaxTotal),
          totalFinalAmount: round(totalFinalAmount),

          // convenience
          subTotal: round(price * quantity),
          grandTotal: round(totalFinalAmount),
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
            <tr
              key={item.id}
              data-item="list"
            >
              <td>
                <span className="fw-500 d-flex flex-column justify-content-start">
                  <span className="d-flex align-items-center gap-2">
                    {item.name}
                  </span>
                  <span>
                    Price:{" "}
                    <CommonPricingComp
                      currency={item?.currency}
                      price={item?.price}
                      isSale={item?.sale}
                      salePrice={item?.sale_price}
                      soldOut={item?.sold_out === true}
                      booking_not_open={item?.booking_not_open === true}
                      fast_filling={item?.fast_filling === true}
                    />
                  </span>

                  {/* Know More Button */}
                  {item.description && (
                    <button
                      className="btn btn-link p-0 mt-2 text-start text-decoration-none"
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTicket(expandedTicket === item.id ? null : item.id);
                      }}
                    >
                      {expandedTicket === item.id ? (
                        <>
                          <i className="bi bi-chevron-up me-1"></i>
                          Show Less
                        </>
                      ) : (
                        <>
                          <i className="bi bi-chevron-down me-1"></i>
                          Know More
                        </>
                      )}
                    </button>
                  )}

                  {/* Inline Description */}
                  {item.description && expandedTicket === item.id && (
                    <span
                      className="mt-2 fw-100 text-light small"
                      style={{
                        animation: 'fadeIn 0.3s ease-in-out',
                        display: 'block',
                        fontWeight: '300'
                      }}
                    >
                      {/* <strong className="d-block mb-1">Description:</strong> */}
                      {item.description}
                    </span>
                  )}
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
                  isDisable={item?.sold_out === 1 || item?.booking_not_open === 1}
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
