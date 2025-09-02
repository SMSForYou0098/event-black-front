import React, { useCallback, useEffect, useRef } from 'react'
import { useMyContext } from '../Context/MyContextProvider';
import { useDispatch, useSelector } from 'react-redux';
import { setSetting } from '../store/setting/actions';
import axios from 'axios';
import PushNotificationButton from './PushNotificationButton';
import { checkAndClearSessionData } from './checkAndClearSessionData';
import { logout } from '@/store/auth/authSlice';
import { persistor } from '@/store'; // Import persistor directly
import { setupForegroundNotification } from './service/firebaseConfig';
import { RootState } from '@/store';

interface AppContentProps {
  children: React.ReactNode;
}

const getTimeoutDuration = (role: string | undefined): number | null => {
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

function AppContent({ children }: AppContentProps) {
  const { userRole, api, systemSetting } = useMyContext();
  const dispatch = useDispatch();
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userData = useSelector((state: RootState) => state.auth.user);

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
    
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []); // Empty dependency array - runs only once

  return (
    <div className="App">
      {systemSetting?.notify_req ? <PushNotificationButton /> : null}
      {children}
    </div>
  );
}

export default AppContent;