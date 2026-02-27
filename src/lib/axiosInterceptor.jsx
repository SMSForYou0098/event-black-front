import { logout } from '@/store/auth/authSlice';
import axios from 'axios';
import { store } from "@/store"; // your Redux store
import toast from 'react-hot-toast';

const baseURL = process.env.NEXT_PUBLIC_API_PATH || 'https://jsonplaceholder.typicode.com';

// Prevent duplicate logout calls if multiple 401s fire at once
let isLoggingOut = false;

// Public API instance
export const publicApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PATH,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to each request
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token; // read token from Redux state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized + rate-limit responses
api.interceptors.response.use(
  (response) => {
    // ✅ Any successful response resets the logout guard.
    // This is critical for the re-login flow:
    // after a 401 + re-login, the next successful API call clears isLoggingOut
    // so future 401s (real session expiry) are handled correctly.
    isLoggingOut = false;
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Only treat as a real session expiry if the request actually carried a token.
      // If there was no token in the store, the 401 is because the request was
      // sent without credentials (e.g. invalid/undefined ticket ID to a protected
      // endpoint). In that case, do NOT blow away the user session.
      const hadToken = !!store.getState().auth.token;

      if (!isLoggingOut && hadToken) {
        isLoggingOut = true;

        // ✅ Logout: clears Redux token, localStorage, sessionStorage, and all cookies
        store.dispatch(logout());

        if (typeof window !== 'undefined') {
          toast.error('Your session has expired. Please log in again.', {
            duration: 3000,
            id: 'session-expired',
          });

          // Redirect after toast so the user can read it
          setTimeout(() => {
            isLoggingOut = false;
            window.location.href = '/';
          }, 1500);
        }
      }
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down and try again.', {
        id: 'rate-limit',
      });
    }

    return Promise.reject(error);
  }
);

