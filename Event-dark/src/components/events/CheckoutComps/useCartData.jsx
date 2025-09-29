import { useState, useEffect } from "react";
import { getBreakdownData } from "./checkout_utils";

export const useCartData = (data, ticket) => {
  const [validatedData, setValidatedData] = useState({
    data: null,
    ticket: null,
  });

  useEffect(() => {
    if (data && ticket) {
      setValidatedData(parseUrlData(data, ticket));
    }
  }, [data, ticket]);

  return validatedData;
};
export const useOrderCalculations = (selectedTickets,ticket) => {
  const quantity = selectedTickets?.newQuantity || 0;
  const price = ticket?.price || 0;
  const calculatedTotal = quantity * price;

  return { calculatedTotal };
};
