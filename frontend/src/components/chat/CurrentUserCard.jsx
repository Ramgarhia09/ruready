import React from 'react';
import { User, ChevronRight } from 'lucide-react';

const CurrentUserCard = ({ user, navigate }) => {
  if (!user) return null;
  
  const handleClick = () => {
    if (navigate) {
      navigate('/myprofile');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="relative flex items-center gap-4 p-5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-y border-pink-100 cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 via-purple-100/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Profile Image */}
      <div className="relative shrink-0 z-10">
        <div className="relative">
          <img 
            src={user.photoURL || user.avatar || 'https://via.placeholder.com/150'} 
            alt={user.displayName || user.name}
            className="w-16 h-16 rounded-full object-cover ring-3 ring-pink-400 group-hover:ring-pink-500 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
          />
          {/* Online status indicator */}
          {user.online && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <div className="relative">
                <div className="w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-sm" />
                <div className="absolute inset-0 w-5 h-5 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          )}
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border-2 border-pink-300 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-lg bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent truncate group-hover:scale-105 transition-transform duration-300 origin-left">
            {user.displayName || user.name || user.email}
          </h3>
          <span className="px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-sm">
            You
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate group-hover:text-gray-700 transition-colors">
          {user.bio || 'View and edit your profile'}
        </p>
      </div>

      {/* Action Button */}
      <div className="shrink-0 z-10">
        <div className="relative">
          <button className="p-2.5 bg-white rounded-full shadow-md group-hover:shadow-lg group-hover:bg-pink-500 transition-all duration-300 border border-pink-200 group-hover:border-pink-500">
            <User 
              size={20} 
              className="text-pink-500 group-hover:text-white transition-colors duration-300" 
            />
          </button>
          {/* Chevron indicator */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
            <ChevronRight size={16} className="text-pink-500" />
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
};

export default CurrentUserCard;