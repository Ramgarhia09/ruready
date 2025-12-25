import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function Header({ allUsers }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="w-10 h-10 lg:hidden bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-pink-500">Messages</h1>
          </div>

          <p className="text-sm text-gray-500">
            {allUsers.length} user{allUsers.length !== 1 && 's'} online
          </p>
        </div>
      </div>
    </header>
  );
}