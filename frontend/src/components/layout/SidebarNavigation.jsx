import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Grid, MessageCircle, User } from 'lucide-react';

export default function SidebarNavigation() {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Ruready</h1>
        </div>
      </div>

      {/* Navigation Links */}
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
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg bg-pink-50 transition-colors text-left"
        >
          <MessageCircle size={24} className="text-pink-500" />
          <span className="text-pink-500 font-semibold text-lg">Chat</span>
        </button>

        <button
          onClick={() => navigate('/myprofile')}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors text-left group"
        >
          <User size={24} className="text-gray-600 group-hover:text-pink-500" />
          <span className="text-gray-700 font-medium text-lg group-hover:text-pink-500">Profile</span>
        </button>
      </nav>

      {/* Premium Card */}
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
  );
}