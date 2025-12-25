import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Grid, MessageCircle, User } from 'lucide-react';

export default function MobileBottomNav() {
  const navigate = useNavigate();

  return (
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
          className="flex flex-col items-center gap-1 text-white"
        >
          <MessageCircle size={24} />
          <span className="text-xs font-medium">Chat</span>
        </button>

        <button 
          onClick={() => navigate('/myprofile')}
          className="flex flex-col items-center gap-1 text-white/60"
        >
          <User size={24} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}