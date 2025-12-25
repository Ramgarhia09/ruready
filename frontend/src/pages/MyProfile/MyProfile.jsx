import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Home, Grid, MessageCircle, User, Camera, Edit2, Save, X } from 'lucide-react';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  updateProfile, 
  updateEmail 
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// Initialize Firebase services
const db = getFirestore();
const auth = getAuth();
const storage = getStorage();

const ProfileField = ({ label, value, isEditing, onChange, type = 'text' }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <label className="text-pink-500 font-semibold text-lg mb-2 block">{label}</label>
      {isEditing ? (
        type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700"
          >
            <option value="">Select {label}</option>
            {label === 'Gender' && (
              <>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </>
            )}
            {label === 'Preference' && (
              <>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Everyone">Everyone</option>
              </>
            )}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )
      ) : (
        <p className="text-gray-700 text-lg">{value || 'Not provided'}</p>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    preference: '',
    city: '',
    bio: '',
    photoURL: '',
    plan: 'Free'
  });

  // Fetch user data from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData({
              name: userData.displayName || user.displayName || '',
              email: user.email || '',
              phone: userData.phone || '',
              dob: userData.dob || '',
              gender: userData.gender || '',
              preference: userData.preference || '',
              city: userData.city || '',
              bio: userData.bio || '',
              photoURL: userData.photoURL || user.photoURL || '',
              plan: userData.plan || 'Free'
            });
          } else {
            // If no Firestore document, use auth data
            setProfileData({
              name: user.displayName || '',
              email: user.email || '',
              phone: '',
              dob: '',
              gender: '',
              preference: '',
              city: '',
              bio: '',
              photoURL: user.photoURL || '',
              plan: 'Free'
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle image upload to Firebase Storage
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-images/${currentUser.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update profile data
      setProfileData({ ...profileData, photoURL: downloadURL });
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Update Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: serverTimestamp()
      });
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle save profile
  const handleSave = async () => {
    if (!currentUser) return;

    // Validation
    if (!profileData.name.trim()) {
      alert('Name is required');
      return;
    }

    setSaving(true);
    try {
      // Update Firebase Auth profile (name only)
      await updateProfile(currentUser, {
        displayName: profileData.name
      });

      // Update Firestore with all profile data
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: profileData.name,
        phone: profileData.phone,
        dob: profileData.dob,
        gender: profileData.gender,
        preference: profileData.preference,
        city: profileData.city,
        bio: profileData.bio,
        updatedAt: serverTimestamp()
      });

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload user data to reset changes
    if (currentUser) {
      getDoc(doc(db, 'users', currentUser.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            name: userData.displayName || currentUser.displayName || '',
            email: currentUser.email || '',
            phone: userData.phone || '',
            dob: userData.dob || '',
            gender: userData.gender || '',
            preference: userData.preference || '',
            city: userData.city || '',
            bio: userData.bio || '',
            photoURL: userData.photoURL || currentUser.photoURL || '',
            plan: userData.plan || 'Free'
          });
        }
      });
    }
  };

  const updateField = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const goTo = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      // Update user status to offline
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          online: false,
          lastSeen: serverTimestamp()
        });
      }
      
      await auth.signOut();
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Left Sidebar Navigation - Desktop */}
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
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group"
          >
            <Home size={24} className="text-gray-600 group-hover:text-pink-500" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500">Home</span>
          </button>

          <button
            onClick={() => navigate('/reels')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group"
          >
            <Grid size={24} className="text-gray-600 group-hover:text-pink-500" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500">Reels</span>
          </button>

          <button
            onClick={() => navigate('/userList')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group"
          >
            <MessageCircle size={24} className="text-gray-600 group-hover:text-pink-500" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500">Chat</span>
          </button>

          <button
            onClick={() => navigate('/myprofile')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-pink-50 transition-colors text-left"
          >
            <User size={24} className="text-pink-500" />
            <span className="text-pink-500 font-semibold text-lg">Profile</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl text-white">
          <h3 className="font-bold mb-2">Go Premium</h3>
          <p className="text-sm mb-3 opacity-90">Unlock all features!</p>
          <button
            onClick={() => navigate('/gopremium')}
            className="w-full bg-white text-pink-500 py-2 px-4 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Ruready</h1>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-pink-500">My Profile</h2>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="text-gray-700" size={24} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Profile Image Section */}
              <div className="bg-gradient-to-b from-pink-100 to-white p-8 text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-purple-200 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
                    {profileData.photoURL ? (
                      <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={80} className="text-gray-400" />
                    )}
                  </div>

                  {isEditing && (
                    <label className={`absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 p-3 rounded-full cursor-pointer transition-colors shadow-lg ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploadingImage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Camera className="text-white" size={20} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </>
                      )}
                    </label>
                  )}
                </div>
                {uploadingImage && (
                  <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
                )}
              </div>

              {/* Profile Fields */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                  <ProfileField 
                    label="Name" 
                    value={profileData.name} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('name', v)} 
                  />
                  <ProfileField 
                    label="Email" 
                    value={profileData.email} 
                    isEditing={false} 
                    onChange={(v) => updateField('email', v)} 
                    type="email" 
                  />
                  <ProfileField 
                    label="Phone" 
                    value={profileData.phone} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('phone', v)} 
                    type="tel" 
                  />
                  <ProfileField 
                    label="DOB" 
                    value={profileData.dob} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('dob', v)} 
                    type="date" 
                  />
                  <ProfileField 
                    label="Gender" 
                    value={profileData.gender} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('gender', v)} 
                    type="select"
                  />
                  <ProfileField 
                    label="Preference" 
                    value={profileData.preference} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('preference', v)} 
                    type="select"
                  />
                  <ProfileField 
                    label="City" 
                    value={profileData.city} 
                    isEditing={isEditing} 
                    onChange={(v) => updateField('city', v)} 
                  />
                </div>

                {/* Bio Section */}
                <div className="border-b border-gray-200 py-4">
                  <label className="text-pink-500 font-semibold text-lg mb-2 block">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:outline-none text-gray-700 min-h-[100px]"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-gray-700 text-lg">{profileData.bio || 'Not provided'}</p>
                  )}
                </div>

                {/* Plan Section */}
                <div className="py-4">
                  <label className="text-pink-500 font-semibold text-lg mb-2 block">Plan</label>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 text-lg">{profileData.plan}</p>
                    {profileData.plan === 'Free' && (
                      <button
                        onClick={() => navigate('/gopremium')}
                        className="text-pink-500 hover:text-pink-600 font-semibold text-sm"
                      >
                        Upgrade →
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
                    >
                      <Edit2 size={24} />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {saving ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={24} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-4 px-6 rounded-full font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg"
                      >
                        <X size={24} />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Upgrade Card */}
            {profileData.plan === 'Free' && (
              <div className="mt-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="mb-6 opacity-90">Unlock exclusive features and find your perfect match faster!</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Unlimited likes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>See who liked you</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Advanced filters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Ad-free experience</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/gopremium')} 
                  className="bg-white text-pink-500 py-3 px-8 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="lg:hidden bg-pink-500 shadow-lg fixed bottom-0 left-0 right-0 z-40">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col items-center gap-1 text-white/60"
          >
            <Home size={24} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={() => navigate('/reels')} 
            className="flex flex-col items-center gap-1 text-white/60"
          >
            <Grid size={24} />
            <span className="text-xs font-medium">Reels</span>
          </button>
          <button 
            onClick={() => navigate('/userList')} 
            className="flex flex-col items-center gap-1 text-white/60"
          >
            <MessageCircle size={24} />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button 
            onClick={() => navigate('/myprofile')} 
            className="flex flex-col items-center gap-1 text-white"
          >
            <User size={24} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Sidebar Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Header */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold">Welcome</h3>
              {profileData.name && <p className="text-pink-100 mt-1">{profileData.name}</p>}
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <button 
                onClick={() => goTo('/gopremium')} 
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-lg">Go Premium</span>
              </button>

              <button 
                onClick={() => goTo('/setting')} 
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-lg">Settings</span>
              </button>

              <button 
                onClick={() => goTo('/privacysafety')} 
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-lg">Privacy & Safety</span>
              </button>

              <button 
                onClick={() => goTo('/helpcenter')} 
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium text-lg">Help Center</span>
              </button>

              <div className="border-t border-gray-200 my-4"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-red-500 font-medium text-lg">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;