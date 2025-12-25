import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { db } from "../../config/firebase";
import { getChatId } from "../../utils/chatHelpers";
import { useCall } from "../../context/CallContext";

import SidebarNavigation from "../../components/layout/SidebarNavigation";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import Header from "../../components/layout/Header";
import CurrentUserCard from "../../components/chat/CurrentUserCard";
import UserCard from "../../components/chat/UserCard";
import ChatBox from "../../components/chat/ChatBox";

const UsersListPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { startCall } = useCall();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= AUTH ================= */
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      const baseData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        online: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!snap.exists()) {
        await setDoc(userRef, {
          ...baseData,
          createdAt: serverTimestamp(),
          bio: "",
        });
      } else {
        await updateDoc(userRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });
      }

      const updatedSnap = await getDoc(userRef);
      setCurrentUser({ uid: user.uid, ...updatedSnap.data() });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= FETCH CHATTED USERS ================= */
  useEffect(() => {
    if (!currentUser?.uid) return;

    const chatsRef = collection(db, "users", currentUser.uid, "chats");

    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      if (snapshot.empty) {
        setAllUsers([]);
        setLastMessages({});
        return;
      }

      const usersData = [];
      const lastMsgMap = {};

      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data();
        const otherUserId = data.otherUserId;
        lastMsgMap[otherUserId] = {
          text: data.lastMessage || "",
          timestamp: data.lastMessageTime || null,
          unreadCount: data.unreadCount || 0,
        };

        const userRef = doc(db, "users", otherUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          usersData.push({ uid: userSnap.id, ...userSnap.data() });
        }
      }

      // Sort users by last message time descending
      usersData.sort((a, b) => {
        const t1 = lastMsgMap[a.uid]?.timestamp?.toMillis?.() || 0;
        const t2 = lastMsgMap[b.uid]?.timestamp?.toMillis?.() || 0;
        return t2 - t1;
      });

      setAllUsers(usersData);
      setLastMessages(lastMsgMap);
    });

    return () => unsubscribe();
  }, [currentUser]);

  /* ================= AUTO OPEN CHAT FROM URL ================= */
  useEffect(() => {
    if (!userId || !currentUser) return;

    const openChatFromUrl = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const otherUser = { uid: userSnap.id, ...userSnap.data() };
      setSelectedUser(otherUser);

      const chatId = getChatId(currentUser.uid, userId);
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, userId],
          createdAt: serverTimestamp(),
          lastMessage: "",
          lastMessageTime: null,
          [`unreadCount_${currentUser.uid}`]: 0,
          [`unreadCount_${userId}`]: 0,
        });
      }

      // Ensure chat exists in per-user chat lists
      await setDoc(
        doc(db, "users", currentUser.uid, "chats", chatId),
        {
          chatId,
          otherUserId: userId,
          otherUserName: otherUser.displayName || otherUser.email || "User",
          otherUserPhoto: otherUser.photoURL || "",
          lastMessage: "",
          lastMessageTime: null,
          unreadCount: 0,
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "users", userId, "chats", chatId),
        {
          chatId,
          otherUserId: currentUser.uid,
          otherUserName:
            currentUser.displayName || currentUser.email || "User",
          otherUserPhoto: currentUser.photoURL || "",
          lastMessage: "",
          lastMessageTime: null,
          unreadCount: 0,
        },
        { merge: true }
      );
    };

    openChatFromUrl();
  }, [userId, currentUser]);

  /* ================= CALL ================= */
  const handleCallUser = (user, type) => {
    if (!currentUser) return;

    startCall({
      type,
      caller: currentUser,
      receiver: user,
      channel: `call_${getChatId(currentUser.uid, user.uid)}`,
    });
  };

  /* ================= SEARCH ================= */
  const filteredUsers = allUsers.filter((user) =>
    (user.displayName || user.email || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-pink-50">
      <SidebarNavigation />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header allUsers={allUsers} />

        <div className="flex flex-1 overflow-hidden">
          {/* USERS LIST */}
          <div
            className={`${
              selectedUser ? "hidden lg:flex" : "flex"
            } flex-col w-full lg:w-96 bg-white border-r`}
          >
            <CurrentUserCard user={currentUser} />

            <div className="p-4 border-b">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  onSelect={() => {
                    setSelectedUser(user);
                    navigate(`/userlist/${user.uid}`);
                  }}
                  onCall={() => handleCallUser(user, "audio")}
                  onVideo={() => handleCallUser(user, "video")}
                  isSelected={selectedUser?.uid === user.uid}
                  lastMessage={lastMessages[user.uid]}
                />
              ))}
            </div>
          </div>

          {/* CHAT BOX */}
          <div className="flex-1">
            {selectedUser ? (
              <ChatBox
                user={selectedUser}
                currentUser={currentUser}
                onClose={() => {
                  setSelectedUser(null);
                  navigate("/userlist");
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedUser && <MobileBottomNav />}
    </div>
  );
};

export default UsersListPage;
