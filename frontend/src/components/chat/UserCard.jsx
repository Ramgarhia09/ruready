import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { formatMessageTime } from '../../utils/chatHelpers';

const UserCard = ({ user, onSelect, isSelected, lastMessage, onCall }) => {
  return (
    <div 
      onClick={() => onSelect(user)}
      className={`relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 group ${
        isSelected 
          ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 shadow-sm' 
          : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-pink-200'
      }`}
    >
      {/* Profile Image */}
      <div className="relative shrink-0">
        <div className={`relative transition-transform duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}>
          <img 
            src={user.photoURL || user.avatar || 'https://via.placeholder.com/150'} 
            alt={user.displayName || user.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
          />
          {/* Online Status */}
          {user.online && (
            <div className="absolute bottom-0 right-0">
              <div className="relative">
                <div className="w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold truncate transition-colors ${
            isSelected ? 'text-pink-600' : 'text-gray-800 group-hover:text-pink-600'
          }`}>
            {user.displayName || user.name || user.email || 'Unknown User'}
          </h3>
          {lastMessage?.timestamp && (
            <span className="text-xs text-gray-400 shrink-0 ml-2">
              {formatMessageTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {lastMessage?.text && (
            <MessageCircle size={14} className="text-gray-400 shrink-0" />
          )}
          <p className="text-sm text-gray-500 truncate flex-1">
            {lastMessage?.text || user.bio || 'No messages yet'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Unread Badge */}
        {lastMessage?.unreadCount > 0 && (
          <div className="relative">
            <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">{lastMessage.unreadCount}</span>
            </div>
            <div className="absolute inset-0 w-7 h-7 bg-pink-400 rounded-full animate-ping opacity-25"></div>
          </div>
        )}
      </div>

      {/* Selected Indicator Line */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
      )}
    </div>
  );
};

export default UserCard;