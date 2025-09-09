import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { 
  storeCheckoutData, 
  clearCheckoutData, 
  clearExpiredCheckoutData,
  selectCheckoutDataByKey,
  selectCheckoutDataExists
} from '@/store/customSlices/checkoutDataSlice';
import { generateUUIDKey, isValidCheckoutKey } from '../utils/checkoutUtils';

export const useCheckoutDataByKey = (key) => {
  return useSelector(state => selectCheckoutDataByKey(state, key));
};
export const useCheckoutData = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentCheckoutKey, setCurrentCheckoutKey] = useState(null);

  // Clean up expired checkout data on mount
  useEffect(() => {
    dispatch(clearExpiredCheckoutData());
  }, [dispatch]);

  // Store checkout data and get key
  const storeData = (data) => {
    const key = generateUUIDKey();
    console.log('📦 Storing checkout data for key:', key,data );
    dispatch(storeCheckoutData({
      key,
      data
    }));
    
    setCurrentCheckoutKey(key);
    return key;
  };

  // Check if checkout data exists for a key
  const checkoutDataExists = (key) => {
    return useSelector(state => selectCheckoutDataExists(state, key));
  };

  // Retrieve checkout data by key
  const getCheckoutData = (key) => {
    if (!isValidCheckoutKey(key)) {
      console.warn('Invalid checkout key format:', key);
      return null;
    }
    console.log('🔍 Retrieving checkout data for key:', key);
   const checkoutData = useCheckoutDataByKey(key);
   console.log('✅ Found checkout data:', checkoutData);
    return checkoutData;

  };

  
  // Navigate to checkout with key
  const navigateToCheckout = (pathname, key) => {
    if (!isValidCheckoutKey(key)) {
      console.error('Cannot navigate with invalid checkout key:', key);
      return;
    }
    
    router.push({
      pathname,
      query: { k: key }
    });
  };

  // Get checkout data from current route
  const getCheckoutDataFromRoute = () => {
    if (router.isReady) {
      const { k } = router.query;
      if (k && isValidCheckoutKey(k)) {
        return useSelector(state => selectCheckoutDataByKey(state, k));
      }
    }
    return null;
  };

  // Clear checkout data by key
  const clearData = (key) => {
    if (!isValidCheckoutKey(key)) {
      console.warn('Cannot clear data with invalid key:', key);
      return;
    }
    
    dispatch(clearCheckoutData({ key }));
    if (currentCheckoutKey === key) {
      setCurrentCheckoutKey(null);
    }
    console.log('🗑️ Cleared checkout data for key:', key);
  };

  return {
    storeCheckoutData: storeData,
    getCheckoutData,
    checkoutDataExists,
    navigateToCheckout,
    getCheckoutDataFromRoute,
    clearCheckoutData: clearData,
    currentCheckoutKey
  };
};