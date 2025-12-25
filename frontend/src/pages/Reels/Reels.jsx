import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Grid, MessageCircle, User, Plus, Volume2, VolumeX, Play, X, Send, ChevronUp } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { db, storage } from "../../config/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

// Add Reel Modal
const AddReelModal = ({ isOpen, onClose, currentUser }) => {
  const [title, setTitle] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !selectedFile || !currentUser) {
      alert('Please add a title and select a file');
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `reels/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, "reels"), {
        title: title.trim(),
        hashtag: hashtag.trim(),
        url: downloadURL,
        type: selectedFile.type.startsWith('video/') ? 'video' : 'image',
        username: currentUser.displayName || "Anonymous",
        userId: currentUser.uid,
        userPhoto: currentUser.photoURL || "",
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });

      alert('Reel created successfully! 🎉');
      onClose();
      setTitle('');
      setHashtag('');
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error creating reel:", error);
      alert('Failed to create reel. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white">Create New Reel</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Video/Image</label>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              disabled={uploading}
            />
            {preview && (
              <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
                {selectedFile?.type.startsWith('image') ? (
                  <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                ) : (
                  <video src={preview} className="w-full h-64 object-cover" controls />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reel title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Hashtags</label>
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              placeholder="#fun #amazing"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
              disabled={uploading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all hover:shadow-lg"
          >
            {uploading ? 'Uploading...' : 'Create Reel'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Comment Modal
const CommentModal = ({ isOpen, onClose, reel }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, username: 'user123', text: 'Amazing content!', time: '2h ago' },
    { id: 2, username: 'coolperson', text: 'Love this! 😍', time: '5h ago' },
  ]);

  const handleAddComment = () => {
    if (comment.trim()) {
      setComments([
        { id: Date.now(), username: 'You', text: comment, time: 'Just now' },
        ...comments
      ]);
      setComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end lg:items-center lg:justify-center backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-lg h-[80vh] lg:h-[70vh] flex flex-col shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 p-5 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-white">Comments</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 bg-white p-3 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-sm">{c.username[0]}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{c.username}</span>
                  <span className="text-xs text-gray-500">{c.time}</span>
                </div>
                <p className="text-gray-700">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 bg-white p-4 flex gap-2 rounded-b-3xl">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-pink-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleAddComment}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 p-3 rounded-full transition-all hover:scale-105"
          >
            <Send className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Reel Video/Image Component - FIXED
const ReelVideo = ({ reel, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // KEY FIX: Properly handle video playback
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || reel.type !== 'video') return;

    if (isActive) {
      // Play video when reel becomes active
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      // Pause and reset when reel is not active
      videoElement.pause();
      setIsPlaying(false);
    }
  }, [isActive, reel.type]);

  const togglePlayPause = () => {
    if (reel.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => console.log("Play error:", error));
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlayPause}
    >
      {reel.type === 'video' ? (
        <video
          ref={videoRef}
          src={reel.url}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
        />
      ) : (
        <img 
          src={reel.url} 
          alt={reel.title}
          className="w-full h-full object-cover"
        />
      )}

      {/* Play button overlay when paused */}
      {showControls && reel.type === 'video' && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all">
          <div className="bg-white/30 backdrop-blur-md p-5 rounded-full animate-pulse">
            <Play size={50} className="text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

      {/* User Info */}
      <div className="absolute bottom-4 left-4 right-20 text-white pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center ring-2 ring-white">
            <span className="text-white font-bold text-sm">
              {reel.username ? reel.username[0].toUpperCase() : '@'}
            </span>
          </div>
          <span className="text-sm font-semibold drop-shadow-lg">{reel.username}</span>
        </div>
        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{reel.title}</h3>
        <p className="text-sm opacity-95 font-medium drop-shadow-lg">{reel.hashtag}</p>
      </div>

      {/* Mute Button (Videos only) */}
      {reel.type === 'video' && (
        <div className="absolute right-4 bottom-20 pointer-events-auto">
          <button 
            onClick={toggleMute}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all"
          >
            {isMuted ? 
              <VolumeX className="text-white" size={24} /> : 
              <Volume2 className="text-white" size={24} />
            }
          </button>
        </div>
      )}
    </div>
  );
};

const ReelsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const isScrolling = useRef(false);

  // Load reels from Firebase
  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReels(reelsData);
    }, (error) => {
      console.error("Error loading reels:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setShowScrollTop(currentReelIndex > 1);
  }, [currentReelIndex]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isScrolling.current) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      isScrolling.current = true;
      if (diff > 0 && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
      } else if (diff < 0 && currentReelIndex > 0) {
        setCurrentReelIndex(prev => prev - 1);
      }
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (isScrolling.current) return;

    if (Math.abs(e.deltaY) > 30) {
      isScrolling.current = true;
      if (e.deltaY > 0 && currentReelIndex < reels.length - 1) {
        setCurrentReelIndex(prev => prev + 1);
      } else if (e.deltaY < 0 && currentReelIndex > 0) {
        setCurrentReelIndex(prev => prev - 1);
      }
      setTimeout(() => {
        isScrolling.current = false;
      }, 600);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const scrollToTop = () => {
    setCurrentReelIndex(0);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex overflow-hidden">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-xl z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Ruready</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => handleNavigation('/dashboard')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all text-left group"
          >
            <Home size={24} className="text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500 transition-colors">Home</span>
          </button>

          <button
            onClick={() => handleNavigation('/reels')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 transition-all text-left"
          >
            <Grid size={24} className="text-pink-500" />
            <span className="text-pink-500 font-semibold text-lg">Reels</span>
          </button>

          <button
            onClick={() => handleNavigation('/userList')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all text-left group"
          >
            <MessageCircle size={24} className="text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500 transition-colors">Chat</span>
          </button>

          <button
            onClick={() => handleNavigation('/myprofile')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all text-left group"
          >
            <User size={24} className="text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500 transition-colors">Profile</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl text-white shadow-lg">
          <h3 className="font-bold mb-2">Go Premium</h3>
          <p className="text-sm mb-3 opacity-90">Unlock all features!</p>
          <button
            onClick={() => handleNavigation('/premium')}
            className="w-full bg-white text-pink-500 py-2 px-4 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-105"
          >
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl shadow-sm z-30 flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">R U Ready</h1>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              <Plus className="text-white" size={22} />
            </button>
          </div>
        </header>

        {/* Reels Container */}
        <main 
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {reels.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                <Grid size={48} className="text-white" />
              </div>
              <p className="text-2xl font-bold mb-2">No reels yet</p>
              <p className="text-gray-400">Create the first one and start sharing!</p>
            </div>
          ) : (
            <div 
              className="h-full transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateY(-${currentReelIndex * 100}%)`,
              }}
            >
              {reels.map((reel, index) => (
                <div 
                  key={reel.id} 
                  className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4 lg:p-8"
                  style={{
                    transform: `translateY(${index * 100}%)`
                  }}
                >
                  <div className="w-full max-w-md lg:max-w-lg h-[calc(100%-2rem)] lg:h-[calc(100%-4rem)]">
                    <ReelVideo 
                      reel={reel} 
                      isActive={index === currentReelIndex}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Scroll Indicator - Desktop */}
        {reels.length > 0 && (
          <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-30">
            <div className="flex flex-col gap-3 bg-white/30 backdrop-blur-lg p-3 rounded-full shadow-lg">
              {reels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isScrolling.current) {
                      setCurrentReelIndex(index);
                    }
                  }}
                  className={`rounded-full transition-all ${
                    index === currentReelIndex 
                      ? 'bg-gradient-to-b from-pink-500 to-purple-600 w-3 h-10' 
                      : 'bg-gray-300 hover:bg-pink-300 w-3 h-3'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Scroll to Top */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-10 right-6 lg:right-28 z-30 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 animate-bounce"
          >
            <ChevronUp className="text-white" size={24} />
          </button>
        )}
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden bg-gradient-to-r from-pink-500 to-purple-600 shadow-2xl fixed bottom-0 left-0 right-0 z-40">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => handleNavigation('/dashboard')} 
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all py-2 hover:scale-110"
          >
            <Home size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button 
            onClick={() => handleNavigation('/reels')} 
            className="flex flex-col items-center gap-1 text-white py-2 scale-110"
          >
            <Grid size={24} />
            <span className="text-[10px] font-bold">Reels</span>
          </button>
          <button 
            onClick={() => handleNavigation('/userList')} 
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all py-2 hover:scale-110"
          >
            <MessageCircle size={24} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button 
            onClick={() => handleNavigation('/myprofile')} 
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-all py-2 hover:scale-110"
          >
            <User size={24} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AddReelModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        currentUser={currentUser}
      />
      <CommentModal 
        isOpen={showCommentModal} 
        onClose={() => setShowCommentModal(false)}
        reel={reels[currentReelIndex]}
      />
    </div>
  );
};

export default ReelsPage;