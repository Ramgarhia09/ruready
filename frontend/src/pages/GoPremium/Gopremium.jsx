// GoPremium.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Star, Eye, MessageSquare, Heart, Home, Grid, MessageCircle, User } from 'lucide-react';

const GoPremium = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('3months');

  const goBack = () => {
    navigate(-1);
  };

  const features = [
    { icon: Zap, text: 'Unlimited Likes', color: 'text-pink-600' },
    { icon: Star, text: 'Profile Boost', color: 'text-pink-600' },
    { icon: Eye, text: 'See Who Likes You', color: 'text-pink-600' },
    { icon: MessageSquare, text: 'Unlimited Messages', color: 'text-pink-600' },
    { icon: Heart, text: 'Higher Match Rate', color: 'text-pink-600' },
  ];

  const plans = [
    { id: '1month', title: '1 Month Plan', price: '₹199', period: 'month', badge: null },
    { id: '3months', title: '3 Months Plan', price: '₹499', period: 'quarter', badge: 'BEST VALUE' },
    { id: '12months', title: '12 Months Plan', price: '₹999', period: 'year', badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-purple-50 flex">
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
          <h3 className="font-bold mb-2">Premium Features</h3>
          <p className="text-sm mb-3 opacity-90">Unlock unlimited access!</p>
          <div className="w-full bg-white/20 text-white py-2 px-4 rounded-lg font-semibold text-sm text-center">
            Active Page
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
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
              <Star className="text-pink-500" size={28} />
              <h1 className="text-2xl font-bold text-pink-500">Go Premium</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            
            {/* Premium Hero Card */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-8 md:p-10 text-white shadow-2xl mb-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L9.5 8.5L3 9.5L7.5 14L6.5 20.5L12 17L17.5 20.5L16.5 14L21 9.5L14.5 8.5L12 2Z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Upgrade to Premium</h2>
              <p className="text-center text-pink-100 text-base md:text-lg">
                Get noticed. Get matched. Get more love 💕
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mr-4">
                      <feature.icon className={feature.color} size={24} />
                    </div>
                    <span className="text-lg md:text-xl font-semibold text-gray-800">
                      {feature.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Plans */}
            <div className="space-y-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                    selectedPlan === plan.id
                      ? 'border-3 border-pink-600 shadow-xl scale-[1.02]'
                      : 'border-2 border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-6">
                      <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                        {plan.title}
                      </h3>
                      <p className="text-pink-600 text-lg md:text-xl font-semibold">
                        {plan.price} <span className="text-gray-500 font-normal">/ {plan.period}</span>
                      </p>
                    </div>
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id 
                          ? 'border-pink-600 bg-pink-600' 
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upgrade Button */}
            <div className="sticky bottom-0 pb-6 pt-4">
              <button 
                onClick={() => {
                  // Handle upgrade logic here
                  console.log('Selected plan:', selectedPlan);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xl md:text-2xl font-bold py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Upgrade Now
              </button>
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

export default GoPremium;
