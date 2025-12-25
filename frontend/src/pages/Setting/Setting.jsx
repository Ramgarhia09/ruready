// Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Grid, MessageCircle, User, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();

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
              <SettingsIcon className="text-gray-600" size={28} />
              <h1 className="text-2xl font-bold text-pink-500">Settings</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            
            {/* Settings List */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Discovery Settings */}
              <div className="border-b border-gray-200 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Discovery Settings
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Age, distance, gender preference, etc.
                </p>
              </div>

              {/* Notification Settings */}
              <div className="border-b border-gray-200 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Notification Settings
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Control push and in-app notifications.
                </p>
              </div>

              {/* App Theme */}
              <div className="p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  App Theme
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Light / Dark (future option)
                </p>
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

export default Settings;
