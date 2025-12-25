import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/* ---------- CHAT ID ---------- */
export const getChatId = (uid1, uid2) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

/* ---------- TIME FORMAT ---------- */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });

  return date.toLocaleDateString();
};

/* ---------- MARK AS READ ---------- */
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);

    if (snap.exists()) {
      await updateDoc(chatRef, {
        [`unreadCount_${userId}`]: 0,
      });
    }
  } catch (err) {
    console.error("markMessagesAsRead error:", err);
  }
};
