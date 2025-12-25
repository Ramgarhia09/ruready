import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/chat/ChatBox';
import { ArrowLeft, User as UserIcon } from 'lucide-react';

const ChatScreen = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Smart back navigation
  const goBack = useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  }, [navigate, location.key]);

  // Fetch user + real-time updates
  useEffect(() => {
    if (!userId) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);

    // Initial fetch
    const fetchUser = async () => {
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setChatUser({ uid: snap.id, ...snap.data() });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Real-time listener for online status, photo, name changes
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setChatUser({ uid: snap.id, ...snap.data() });
        }
      },
      (err) => {
        console.error('Realtime update failed:', err);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-pink-500 text-white p-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-pink-400 rounded-full" />
            <div className="h-6 bg-pink-400 rounded w-48" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !chatUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-2xl max-w-sm w-full">
          <p className="text-lg font-medium mb-2">Oops!</p>
          <p className="text-sm">{error || 'This user does not exist'}</p>
          <button
            onClick={goBack}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full font-medium transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Custom Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={goBack}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="relative">
            {chatUser.photoURL ? (
              <img
                src={chatUser.photoURL}
                alt={chatUser.displayName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30"
              />
            ) : (
              <div className="w-11 h-11 bg-white/30 rounded-full flex items-center justify-center">
                <UserIcon size={20} className="text-white" />
              </div>
            )}
            {chatUser.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">
              {chatUser.displayName || chatUser.email?.split('@')[0] || 'User'}
            </h2>
            <p className="text-xs opacity-90">
              {chatUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <ChatBox
          user={chatUser}
          currentUser={currentUser}
          onClose={goBack}
        />
      </div>
    </div>
  );
};

export default ChatScreen;