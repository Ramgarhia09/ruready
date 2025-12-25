// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize messaging (handle potential errors)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("⚠️ Firebase Messaging not available:", error.message);
}

export { messaging };

// Google Provider settings
googleProvider.setCustomParameters({ prompt: 'select_account' });

// VAPID Key (from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates)
const VAPID_KEY = "BIszPMF0LttD0G1NMfF1ApJzQ7H06TV8Sd_MQ3tzmR_7D0o_imJd_znFaW8YjS0EAEiQMRAxwL5Eo6o5c5sPPIg";

// ============================================
// Google Sign-In
// ============================================
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("✅ Google Sign-In successful:", user.email);
    return { success: true, user };
  } catch (error) {
    console.error("❌ Google Sign-In Error:", error);
    return { success: false, error };
  }
};

// ============================================
// FCM: Request Token
// ============================================
export const requestFCMToken = async () => {
  try {
    // Check if messaging is available
    if (!messaging) {
      console.warn("⚠️ Firebase Messaging not initialized");
      return null;
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.warn("⚠️ Browser doesn't support notifications");
      return null;
    }

    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Service Worker not supported");
      return null;
    }

    // Request notification permission
    console.log("📱 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.warn("⚠️ Notification permission denied by user");
      return null;
    }

    console.log("✅ Notification permission granted");

    // Register service worker
    let registration;
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" }
      );
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("✅ Service Worker registered and ready");
    } catch (swError) {
      console.error("❌ Service Worker registration failed:", swError);
      return null;
    }

    // Get FCM token
    console.log("📱 Requesting FCM token...");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log("✅ FCM Token generated successfully");
      console.log("📋 Token:", token);
      return token;
    } else {
      console.warn("⚠️ No FCM token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.error("❌ Error getting FCM token:", err);
    
    // More specific error messages
    if (err.code === 'messaging/permission-blocked') {
      console.error("🚫 Notification permission is blocked. Please enable it in browser settings.");
    } else if (err.code === 'messaging/token-subscribe-failed') {
      console.error("🚫 Failed to subscribe to FCM. Check your Firebase configuration.");
    } else if (err.code === 'messaging/unsupported-browser') {
      console.error("🚫 This browser doesn't support FCM notifications.");
    }
    
    return null;
  }
};

// ============================================
// FCM: Listen for Foreground Messages
// ============================================
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn("⚠️ Cannot listen for messages - messaging not initialized");
    return () => {}; // Return no-op cleanup function
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("📬 Foreground message received:", payload);
      callback(payload);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("❌ Error setting up message listener:", error);
    return () => {}; // Return no-op cleanup function
  }
};

// Legacy alias for backward compatibility
export const onMessageListener = onForegroundMessage;

// ============================================
// Helper: Check if FCM is supported
// ============================================
export const isFCMSupported = () => {
  return (
    messaging !== null &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
};

// ============================================
// Helper: Get notification permission status
// ============================================
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission; // 'granted', 'denied', or 'default'
};

export default app;