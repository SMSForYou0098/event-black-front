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

import settingReducer from './setting/reducers';
import streamitReducer from './streamit/reducers';
import streamitShop from './shop/reducers';
import streamitMedia from './media/reducers';
import { authSlice } from './auth/authSlice';
import checkoutDataReducer from './customSlices/checkoutDataSlice'; 
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
    whitelist: ['auth', 'setting'], // only this will be persisted
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
                },
            }),
    });

    // Create persistor and attach to store (for _app.tsx)
    (store as any).__persistor = persistStore(store);

    return store;
};

// 5. Types
export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export const store = makeStore();

export const persistor = (store as any).__persistor;


// 6. Wrapper
export const wrapperStore = createWrapper<AppStore>(makeStore);
