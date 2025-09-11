import { removeCookie, setCookie } from '@/utils/cookieUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  checkoutData: {}, // { key: { data, ticket, edata, timestamp } }
};

const checkoutDataSlice = createSlice({
  name: 'checkoutData',
  initialState,
  reducers: {
    storeCheckoutData: (state, action) => {
      const { key, data } = action.payload;
      state.checkoutData[key] = {
        data : data?.data,
        ticket: data?.ticket,
        event: data?.edata,
        timestamp: Date.now(),
      };
      // storeCheckoutData in cookie for 7 days
      setCookie(`checkoutDataKey_${key}`, key, { days: 7 });
    },
    retrieveCheckoutData: (state, action) => {
      return state.checkoutData[action.payload] || null;
    },
    clearCheckoutData: (state, action) => {
      const { key } = action.payload;
      delete state.checkoutData[key];
      // Remove cookie
      removeCookie(`checkoutDataKey_${key}`);
    },
    clearExpiredCheckoutData: (state) => {
      const now = Date.now();
      const expiredKeys = Object.keys(state.checkoutData).filter(
        key => now - state.checkoutData[key].timestamp > 3600000 // 1 hour
      );
      expiredKeys.forEach(key => {
        delete state.checkoutData[key];
      });
    },
    clearAllCheckoutData: (state) => {
      state.checkoutData = {};
    },
  },
});

export const {
  storeCheckoutData,
  retrieveCheckoutData,
  clearCheckoutData,
  clearExpiredCheckoutData,
  clearAllCheckoutData,
} = checkoutDataSlice.actions;

export default checkoutDataSlice.reducer;

// Selectors
export const selectCheckoutDataByKey = (state, key) => {
  return state.checkoutData.checkoutData[key] || null;
}

export const selectAllCheckoutData = (state) =>
  state.checkoutData.checkoutData;

export const selectCheckoutDataExists = (state, key) =>
  !!state.checkoutData.checkoutData[key];