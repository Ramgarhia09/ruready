// PrivacySafety.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Home, Grid, MessageCircle, User, Shield, 
  UserX, Eye, Lock, AlertCircle, ChevronRight, 
} from 'lucide-react';

const PrivacySafety = () => {
  const navigate = useNavigate();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowMessages, setAllowMessages] = useState('everyone');

  const goBack = () => {
    navigate(-1);
  };

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
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group"
          >
            <User size={24} className="text-gray-600 group-hover:text-pink-500" />
            <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500">Profile</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl text-white">
          <h3 className="font-bold mb-2">Go Premium</h3>
          <p className="text-sm mb-3 opacity-90">Unlock all features!</p>
          <button
            onClick={() => navigate('/premium')}
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
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={goBack}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="text-gray-700" size={24} />
              </button>
              <div className="w-10 h-10 lg:hidden bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <Shield className="text-green-500" size={28} />
              <h1 className="text-2xl font-bold text-pink-500">Privacy & Safety</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            
            {/* Security Banner */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 lg:p-8 text-white mb-6 shadow-xl">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Shield size={28} />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold">Your Safety Matters</h2>
                  <p className="text-lg opacity-90 mt-1">We're committed to keeping you safe</p>
                </div>
              </div>
            </div>

            {/* Block & Report Section */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <UserX className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Block & Report
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Manage blocked users and report issues</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-4">
                <button className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <UserX className="text-red-500" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-red-500 transition-colors">Blocked Users</h3>
                      <p className="text-sm text-gray-600">View and manage blocked accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>

                <button className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <AlertCircle className="text-orange-500" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">Report a Problem</h3>
                      <p className="text-sm text-gray-600">Report inappropriate behavior</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>

                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-blue-700">Safety Tip:</span> If someone makes you uncomfortable, block them immediately and report their profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Visibility Section */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Eye className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Profile Visibility
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Control who can see your profile</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-6">
                {/* Show Profile Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Show My Profile</h3>
                    <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                  </div>
                  <button
                    onClick={() => setProfileVisibility(!profileVisibility)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      profileVisibility ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      profileVisibility ? 'translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Online Status Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Show Online Status</h3>
                    <p className="text-sm text-gray-600">Let others see when you're online</p>
                  </div>
                  <button
                    onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      showOnlineStatus ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      showOnlineStatus ? 'translate-x-7' : 'translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Who Can Message Me */}
                <div className="p-5 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Who Can Message Me</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setAllowMessages('everyone')}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        allowMessages === 'everyone' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">Everyone</span>
                      {allowMessages === 'everyone' && (
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setAllowMessages('matches')}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        allowMessages === 'matches' 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">Matches Only</span>
                      {allowMessages === 'matches' && (
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Privacy Section */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Data & Privacy
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">How we use and protect your data</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-4">
                <button className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Lock className="text-blue-500" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-500 transition-colors">Privacy Policy</h3>
                      <p className="text-sm text-gray-600">Read our privacy policy</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>

                <button className="w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Shield className="text-indigo-500" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-500 transition-colors">Data Security</h3>
                      <p className="text-sm text-gray-600">Learn how we protect your data</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>

                <button className="w-full flex items-center justify-between p-5 border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <UserX className="text-red-500" size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-red-600 group-hover:text-red-700 transition-colors">Delete Account</h3>
                      <p className="text-sm text-gray-600">Permanently delete your account</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </button>

                <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <Shield className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold text-green-700 mb-1">Your data is encrypted</p>
                      <p>We use industry-standard encryption to protect your personal information and conversations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

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
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-1 text-white/60"
            >
              <User size={24} />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default PrivacySafety;
