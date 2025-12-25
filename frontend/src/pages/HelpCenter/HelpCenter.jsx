// HelpCenter.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Grid, MessageCircle, User, HelpCircle, Mail, MessageSquare, Lightbulb, ChevronRight } from 'lucide-react';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const faqItems = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking 'Sign Up' on the login page. You can sign up using email, phone number, or your Google account."
    },
    {
      question: "How do I edit my profile?",
      answer: "Go to your Profile page and click the 'Edit Profile' button. You can update your name, bio, photos, and preferences."
    },
    {
      question: "How does matching work?",
      answer: "Our algorithm matches you based on your preferences, location, and interests. Swipe right to like, left to pass, and if both users like each other, it's a match!"
    },
    {
      question: "Is my data safe?",
      answer: "Yes! We take your privacy seriously. Your data is encrypted and we never share your personal information with third parties without your consent."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Settings > Privacy & Safety > Delete Account. Please note this action is permanent and cannot be undone."
    }
  ];

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Left Sidebar Navigation - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white shadow-lg z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
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

        <div className="p-4 m-4 bg-linear-to-br from-pink-500 to-purple-500 rounded-xl text-white">
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
              <div className="w-10 h-10 lg:hidden bg-linear-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <HelpCircle className="text-pink-500" size={28} />
              <h1 className="text-2xl font-bold text-pink-500">Help Center</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            
            {/* Welcome Section */}
            <div className="bg-linear-to-br from-pink-500 to-purple-500 rounded-3xl p-6 lg:p-8 text-white mb-6 shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">How can we help you?</h2>
              <p className="text-lg opacity-90">Find answers to your questions and get support</p>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
              <div className="bg-linear-to-r from-pink-50 to-purple-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="text-pink-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Quick answers to common questions</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {faqItems.map((item, index) => (
                  <div key={index} className="p-6">
                    <button
                      onClick={() => toggleSection(`faq-${index}`)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-500 transition-colors pr-4">
                        {item.question}
                      </h3>
                      <ChevronRight 
                        className={`text-gray-400 shrink-0 transition-transform ${
                          expandedSection === `faq-${index}` ? 'rotate-90' : ''
                        }`} 
                        size={20} 
                      />
                    </button>
                    {expandedSection === `faq-${index}` && (
                      <p className="mt-3 text-gray-600 text-base leading-relaxed">
                        {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            

            {/* App Tips Section */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="bg-linear-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                      App Tips & Tricks
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Get the most out of R U Ready</p>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-linear-to-r from-pink-50 to-purple-50 rounded-xl">
                    <div className="shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
                      <p className="text-sm text-gray-600">Add photos and write a compelling bio to get 3x more matches!</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Be Active Daily</h3>
                      <p className="text-sm text-gray-600">Regular activity increases your visibility and match potential.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Start Conversations</h3>
                      <p className="text-sm text-gray-600">Send thoughtful messages to your matches to increase response rates.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Use Filters Wisely</h3>
                      <p className="text-sm text-gray-600">Set realistic preferences to see more compatible matches.</p>
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
              onClick={() => navigate('/myprofile')}
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

export default HelpCenter;
