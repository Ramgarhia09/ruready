import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, 
  Phone, 
  Video, 
  X, 
  MessageCircle,
  MoreVertical,
  Filter,
  Edit,
  Loader2
} from "lucide-react";

import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { db } from "../../config/firebase";
import { getChatId } from "../../utils/chatHelpers";
import { useCall } from "../../context/CallContext";

import SidebarNavigation from "../../components/layout/SidebarNavigation";
import MobileBottomNav from "../../components/layout/MobileBottomNav";
import Header from "../../components/layout/Header";
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
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  /* ================= RESPONSIVE DETECTION ================= */
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      };

      if (!snap.exists()) {
        await setDoc(userRef, {
          ...baseData,
          createdAt: serverTimestamp(),
          online: true,
          lastSeen: serverTimestamp(),
        });
        setCurrentUser(baseData);
      } else {
        setCurrentUser({ uid: user.uid, ...snap.data() });

        updateDoc(userRef, {
          online: true,
          lastSeen: serverTimestamp(),
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= FETCH CHAT USERS ================= */
  useEffect(() => {
    if (!currentUser?.uid) return;

    const chatsRef = collection(db, "users", currentUser.uid, "chats");

    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      if (snapshot.empty) {
        setAllUsers([]);
        setLastMessages({});
        return;
      }

      const lastMsgMap = {};

      const users = await Promise.all(
        snapshot.docs.map(async (chatDoc) => {
          const data = chatDoc.data();
          const otherUserId = data.otherUserId;

          lastMsgMap[otherUserId] = {
            text: data.lastMessage || "",
            timestamp: data.lastMessageTime || null,
            unreadCount: data.unreadCount || 0,
          };

          const userSnap = await getDoc(doc(db, "users", otherUserId));
          if (!userSnap.exists()) return null;

          return { uid: userSnap.id, ...userSnap.data() };
        })
      );

      const filteredUsers = users.filter(Boolean);

      filteredUsers.sort((a, b) => {
        const t1 = lastMsgMap[a.uid]?.timestamp?.toMillis?.() || 0;
        const t2 = lastMsgMap[b.uid]?.timestamp?.toMillis?.() || 0;
        return t2 - t1;
      });

      setAllUsers(filteredUsers);
      setLastMessages(lastMsgMap);
    });

    return () => unsubscribe();
  }, [currentUser]);

  /* ================= OPEN CHAT FROM URL ================= */
  useEffect(() => {
    if (!userId || !currentUser) return;

    const openChat = async () => {
      const userSnap = await getDoc(doc(db, "users", userId));
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
        });
      }

      const chatDataForUser = {
        chatId,
        otherUserId: userId,
        otherUserName: otherUser.displayName || otherUser.email || "User",
        otherUserPhoto: otherUser.photoURL || "",
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
      };

      await Promise.all([
        setDoc(doc(db, "users", currentUser.uid, "chats", chatId), chatDataForUser, { merge: true }),
        setDoc(doc(db, "users", userId, "chats", chatId), {
          chatId,
          otherUserId: currentUser.uid,
          otherUserName: currentUser.displayName || currentUser.email || "User",
          otherUserPhoto: currentUser.photoURL || "",
          lastMessage: "",
          lastMessageTime: null,
          unreadCount: 0,
        }, { merge: true }),
      ]);
    };

    openChat();
  }, [userId, currentUser]);

  /* ================= CALL ================= */
  const handleCallUser = useCallback(
    (user, type) => {
      if (!currentUser) return;

      startCall({
        type,
        caller: currentUser,
        receiver: user,
        channel: `call_${getChatId(currentUser.uid, user.uid)}`,
      });
    },
    [currentUser, startCall]
  );

  /* ================= SEARCH ================= */
  const filteredUsers = allUsers.filter((user) =>
    (user.displayName || user.email || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  /* ================= FORMAT TIME ================= */
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /* ================= CURRENT USER CARD - NOW CLICKABLE TO PROFILE ================= */
  const CurrentUserCard = ({ user }) => (
    <div 
      onClick={() => navigate("/myprofile")}
      className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl active:scale-[0.99]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 animate-gradient"></div>
      
      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

      <div className="relative p-4 sm:p-5 lg:p-6">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="relative group/profile">
            <div className="absolute -inset-1 bg-white/30 rounded-full blur-md group-hover/profile:blur-lg transition-all duration-300"></div>
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'U')}&background=fff&color=ec4899&bold=true&size=128`}
              alt={user?.displayName}
              className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-3 border-white shadow-2xl object-cover ring-4 ring-white/20 transition-transform duration-300 group-hover/profile:scale-105"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-400 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate mb-0.5 drop-shadow-md">
              {user?.displayName || "User"}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 truncate drop-shadow">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80 font-medium">Active now</span>
            </div>
          </div>

          {/* Optional: Add a subtle arrow indicator on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
            <MoreVertical className="w-6 h-6 text-white/70" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">{allUsers.length}</div>
            <div className="text-xs text-white/70">Chats</div>
          </div>
          <div className="text-center border-x border-white/20">
            <div className="text-lg sm:text-xl font-bold text-white">
              {lastMessages ? Object.values(lastMessages).reduce((sum, msg) => sum + (msg.unreadCount || 0), 0) : 0}
            </div>
            <div className="text-xs text-white/70">Unread</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">
              {allUsers.filter(u => u.online).length}
            </div>
            <div className="text-xs text-white/70">Online</div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= USER CARD (OTHER USERS) ================= */
  const UserCard = ({ user, isSelected, lastMessage, onSelect, onCall, onVideo }) => (
    <div
      onClick={onSelect}
      className={`group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer transition-all duration-300 border-b border-gray-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 active:scale-[0.98] ${
        isSelected ? "bg-gradient-to-r from-pink-100 to-rose-100 border-l-4 border-l-pink-500 shadow-sm" : ""
      }`}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-rose-500"></div>
      )}

      <div className="relative flex-shrink-0">
        <img
          src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'U')}&background=ec4899&color=fff&bold=true&size=128`}
          alt={user?.displayName}
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover shadow-lg ring-2 ring-white group-hover:ring-pink-200 transition-all duration-300"
        />
        {user?.online ? (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
        ) : (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-400 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base lg:text-lg">
            {user?.displayName || user?.email || "User"}
          </h3>
          {lastMessage?.timestamp && (
            <span className="text-xs font-medium text-gray-500">
              {formatMessageTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs sm:text-sm truncate ${lastMessage?.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
            {lastMessage?.text || "Start a conversation"}
          </p>
          
          {lastMessage?.unreadCount > 0 && (
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-pink-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
              <span className="relative bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-2 shadow-lg">
                {lastMessage.unreadCount > 99 ? "99+" : lastMessage.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Call buttons on hover (desktop only) */}
      <div className="hidden lg:flex gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onCall(); }}
          className="p-2 rounded-full bg-white hover:bg-pink-100 shadow-md transition-all border border-gray-200"
          title="Audio call"
        >
          <Phone className="w-4 h-4 text-pink-600" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onVideo(); }}
          className="p-2 rounded-full bg-white hover:bg-pink-100 shadow-md transition-all border border-gray-200"
          title="Video call"
        >
          <Video className="w-4 h-4 text-pink-600" />
        </button>
      </div>
    </div>
  );

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-pink-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-pink-600 rounded-full animate-spin"></div>
            <MessageCircle className="absolute inset-0 m-auto w-8 h-8 text-pink-500 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Loading your chats</p>
          <p className="text-gray-500 text-sm">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-pink-50/30 to-rose-50/30">
      <SidebarNavigation />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header allUsers={allUsers} />

        <div className="flex flex-1 overflow-hidden">
          {/* USERS LIST SIDEBAR */}
          <div className={`${selectedUser && isMobileView ? "hidden" : "flex"} flex-col w-full lg:w-96 xl:w-[440px] bg-white shadow-2xl border-r border-gray-200`}>
            {/* Clickable Current User Card → My Profile */}
            <CurrentUserCard user={currentUser} />

            {/* Search Bar */}
            <div className="p-3 sm:p-4 bg-gradient-to-b from-white to-gray-50 border-b">
              <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
                <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-pink-500' : 'text-gray-400'}`} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-gray-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none text-sm sm:text-base transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full transition-all active:scale-90"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {filteredUsers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <div key={user.uid} style={{ animationDelay: `${index * 50}ms` }} className="animate-fadeIn">
                      <UserCard
                        user={user}
                        isSelected={selectedUser?.uid === user.uid}
                        lastMessage={lastMessages[user.uid]}
                        onSelect={() => {
                          setSelectedUser(user);
                          navigate(`/userlist/${user.uid}`);
                        }}
                        onCall={() => handleCallUser(user, "audio")}
                        onVideo={() => handleCallUser(user, "video")}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-pink-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">
                    {searchQuery ? "No matches found" : "No conversations yet"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? "Try a different search" : "Start chatting with someone!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CHAT BOX */}
          <div className={`flex-1 bg-gray-50 ${selectedUser && isMobileView ? 'fixed inset-0 z-50' : ''}`}>
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
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="w-20 h-20 text-pink-400 mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Your Messages</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedUser && <MobileBottomNav />}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradient 15s ease infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb { background-color: rgb(209 213 219); border-radius: 9999px; }
      `}</style>
    </div>
  );
};

export default UsersListPage;
