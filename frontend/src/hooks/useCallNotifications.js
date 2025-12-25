import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { requestFCMToken, isFCMSupported } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

export default function useCallNotifications() {
  const { user } = useAuth();

  const saveTokenToFirestore = async (token) => {
    if (!token || !user?.uid) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          fcmToken: token,
          fcmTokenUpdatedAt: serverTimestamp(),
          platform: "web",
        },
        { merge: true }
      );
      console.log("✅ FCM token saved to Firestore:", token.substring(0, 20) + "...");
    } catch (error) {
      console.error("❌ Failed to save FCM token to Firestore:", error);
    }
  };

  const attemptSaveToken = async () => {
    if (!isFCMSupported()) {
      console.warn("⚠️ FCM not supported in this browser");
      return;
    }

    if (!user?.uid) return;

    console.log("🔄 Attempting to get and save FCM token...");

    const token = await requestFCMToken();

    if (token) {
      await saveTokenToFirestore(token);
    } else {
      console.warn("⚠️ No FCM token received yet (permission denied or SW not ready)");
    }
  };

  // Run when user logs in
  useEffect(() => {
    if (!user?.uid) return;

    attemptSaveToken();

    // Also try again when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        attemptSaveToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Try every 10 seconds until successful (max 5 times)
    let attempts = 0;
    const interval = setInterval(() => {
      if (attempts >= 5) {
        clearInterval(interval);
        return;
      }
      attempts++;
      attemptSaveToken();
    }, 10000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user?.uid]);
}