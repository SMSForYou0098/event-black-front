import { useState, useEffect } from 'react';
import {  getBreakdownData } from './checkout_utils';


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

const calculateTotal = (orderData) => 
  orderData?.baseAmount + orderData?.cgst + orderData?.sgst + orderData?.convenienceFees;
export const useOrderCalculations = (orderData) => {
  const calculatedTotal = calculateTotal(orderData);
  const breakdownData = getBreakdownData(orderData);
  
  return { calculatedTotal, breakdownData };
};
