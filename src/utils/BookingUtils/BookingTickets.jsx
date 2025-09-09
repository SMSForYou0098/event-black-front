import React, { useState } from "react";
import CustomCounter from "../CustomCounter";
import { Table } from "react-bootstrap";
import CommonPricingComp from "../../components/Tickets/CommonPricingComp";
import { useMyContext } from "@/Context/MyContextProvider";

const BookingTickets = ({ cartItems, onQuantityChange, isMobile }) => {
    const { getCurrencySymbol } = useMyContext();
    const [expandedId, setExpandedId] = useState(null);
    const [resetCounterTrigger, setResetCounterTrigger] = useState(0);
    const [selectedTicketID, setSelectedTicketID] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState({});

    const getSubtotal = (item) => {
        const price = Number(item?.sale === 1 ? item?.sale_price : item?.price);
        const quantity = Number(selectedTickets?.quantity);
        if (quantity > 0 && selectedTickets?.category === item.name) {
            return price * quantity;
        }
        return 0;
    };

    const getTicketCount = (quantity, category, price, id) => {
        const numQuantity = Number(quantity);
        const numPrice = Number(price);
        const subtotal = numQuantity > 0 ? numPrice * numQuantity : 0;
        if (selectedTicketID && selectedTicketID !== id && quantity > 0) {
            setResetCounterTrigger((prev) => prev + 1);
        }
        setSelectedTicketID(id);
        onQuantityChange(id, numQuantity, subtotal);
        setSelectedTickets({ category, quantity: numQuantity, price: numPrice, id, subtotal });
    };

    //   const handleToggle = (id) => {
    //     setExpandedId(expandedId === id ? null : id);
    //   };

    return (
        <Table responsive className="cart-table">
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
