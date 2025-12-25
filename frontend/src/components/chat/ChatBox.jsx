import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Phone, Video, Send, ArrowLeft } from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import {
  getChatId,
  formatMessageTime,
  markMessagesAsRead,
} from "../../utils/chatHelpers";
import { useCall } from "../../context/CallContext";

export default function ChatBox({ user, currentUser, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { startCall } = useCall();

  const chatId =
    user && currentUser ? getChatId(currentUser.uid, user.uid) : null;

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- INIT CHAT + LISTEN ---------- */
  useEffect(() => {
    if (!chatId || !currentUser || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const initChat = async () => {
      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);

      // 🔥 Create main chat doc if not exists
      if (!snap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, user.uid],
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: null,
          [`unreadCount_${currentUser.uid}`]: 0,
          [`unreadCount_${user.uid}`]: 0,
        });
      }

      // 🔥 Add chat to CURRENT USER list
      await setDoc(
        doc(db, "users", currentUser.uid, "chats", chatId),
        {
          chatId,
          otherUserId: user.uid,
          otherUserName: user.displayName || user.email || "User",
          otherUserPhoto: user.photoURL || "",
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        },
        { merge: true }
      );

      // 🔥 Add chat to OTHER USER list
      await setDoc(
        doc(db, "users", user.uid, "chats", chatId),
        {
          chatId,
          otherUserId: currentUser.uid,
          otherUserName:
            currentUser.displayName || currentUser.email || "User",
          otherUserPhoto: currentUser.photoURL || "",
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        },
        { merge: true }
      );
    };

    initChat().catch(console.error);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);
      setLoading(false);

      if (list.length > 0) {
        await markMessagesAsRead(chatId, currentUser.uid).catch(console.error);
      }
    });

    return () => unsub();
  }, [chatId, currentUser, user]);

  /* ---------- SEND MESSAGE ---------- */
  const handleSendMessage = async () => {
    if (!message.trim() || !chatId || !currentUser || !user) return;

    const text = message.trim();
    setMessage("");

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      const unread =
        chatSnap.exists()
          ? chatSnap.data()[`unreadCount_${user.uid}`] || 0
          : 0;

      // Add message
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "User",
        senderPhoto: currentUser.photoURL || "",
        timestamp: serverTimestamp(),
        readBy: [currentUser.uid],
      });

      // Update main chat
      await setDoc(
        chatRef,
        {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          [`unreadCount_${user.uid}`]: unread + 1,
          [`unreadCount_${currentUser.uid}`]: 0,
        },
        { merge: true }
      );

      // 🔥 Update CURRENT USER chat list
      await setDoc(
        doc(db, "users", currentUser.uid, "chats", chatId),
        {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          unreadCount: 0,
        },
        { merge: true }
      );

      // 🔥 Update OTHER USER chat list
      await setDoc(
        doc(db, "users", user.uid, "chats", chatId),
        {
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          unreadCount: unread + 1,
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Send message failed:", err);
      setMessage(text);
      alert("Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ---------- EMPTY STATES ---------- */
  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle size={60} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-pink-500 text-white">
        <div className="flex items-center gap-3">
          <button onClick={onClose}>
            <ArrowLeft />
          </button>
          <img
            src={user.photoURL || "https://placehold.co/40x40"}
            alt="profile"
            className="w-10 h-10 rounded-full"
          />
          <h4 className="font-semibold">
            {user.displayName || user.email}
          </h4>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              startCall({ type: "audio", caller: currentUser, receiver: user })
            }
          >
            <Phone />
          </button>
          <button
            onClick={() =>
              startCall({ type: "video", caller: currentUser, receiver: user })
            }
          >
            <Video />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-[70%] ${
                    isMe
                      ? "bg-pink-500 text-white"
                      : "bg-white border"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs text-right opacity-70">
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 border rounded-xl p-3 resize-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="bg-pink-500 text-white p-3 rounded-full"
        >
          <Send />
        </button>
      </div>
    </div>
  );
}
