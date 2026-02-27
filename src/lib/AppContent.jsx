import React, { useCallback, useEffect, useRef } from 'react'
import { useMyContext } from '../Context/MyContextProvider';
import { useDispatch, useSelector } from 'react-redux';
import PushNotificationButton from './PushNotificationButton';
import { checkAndClearSessionData } from './checkAndClearSessionData';
import { logout, updateActivity } from '@/store/auth/authSlice';
import { setupForegroundNotification } from './service/firebaseConfig';
import { SEOHead } from '@/utils/seo/seo';
import toast from 'react-hot-toast';
import { getInactivityLimit, ACTIVITY_DEBOUNCE_MS } from '@/config/sessionConfig';
import { store } from '@/store';

function AppContent({ children }) {
  const { userRole, api, systemSetting } = useMyContext();
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);           // holds the setTimeout reference
  const userData = useSelector((state) => state.auth.user);
  const lastActivity = useSelector((state) => state.auth.lastActivity);

  // ─── Auto-logout handler ───────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    // Only proceed if the user is actually currently logged in.
    // This prevents "ghost" inactivity toasts if a user logs out manually 
    // but a previous timer somehow fires.
    if (!store.getState().auth.user) {
      return;
    }

    toast.error('You were logged out due to inactivity.', {
      id: 'inactivity-logout',
      duration: 4000,
    });
    // dispatch(logout()) already calls localStorage.clear() inside the reducer,
    // which wipes redux-persist data. DO NOT call persistor.purge() here —
    // it dispatches an async REHYDRATE(null) that races against signIn.fulfilled
    // and overwrites the just-set user state back to null after re-login.
    dispatch(logout());
  }, [dispatch]);

  // ─── Activity-based inactivity timer ──────────────────────────────────────
  useEffect(() => {
    // Only run this logic if we have a valid user
    if (!userData?.role) {
      // If no user, ensure any existing timers are dead
      clearTimeout(logoutTimerRef.current);
      return;
    }

    const timeoutDuration = getInactivityLimit(userData.role);
    if (!timeoutDuration) return;

    // Track use of timers for cleanup
    let debounceTimer = null;

    const scheduleLogout = () => {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = setTimeout(() => {
        // Double check user still exists before firing
        if (store.getState().auth.user) {
          handleLogout();
        }
      }, timeoutDuration);
    };

    // Activity handler with internal guard and timer management
    const onActivity = () => {
      // Clear any pending debounce execution
      if (debounceTimer) clearTimeout(debounceTimer);

      // Set a new debounce timer
      debounceTimer = setTimeout(() => {
        // Only act if the user is still logged in when the debounce fires
        const currentUser = store.getState().auth.user;
        if (currentUser) {
          dispatch(updateActivity());
          scheduleLogout();
        }
      }, ACTIVITY_DEBOUNCE_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => document.addEventListener(event, onActivity));

    // Initial sync/resume logic
    if (lastActivity) {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= timeoutDuration) {
        handleLogout();
      } else {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = setTimeout(handleLogout, timeoutDuration - elapsed);
      }
    } else {
      scheduleLogout();
    }

    return () => {
      clearTimeout(logoutTimerRef.current);
      if (debounceTimer) clearTimeout(debounceTimer);
      activityEvents.forEach(event => document.removeEventListener(event, onActivity));
    };
  }, [userData?.role, handleLogout, dispatch, lastActivity]);

  // ─── Initial app setup (runs once) ────────────────────────────────────────
  useEffect(() => {
    checkAndClearSessionData();
    setupForegroundNotification(api);

    const handleContextMenu = (event) => event.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const defaultSEO = {
    title: "Get Your Ticket - Book Event Tickets Online",
    description: "Book tickets for concerts, garba, sports, arts, theater, family, shows, and nightlife events. Find your perfect event and book tickets online.",
    keywords: "event tickets, book tickets, concerts, sports events, theater shows",
    image: "/images/default-og-image.jpg",
    url: "",
    type: "website"
  };

  return (
    <div className="App">
      <SEOHead {...defaultSEO} />
      {systemSetting?.notify_req ? <PushNotificationButton /> : null}
      {children}
    </div>
  );
}

export default AppContent;