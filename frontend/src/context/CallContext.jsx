// src/context/CallContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const CallContext = createContext();
export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  const [call, setCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  /* =========================
     START CALL + CREATE LOG + SEND NOTIFICATION
  ========================== */
  const startCall = async ({ caller, receiver, type }) => {
    if (!caller?.uid || !receiver?.uid) return;

    const callId = `call_${Date.now()}`;
    const callData = {
      callId,
      type,
      active: true,
      pickedUp: false,
      callerId: caller.uid,
      receiverId: receiver.uid,
      participants: [caller.uid, receiver.uid],
      channel: callId,
      caller,
      receiver,
      startedAt: serverTimestamp(),
    };

    try {
      // 1️⃣ Temporary call doc
      await setDoc(doc(db, "calls", callId), callData);

      // 2️⃣ Permanent call log
      const logRef = await addDoc(collection(db, "call_logs"), {
        callId,
        callerId: caller.uid,
        receiverId: receiver.uid,
        type,
        participants: [caller.uid, receiver.uid],
        startTime: serverTimestamp(),
        endTime: null,
        duration: 0,
        status: "ongoing",
        callerName: caller.displayName || "Unknown",
        receiverName: receiver.displayName || "Unknown",
        callerPhoto: caller.photoURL || "",
        receiverPhoto: receiver.photoURL || "",
      });

      // Save active call in state
      setCall({ ...callData, logId: logRef.id });
      setCallDuration(0);

      // 3️⃣ Send notification via your deployed FCM URL
   // 3️⃣ Send call notification via Cloud Run
if (receiver.  receiverId) {
  try {
    const response = await fetch("https://sendcallnotification-u2f5r7p5la-uc.a.run.app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: receiver.  receiverId,           // ← Must be "token", not "  receiverId"
        callerName: caller.displayName || "Someone",
        channelName: callId,                 // ← Use the same callId as Agora channel
        callType: type,                     // ← "video" or "audio"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Notification failed:", response.status, errorText);
    } else {
      console.log("📲 Call notification sent successfully to", receiver.displayName);
    }
  } catch (err) {
    console.error("❌ Error sending notification:", err);
  }
} else {
  console.warn("⚠️ Receiver has no FCM token – cannot send call notification");
}
    } catch (err) {
      console.error("❌ Failed to start call:", err);
    }
  };

  /* =========================
     ACCEPT CALL
  ========================== */
  const acceptCall = async () => {
    if (!call?.callId) return;

    await setDoc(doc(db, "calls", call.callId), { pickedUp: true }, { merge: true });

    if (call.logId) {
      await updateDoc(doc(db, "call_logs", call.logId), { status: "answered" });
    }
  };

  /* =========================
     END CALL + UPDATE LOG
  ========================== */
  const endCall = async (status = "completed", duration = 0) => {
    if (!call) return;

    const { logId, callId } = call;

    try {
      if (callId) {
        await setDoc(doc(db, "calls", callId), { active: false, endedAt: serverTimestamp() }, { merge: true });
      }

      if (logId) {
        await updateDoc(doc(db, "call_logs", logId), {
          endTime: serverTimestamp(),
          duration,
          status,
        });
        console.log(`✅ Call log updated: ${duration}s, status: ${status}`);
      }
    } catch (err) {
      console.error("❌ Error updating call log:", err);
    } finally {
      setCall(null);
      setCallDuration(0);
    }
  };

  /* =========================
     TIMER FOR CALL DURATION
  ========================== */
  useEffect(() => {
    if (!call?.pickedUp) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call?.pickedUp]);

  /* =========================
     LISTEN FOR ACTIVE CALLS
  ========================== */
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "calls"),
      where("participants", "array-contains", currentUser.uid),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setCall(null);
        setCallDuration(0);
        return;
      }

      const data = snapshot.docs[0].data();
      const docId = snapshot.docs[0].id;
      setCall({ ...data, callId: docId });
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  return (
    <CallContext.Provider
      value={{
        call,
        callDuration,
        startCall,
        acceptCall,
        endCall,
        setCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
