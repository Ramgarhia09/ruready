// src/services/notificationService.js

const NOTIFICATION_URL =
  "https://sendcallnotification-u2f5r7p5la-uc.a.run.app";

export async function sendCallNotification({
  receiverId,
  callerName,
  channelName,
  callType,
}) {
  if (!receiverId) {
    throw new Error("Receiver FCM token missing");
  }

  const res = await fetch(NOTIFICATION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: receiverId, // 🔥 MUST be `token`
      callerName,
      channelName,
      callType, // "audio" | "video"
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Notification API failed:", text);
    throw new Error("Failed to send call notification");
  }

  return true;
}
