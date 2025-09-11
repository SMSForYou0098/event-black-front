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
        attendees: data?.attendees || [],  // attendee data
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
    updateAttendees: (state, action) => {
      const { key, attendees, merge = false } = action.payload;
      const existing = state.checkoutData[key];

      if (existing) {
        if (merge) {
          // append + dedupe
          const old = existing.attendees || [];
          const merged = [...old, ...attendees];
          existing.attendees = Array.from(new Set(merged.map(a => JSON.stringify(a))))
            .map(str => JSON.parse(str));
        } else {
          // replace
          existing.attendees = attendees;
        }
        existing.timestamp = Date.now();
      } else {
        state.checkoutData[key] = {
          attendees,
          ticket: null,
          event: null,
          timestamp: Date.now(),
        };
      }
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
  updateAttendees
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