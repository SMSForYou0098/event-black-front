import { logout } from '@/store/auth/authSlice';
import { AppStore } from '@/store';
import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_PATH;

// --- Public API Instance ---
// Use this for requests that DO NOT need authentication (e.g., login, signup, verify-user).
export const publicApi: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Protected API Instance ---
// Use this for all requests that need an authentication token.
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- Interceptor Setup ---
// This function adds the interceptors ONLY to the protected `api` instance.
export const setupInterceptors = (store: AppStore) => {
  // Request Interceptor: Adds the auth token to headers
  api.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Handles 401 Unauthorized and other common errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401) {
        console.warn('Unauthorized request. Logging out...');
        store.dispatch(logout());
      } else if (status === 429) {
        console.error('Too many requests, please try again later.');
        // Consider dispatching an action to show a notification to the user
      }

      return Promise.reject(error);
    }
  );
};

