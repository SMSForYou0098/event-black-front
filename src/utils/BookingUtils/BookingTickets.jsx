import React, { useCallback, useEffect, useState } from "react";
import CustomCounter from "../CustomCounter";
import { Table } from "react-bootstrap";
import CommonPricingComp from "../../components/Tickets/CommonPricingComp";
import { useMyContext } from "@/Context/MyContextProvider";

const BookingTickets = ({
    cartItems,
    isMobile,
    setSelectedTickets,
    selectedTickets
}) => {
  
    const { getCurrencySymbol } = useMyContext();
    const [resetCounterTrigger, setResetCounterTrigger] = useState(0);

    const getTicketCount = useCallback((quantity, category, price, id) => {
        setSelectedTickets(() => {
            // If quantity is 0, clear selection
            if (quantity === 0) return null;
      
            const round = (n) => +Number(n ?? 0).toFixed(2);
      
            // Per-unit
            const baseAmount = round(price);
            const centralGST = round(baseAmount * 0.09);
            const stateGST = round(baseAmount * 0.09);
            const convenienceFee = round(baseAmount * 0.01);
            const totalTax = round(centralGST + stateGST + convenienceFee);
            const finalAmount = round(baseAmount + totalTax);
      
            // Totals
            const totalBaseAmount = round(baseAmount * quantity);
            const totalCentralGST = round(centralGST * quantity);
            const totalStateGST = round(stateGST * quantity);
            const totalConvenienceFee = round(convenienceFee * quantity);
            const totalTaxTotal = round(totalCentralGST + totalStateGST + totalConvenienceFee);
            const totalFinalAmount = round(totalBaseAmount + totalTaxTotal);
      
            // Single object (not inside an array)
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
    }, [setSelectedTickets]);

    const getSubtotal = (item) => {
        const price = Number(item?.sale === 1 ? item?.sale_price : item?.price);
        const quantity = Number(selectedTickets?.quantity);
        if (quantity > 0 && selectedTickets?.category === item.name && selectedTickets?.id === item.id) {
            return price * quantity;
        }
        return 0;
    };

    return (
        <Table responsive className="cart-table rounded-4">
            <thead className="border-bottom">
                <tr>
                    <th scope="col" className="font-size-18 fw-500">
                        Title
                    </th>
                    <th
                        scope="col"
                        className={`font-size-18 fw-500 ${isMobile ? "text-end" : ""}`}
                    >
                        Quantity
                    </th>
                    {!isMobile && (
                        <th scope="col" className="font-size-18 fw-500">
                            Subtotal
                        </th>
                    )}
                </tr>
            </thead>
            <tbody>
                {cartItems.map((item) => (
                    <tr key={item.id} data-item="list">
                        <td>
                            <span className="fw-500 d-flex flex-column justify-content-start">
                                {item.name}
                                <span>
                                    Price :{" "}
                                    <CommonPricingComp
                                        currency={item?.currency}
                                        price={item?.price}
                                        isSale={item?.sale}
                                        salePrice={item?.sale_price}
                                    />
                                </span>
                            </span>
                        </td>
                        <td className={isMobile ? "text-end" : ""}>
                            <CustomCounter
                                resetCounterTrigger={resetCounterTrigger}
                                getTicketCount={getTicketCount}
                                category={item.name}
                                price={item?.sale === 1 ? item?.sale_price : item?.price}
                                limit={10}
                                ticketID={item.id}
                                selectedTickets={selectedTickets}
                            />
                        </td>
                        {!isMobile && (
                            <td>
                                <span className="fw-500">
                                    {item.currency !== "undefined"
                                        ? getCurrencySymbol(item.currency)
                                        : "₹"}
                                    {getSubtotal(item)}
                                </span>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default BookingTickets;