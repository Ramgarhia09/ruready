import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Heart, RefreshCw, Home, Grid, MessageCircle, User, X, 
  ChevronLeft, ChevronRight, Filter, Check, SkipForward
} from 'lucide-react';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// Calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// Likes Modal Component
const LikesModal = ({ isOpen, onClose, likedProfiles, onMessageClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="text-pink-500 fill-pink-500" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Liked Profiles</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {likedProfiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-pink-300" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Likes Yet</h3>
              <p className="text-gray-500">Start liking profiles to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {likedProfiles.map((profile) => (
                <div key={profile.uid} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-64">
                    <img 
                      src={profile.photoURL || 'https://via.placeholder.com/400'}
                      alt={profile.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{profile.displayName || 'Anonymous'}</h3>
                      <p className="text-sm opacity-90">{profile.city || 'Unknown'} • {profile.gender || 'Not specified'}</p>
                      {profile.dob && <p className="text-xs opacity-75 mt-1">{calculateAge(profile.dob)} years old</p>}
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button 
                        onClick={() => onMessageClick(profile.uid)}
                        className="bg-purple-500 p-2 rounded-full shadow-lg hover:bg-purple-600 transition-colors"
                      >
                        <MessageCircle className="text-white" size={20} />
                      </button>
                      <div className="bg-pink-500 p-2 rounded-full shadow-lg">
                        <Heart className="text-white fill-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {likedProfiles.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
            <p className="text-center text-gray-600">
              You have liked <span className="font-bold text-pink-500">{likedProfiles.length}</span> profile{likedProfiles.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, onFilterChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onFilterChange({ age: [18, 80], gender: 'Any', city: '' })}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="text-pink-500" size={24} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Check className="text-green-500" size={28} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Age Range</h3>
            <div className="flex justify-between mb-4 text-lg">
              <span className="text-gray-600">Min: {filters.age[0]}</span>
              <span className="text-gray-600">Max: {filters.age[1]}</span>
            </div>
            <div className="space-y-4">
              <input type="range" min="18" max="80" value={filters.age[0]} onChange={(e) => onFilterChange({ ...filters, age: [parseInt(e.target.value), filters.age[1]] })} className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer" />
              <input type="range" min="18" max="80" value={filters.age[1]} onChange={(e) => onFilterChange({ ...filters, age: [filters.age[0], parseInt(e.target.value)] })} className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Gender</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Any', 'Male', 'Female', 'Other'].map((gender) => (
                <button key={gender} onClick={() => onFilterChange({ ...filters, gender })} className={`py-4 px-4 rounded-full text-lg font-medium transition-all ${filters.gender === gender ? 'bg-pink-100 text-pink-600 border-2 border-pink-500' : 'bg-gray-100 text-gray-700 border-2 border-gray-200'}`}>
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">City</h3>
            <input type="text" placeholder="Enter city name" value={filters.city} onChange={(e) => onFilterChange({ ...filters, city: e.target.value })} className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 outline-none text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ profile, onLike, onSkip, onMessage }) => {
  const age = profile.dob ? calculateAge(profile.dob) : null;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group">
      <div className="absolute inset-0">
        <img src={profile.photoURL || 'https://via.placeholder.com/800x1200'} alt={profile.displayName || 'User'} className="w-full h-full object-cover" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h2 className="text-4xl font-bold mb-2">{profile.displayName || 'Anonymous'}</h2>
        <p className="text-lg opacity-90">{profile.city || 'Unknown'} • {profile.gender || 'Not specified'}</p>
        {age && <p className="text-md opacity-75 mt-1">{age} years old</p>}
        {profile.bio && <p className="text-sm opacity-80 mt-3 line-clamp-2">{profile.bio}</p>}
      </div>

      <div className="hidden lg:flex absolute bottom-8 right-8 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={onSkip} className="bg-gray-500/80 backdrop-blur-md hover:bg-gray-600 p-4 rounded-full transition-all duration-200 hover:scale-110">
          <SkipForward className="text-white" size={32} />
        </button>
        <button onClick={onMessage} className="bg-purple-500/80 backdrop-blur-md hover:bg-purple-500 p-4 rounded-full transition-all duration-200 hover:scale-110">
          <MessageCircle className="text-white" size={32} />
        </button>
        <button onClick={onLike} className="bg-pink-500/80 backdrop-blur-md hover:bg-pink-500 p-4 rounded-full transition-all duration-200 hover:scale-110">
          <Heart className="text-white" size={32} />
        </button>
      </div>
    </div>
  );
};

// Main Dashboard Component
const HomeDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ profileViews: 0, matches: 0, likes: 0 });

  const [filters, setFilters] = useState({
    age: [18, 80],
    gender: 'Any',
    city: ''
  });

  // Determine active route
  const isActive = (path) => location.pathname === path;

  // Navigation handler
  const goTo = (path) => {
    navigate(path);
  };

  // Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...userData
          });

          if (userData.likedUsers) {
            fetchLikedProfiles(userData.likedUsers);
          }

          setStats({
            profileViews: userData.profileViews || 0,
            matches: userData.matches || 0,
            likes: userData.likedUsers?.length || 0
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all profiles (exclude current user and skipped users)
  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const profiles = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(profile => 
          profile.uid !== currentUser.uid && 
          !currentUser.skippedUsers?.includes(profile.uid) // Filter out skipped users
        );
      
      setAllProfiles(profiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Apply filters
  useEffect(() => {
    if (allProfiles.length === 0) {
      setFilteredProfiles([]);
      return;
    }

    let filtered = [...allProfiles];

    if (filters.gender !== 'Any') {
      filtered = filtered.filter(p => p.gender?.toLowerCase() === filters.gender.toLowerCase());
    }

    filtered = filtered.filter(p => {
      if (!p.dob) return true;
      const age = calculateAge(p.dob);
      return age >= filters.age[0] && age <= filters.age[1];
    });

    if (filters.city.trim()) {
      filtered = filtered.filter(p => p.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }

    setFilteredProfiles(filtered);
    setCurrentProfileIndex(0);
  }, [allProfiles, filters]);

  const fetchLikedProfiles = async (likedUserIds) => {
    if (!likedUserIds || likedUserIds.length === 0) {
      setLikedProfiles([]);
      return;
    }

    const profiles = [];
    for (const userId of likedUserIds) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        profiles.push({ uid: userDoc.id, ...userDoc.data() });
      }
    }
    setLikedProfiles(profiles);
  };

  const handleLike = async () => {
    if (!currentUser || filteredProfiles.length === 0) return;
    const likedProfile = filteredProfiles[currentProfileIndex];

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        likedUsers: arrayUnion(likedProfile.uid),
        updatedAt: serverTimestamp()
      });

      setLikedProfiles([...likedProfiles, likedProfile]);
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }));

      const likedUserDoc = await getDoc(doc(db, 'users', likedProfile.uid));
      if (likedUserDoc.exists() && likedUserDoc.data().likedUsers?.includes(currentUser.uid)) {
        await updateDoc(userRef, { matches: (stats.matches || 0) + 1 });
        alert(`It's a match with ${likedProfile.displayName || 'this user'}! 🎉`);
      }

      nextProfile();
    } catch (error) {
      console.error('Error liking profile:', error);
      alert('Failed to like profile.');
    }
  };

  const handleSkip = async () => {
    if (!currentUser || filteredProfiles.length === 0) return;
    const skippedProfile = filteredProfiles[currentProfileIndex];

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        skippedUsers: arrayUnion(skippedProfile.uid),
        updatedAt: serverTimestamp()
      });

      // Update local state to reflect the skip
      setCurrentUser(prev => ({
        ...prev,
        skippedUsers: [...(prev.skippedUsers || []), skippedProfile.uid]
      }));

      nextProfile();
    } catch (error) {
      console.error('Error skipping profile:', error);
      alert('Failed to skip profile.');
    }
  };

  const nextProfile = () => {
    setCurrentProfileIndex(prev => prev < filteredProfiles.length - 1 ? prev + 1 : 0);
  };

  const prevProfile = () => {
    setCurrentProfileIndex(prev => prev > 0 ? prev - 1 : filteredProfiles.length - 1);
  };

  const handleRefresh = () => {
    setFilters({ age: [18, 80], gender: 'Any', city: '' });
  };

  const handleMessage = (userId) => {
    navigate(`/userlist/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Ruready</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => goTo('/dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-left ${isActive('/dashboard') ? 'bg-pink-50 text-pink-500' : 'hover:bg-pink-50'}`}>
            <Home size={24} className={isActive('/dashboard') ? 'text-pink-500' : 'text-gray-600'} />
            <span className={`font-semibold text-lg ${isActive('/dashboard') ? 'text-pink-500' : 'text-gray-700'}`}>Home</span>
          </button>

          <button onClick={() => goTo('/reels')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group ${isActive('/reels') ? 'bg-pink-50' : ''}`}>
            <Grid size={24} className={isActive('/reels') ? 'text-pink-500' : 'text-gray-600 group-hover:text-pink-500'} />
            <span className={`font-medium text-lg ${isActive('/reels') ? 'text-pink-500' : 'text-gray-700 group-hover:text-pink-500'}`}>Reels</span>
          </button>

          <button onClick={() => goTo('/userlist')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group ${isActive('/userlist') ? 'bg-pink-50' : ''}`}>
            <MessageCircle size={24} className={isActive('/userlist') ? 'text-pink-500' : 'text-gray-600 group-hover:text-pink-500'} />
            <span className={`font-medium text-lg ${isActive('/userlist') ? 'text-pink-500' : 'text-gray-700 group-hover:text-pink-500'}`}>Chat</span>
          </button>

          <button onClick={() => goTo('/profile')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group ${isActive('/profile') ? 'bg-pink-50' : ''}`}>
            <User size={24} className={isActive('/profile') ? 'text-pink-500' : 'text-gray-600 group-hover:text-pink-500'} />
            <span className={`font-medium text-lg ${isActive('/profile') ? 'text-pink-500' : 'text-gray-700 group-hover:text-pink-500'}`}>Profile</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Your Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Profile Views</span><span className="font-semibold text-pink-500">{stats.profileViews}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Matches</span><span className="font-semibold text-pink-500">{stats.matches}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Likes Given</span><span className="font-semibold text-pink-500">{stats.likes}</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-pink-500">R U Ready</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowLikes(true)} className="relative p-2 hover:bg-pink-50 rounded-lg transition-colors">
                <Heart className="text-pink-500" size={24} />
                {likedProfiles.length > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{likedProfiles.length}</span></div>}
              </button>
              <button onClick={() => setShowFilters(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="text-gray-700" size={24} />
              </button>
              <button onClick={handleRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="text-gray-700" size={24} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="h-full flex items-center justify-center p-4 lg:p-8">
            {filteredProfiles.length === 0 ? (
              <div className="text-center">
                <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"><User size={64} className="text-pink-300" /></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No profiles found</h2>
                <p className="text-gray-500 mb-6">Try adjusting your filters or check back later!</p>
                <button onClick={handleRefresh} className="bg-pink-500 hover:bg-pink-600 text-white py-3 px-8 rounded-full font-semibold transition-colors">Reset Filters</button>
              </div>
            ) : (
              <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                <div className="relative" style={{ aspectRatio: '3/4' }}>
                  <ProfileCard 
                    profile={filteredProfiles[currentProfileIndex]} 
                    onLike={handleLike}
                    onSkip={handleSkip}
                    onMessage={() => handleMessage(filteredProfiles[currentProfileIndex].uid)}
                  />

                  {filteredProfiles.length > 1 && (
                    <>
                      <button onClick={prevProfile} className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-full transition-all duration-200 hover:scale-110">
                        <ChevronLeft className="text-white" size={28} />
                      </button>
                      <button onClick={nextProfile} className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-full transition-all duration-200 hover:scale-110">
                        <ChevronRight className="text-white" size={28} />
                      </button>
                    </>
                  )}

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    <span className="text-white font-semibold">{currentProfileIndex + 1} / {filteredProfiles.length}</span>
                  </div>
                </div>

                <div className="lg:hidden flex justify-center gap-6 mt-6">
                  <button onClick={handleSkip} className="bg-gray-500 hover:bg-gray-600 p-5 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                    <SkipForward className="text-white" size={32} />
                  </button>
                  <button onClick={() => handleMessage(filteredProfiles[currentProfileIndex].uid)} className="bg-purple-500 hover:bg-purple-600 p-5 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                    <MessageCircle className="text-white" size={32} />
                  </button>
                  <button onClick={handleLike} className="bg-pink-500 hover:bg-pink-600 p-6 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                    <Heart className="text-white fill-white" size={36} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden bg-pink-500 shadow-lg fixed bottom-0 left-0 right-0 z-40">
        <div className="flex justify-around items-center py-3">
          <button onClick={() => goTo('/dashboard')} className="flex flex-col items-center gap-1">
            <Home size={24} className={isActive('/dashboard') ? 'text-white' : 'text-white/60'} />
            <span className={`text-xs font-medium ${isActive('/dashboard') ? 'text-white' : 'text-white/60'}`}>Home</span>
          </button>
          <button onClick={() => goTo('/reels')} className="flex flex-col items-center gap-1">
            <Grid size={24} className={isActive('/reels') ? 'text-white' : 'text-white/60'} />
            <span className={`text-xs font-medium ${isActive('/reels') ? 'text-white' : 'text-white/60'}`}>Reels</span>
          </button>
          <button onClick={() => goTo('/userlist')} className="flex flex-col items-center gap-1">
            <MessageCircle size={24} className={isActive('/userlist') ? 'text-white' : 'text-white/60'} />
            <span className={`text-xs font-medium ${isActive('/userlist') ? 'text-white' : 'text-white/60'}`}>Chat</span>
          </button>
          <button onClick={() => goTo('/profile')} className="flex flex-col items-center gap-1">
            <User size={24} className={isActive('/profile') ? 'text-white' : 'text-white/60'} />
            <span className={`text-xs font-medium ${isActive('/profile') ? 'text-white' : 'text-white/60'}`}>Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <FilterModal isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} onFilterChange={setFilters} />
      <LikesModal isOpen={showLikes} onClose={() => setShowLikes(false)} likedProfiles={likedProfiles} onMessageClick={handleMessage} />
    </div>
  );
};

export default HomeDashboard;