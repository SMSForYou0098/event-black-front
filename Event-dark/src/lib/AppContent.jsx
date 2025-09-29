import React, { useCallback, useEffect, useRef } from 'react'
import { useMyContext } from '../Context/MyContextProvider';
import { useDispatch, useSelector } from 'react-redux';
import PushNotificationButton from './PushNotificationButton';
import { checkAndClearSessionData } from './checkAndClearSessionData';
import { logout } from '@/store/auth/authSlice';
import { persistor } from '@/store'; // Import persistor directly
import { setupForegroundNotification } from './service/firebaseConfig';
import {SEOHead} from '@/utils/seo/seo';

const getTimeoutDuration = (role) => {
  switch (role) {
    case 'User':
      return 5 * 60 * 1000; // 5 minutes
    case 'Scanner':
    case 'Agent':
    case 'Organizer':
      return 4 * 60 * 60 * 1000; // 4 hours
    default:
      return null;
  }
};

function AppContent({ children }) {
  const { userRole, api, systemSetting } = useMyContext();
  const dispatch = useDispatch();
  const logoutTimerRef = useRef(null);
  const userData = useSelector((state) => state.auth.user);

  const handleLogout = useCallback(async () => {
    dispatch(logout());
    persistor.purge();
  }, [dispatch]);

  // Fixed useEffect for logout timer
  useEffect(() => {
    // Only set up timer if user is logged in
    if (!userRole || !userData) return;

    const timeoutDuration = getTimeoutDuration(userRole);
    if (!timeoutDuration) return;

    const resetTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      logoutTimerRef.current = setTimeout(handleLogout, timeoutDuration);
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];

    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [userRole, userData, handleLogout]); // Added userData as dependency

  // Fixed useEffect for initial setup - runs only once
  useEffect(() => {
    // dispatch(setSetting());
    checkAndClearSessionData();
    setupForegroundNotification(api);

    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // Empty dependency array - runs only once
  
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