import { initializeApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  getToken,
  onMessage,
  Messaging,
} from "firebase/messaging";
import axios from "axios";

// Firebase configuration - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyA2dbJ9f8hGINk4C9l8awST8kQ2t-ZZeZQ",
    authDomain: "event-notify-959b1.firebaseapp.com",
    projectId: "event-notify-959b1",
    storageBucket: "event-notify-959b1.firebasestorage.app",
    messagingSenderId: "15186708713",
    appId: "1:15186708713:web:cfeefd9b8fe3a352ca8878",
    measurementId: "G-VSZJ4MV2FC"
};

const app = initializeApp(firebaseConfig);
let messaging: Messaging | null = null;

// Initialize messaging safely
const initializeMessaging = async (): Promise<boolean> => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error initializing messaging:", error);
    return false;
  }
};

// Ensure messaging is initialized
initializeMessaging();

// Request notification permission and save token
export const requestNotificationPermission = async (
  api: string
): Promise<boolean> => {
  try {
    if (!messaging) {
      const initialized = await initializeMessaging();
      if (!initialized) return false;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers not supported in this browser.");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return false;
    }

    try {
      const token = await getToken(messaging!, {
        vapidKey:
          "BMOb3YbQWaaPPYWUkvF47Bo2vrhizJv9KVx3yX1hCOjAIxC9TpbVxKRbNHIoYtiDtQCOk25Hancon8oI_02732E",
      });

      if (token) {
        try {
          await axios.post(`${api}notifications/save-token`, { token });
        } catch (error) {
          console.error("Error saving token via API:", error);
        }

        await saveTokenToServer(token, api);
        return true;
      }
      return false;
    } catch (tokenError) {
      console.error("Error getting FCM token:", tokenError);
      return false;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
};

// Save token to backend
const saveTokenToServer = async (token: string, api: string): Promise<void> => {
  try {
    const user = getCurrentUser();

    if (!user?.id) {
      localStorage.setItem("fcm_token", token);
      return;
    }

    await axios.post(`${api}notifications/save-token`, {
      token,
      user_id: user.id,
    });
  } catch (err) {
    console.error("Failed to save token to server:", err);
    localStorage.setItem("fcm_token", token);
  }
};

// Setup foreground notifications
export const setupForegroundNotification = (api?: string): void => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    if (payload.notification) {
      const notification = new Notification(payload.notification.title ?? "", {
        body: payload.notification.body,
        icon: "/notification-icon.png",
      });

      notification.onclick = (event) => {
        event.preventDefault();
        if (payload.data?.url) {
          window.open(payload.data.url, "_blank");
        }
        notification.close();
      };
    }
  });
};

// Get current user (replace with your auth logic)
interface User {
  id: string | null;
}

const getCurrentUser = (): User => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || { id: null };
  } catch {
    return { id: null };
  }
};