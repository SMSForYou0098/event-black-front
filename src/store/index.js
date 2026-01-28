import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createTransform } from 'redux-persist';

import settingReducer from './setting/reducers';
import streamitReducer from './streamit/reducers';
import streamitShop from './shop/reducers';
import streamitMedia from './media/reducers';
import { authSlice } from './auth/authSlice';
import checkoutDataReducer from './customSlices/checkoutDataSlice';

// Transform to clean checkoutData before persisting
const checkoutDataTransform = createTransform(
    // Transform state before persisting (inbound)
    (inboundState, key) => {
        if (key === 'checkoutData') {
            // Type assertion to fix TypeScript error
            const state = inboundState;

            // Clean the data to ensure it's serializable
            const cleanedData = {};

            if (state && state.checkoutData) {
                Object.keys(state.checkoutData).forEach(dataKey => {
                    const item = state.checkoutData[dataKey];
                    if (item) {
                        cleanedData[dataKey] = {
                            data: JSON.parse(JSON.stringify(item.data || {})),
                            ticket: JSON.parse(JSON.stringify(item.ticket || {})),
                            event: JSON.parse(JSON.stringify(item.event || {})),
                            timestamp: Number(item.timestamp) || Date.now(),
                        };
                    }
                });
            }

            return { checkoutData: cleanedData };
        }
        return inboundState;
    },
    // Transform state after rehydrating (outbound)
    (outboundState, key) => {
        return outboundState;
    },
    // Only apply this transform to checkoutData
    { whitelist: ['checkoutData'] }
);

// Transform to expire auth session after 24 hours
const authExpirationTransform = createTransform(
    // inbound (before persisting)
    (inboundState, key) => {
        return inboundState;
    },
    // outbound (after rehydrating)
    (outboundState, key) => {
        if (key === 'auth' && outboundState.lastLogin) {
            const twentyFourHours = 2 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            if (now - outboundState.lastLogin > twentyFourHours) {
                // Session expired
                return {
                    ...outboundState,
                    token: null,
                    user: null,
                    session_id: null,
                    auth_session: null,
                    isImpersonating: false,
                    lastLogin: null
                };
            }
        }
        return outboundState;
    },
    { whitelist: ['auth'] }
);

// 1. Combine Reducers
const rootReducer = combineReducers({
    setting: settingReducer,
    streamit: streamitReducer,
    shop: streamitShop,
    media: streamitMedia,
    auth: authSlice.reducer,
    checkoutData: checkoutDataReducer,
});

// 2. Persist Config
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'setting', 'checkoutData'], // Added checkoutData back
    transforms: [checkoutDataTransform, authExpirationTransform], // Added auth expiration transform
};

// 3. Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Make Store
export const makeStore = () => {
    const store = configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                    // Added paths to ignore serialization checks
                    ignoredPaths: ['checkoutData', '_persist'],
                },
            }),
    });

    // Create persistor and attach to store
    store.__persistor = persistStore(store);

    return store;
};

// 5. Create store instance
const store = makeStore();
const persistor = store.__persistor;

// 6. Export direct store and persistor (no wrapper needed with persist)
export { store, persistor };

// 7. Helper functions for type safety (optional)
export const getStoreState = () => store.getState();
export const getStoreDispatch = () => store.dispatch;