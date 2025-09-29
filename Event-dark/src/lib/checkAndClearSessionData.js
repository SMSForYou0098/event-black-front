/**
 * Session manager utility to handle clearing browser data after inactivity
 */

// Key for storing the last visit timestamp
const LAST_VISIT_KEY = 'app_last_visit';

/**
 * Checks if user hasn't visited in 24 hours and clears browser data if needed
 * Should be called when your app initializes
 */
export const checkAndClearSessionData = () => {
  try {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const currentTime = new Date().getTime();
    
    // If there's a last visit timestamp
    if (lastVisit) {
      const timeDifference = currentTime - parseInt(lastVisit, 10);
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      // If more than 24 hours have passed
      if (hoursDifference >= 24) {
        clearAllBrowserData();
      }
    }
    
    // Update the last visit timestamp
    localStorage.setItem(LAST_VISIT_KEY, currentTime?.toString());
  } catch (error) {
    console.error('Error checking session:', error);
  }
};

/**
 * Clears all browser storage data
 */
const clearAllBrowserData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear cookies
  clearCookies();
  
  // Attempt to clear cache (limited browser support)
  clearCache();
  
  // Re-add the last visit timestamp after clearing
  const currentTime = new Date().getTime();
  localStorage.setItem(LAST_VISIT_KEY, currentTime.toString());
};

/**
 * Clears all cookies
 */
const clearCookies = () => {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};

/**
 * Attempts to clear browser cache (limited browser support)
 */
const clearCache = () => {
  // This is a best-effort approach with limited browser support
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
};