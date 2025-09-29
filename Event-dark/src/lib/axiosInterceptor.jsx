import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, signIn } from '@/store/auth/authSlice';
import axios from 'axios';
import { store } from "@/store"; // your Redux store

const baseURL = process.env.NEXT_PUBLIC_API_PATH || 'https://jsonplaceholder.typicode.com';

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
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Unauthorized → log out
      store.dispatch(logout());
    } else if (status === 429) {
      // Too Many Requests → notify user
      console.error("Too many requests, please try again later.");
      // You can also trigger a toast or global error handler
      // e.g. showToast("Too many requests, please slow down.");
    }
    return Promise.reject(error);
  }
);
