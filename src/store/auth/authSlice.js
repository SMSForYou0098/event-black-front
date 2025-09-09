import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const initialState = {
  loading: false,
  message: '',
  showMessage: false,
  twoFactor: false,
  redirect: '',
  user: null,
  token: null,
  session_id: null,
  auth_session: null,
  isImpersonating: false,
};

const api = process.env.NEXT_PUBLIC_API_PATH;

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (data, { rejectWithValue }) => {
    try {
      const { password, number, passwordRequired, session_id, auth_session, otp } = data;
      const response = await axios.post(`${api}login`, {
        password,
        number,
        passwordRequired,
        session_id,
        auth_session,
        otp
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.emailError ? err.response.data.emailError :
        err.response?.data?.message ? err.response.data.message :
        err.response?.data?.error ? err.response.data.error :
        err.response?.data?.passwordError ? err.response.data.passwordError :
        err.response?.data?.ipAuthError ? err.response.data.ipAuthError :
        'Server Error'
      );
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticated: (state, action) => {
      state.loading = false;
      state.redirect = '/';
      state.token = action.payload.token || '';
      state.session_id = action.payload.session_id || null;
      state.user = action.payload.user;
      state.auth_session = action.payload.auth_session || null;
      state.isImpersonating = action.payload.isImpersonating || false;
    },

    showAuthMessage: (state, action) => {
      state.message = action.payload;
      state.showMessage = true;
      state.loading = false;
    },
    
    hideAuthMessage: (state) => {
      state.message = '';
      state.showMessage = false;
    },
    
    logout: (state, action) => {
      state.loading = false;
      state.token = null;
      state.user = null;
      state.redirect = '/login';
      state.twoFactor = false;
      state.session_id = null;
      state.auth_session = null;
      state.isImpersonating = false;
      
      // ✅ Clear localStorage
      localStorage.clear();

      // ✅ Clear sessionStorage
      sessionStorage.clear();

      // ✅ Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          permissions: state.user.permissions, // Preserve permissions
        };
      }
    },
    
    validateTwoFector: (state) => {
      state.twoFactor = false;
    },
    
    showLoading: (state) => {
      state.loading = true;
    },
    
    signInSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        if (action.payload?.user?.two_fector_auth === 'true') {
          state.twoFactor = true;
        }
        state.loading = false;
        state.token = action.payload.token || null;
        state.user = action.payload.user;
        // ✅ Store session details
        state.session_id = action.payload.session_key || null;
        state.auth_session = action.payload.user?.id?.toString() || null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.message = action.payload;
        state.showMessage = true;
        state.loading = false;
      });
  },
});

export const {
  authenticated,
  showAuthMessage,
  hideAuthMessage,
  showLoading,
  logout,
  updateUser,
  validateTwoFector,
  signInSuccess
} = authSlice.actions;

export default authSlice.reducer;