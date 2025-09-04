import React, { useState } from "react";
import CustomCounter from "../CustomCounter";
import { Table } from "react-bootstrap";
import CommonPricingComp from "../../components/Tickets/CommonPricingComp";
import { ChevronDown, ChevronUp } from "lucide-react";

const BookingTickets = ({ cartItems, onQuantityChange, isMobile }) => {
  // Subtotal should be calculated per item inside the map
  const [expandedId, setExpandedId] = useState(null);
  const [resetCounterTrigger, setResetCounterTrigger] = useState(0);
    const [selectedTicketID, setSelectedTicketID] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState({});

  const getTicketCount = (quantity, category, price, id) => {
    if (selectedTicketID && selectedTicketID !== id && quantity > 0) {
      setResetCounterTrigger((prev) => prev + 1);
    }
    setSelectedTicketID(id);
    setSelectedTickets({ category, quantity, price, id });
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
                    price={item.price}
                    salePrice={item.sale_price}
                    currency={item.currency}
                  />
                </span>
              </span>
              {/* <span className="d-flex">
                <span
                  className="know-more"
                  style={{
                    color: "#e53935",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                  onClick={() => handleToggle(item.id)}
                >
                  {expandedId === item.id ? "Know less" : "Know more"}
                  <ChevronDown
                    size={16}
                    style={{
                      marginLeft: 4,
                      transition: "transform 0.2s",
                      transform:
                        expandedId === item.id
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                </span>
                {expandedId === item.id && (
                  <span
                    className="mt-2"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </span> */}
            </td>
            <td className={isMobile ? "text-end" : ""}>
              <CustomCounter
                resetCounterTrigger={resetCounterTrigger}
                getTicketCount={getTicketCount}
                category={item.name}
                price={item?.sale === 1 ? item?.sale_price : item?.price}
                limit={10}
                ticketID={item.id}
              />
            </td>
            {!isMobile && (
              <td>
                <span className="fw-500">
                  ${(item.price * item.quantity).toFixed(2)}
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
