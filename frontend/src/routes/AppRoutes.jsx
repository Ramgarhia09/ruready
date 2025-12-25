import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { onForegroundMessage } from '../config/firebase';
import Login from '../pages/Login/Login';
import SignUp from "../pages/SignUp/SignUp";
import Dashboard from '../pages/Dashboard/Dashboard';
import ForgotPassword from '../pages/Fogot-Password/Forgot-Password';
import UsersListPage from '../pages/Users-List/Users-List';
import MyProfile from '../pages/MyProfile/MyProfile';
import Reels from '../pages/Reels/Reels';
import Settings from '../pages/Setting/Setting';
import PrivacySafety from '../pages/PrivacySafety/PrivacySafety';
import HelpCenter from '../pages/HelpCenter/HelpCenter';
import GoPremium from '../pages/GoPremium/Gopremium';
import CallOverlay from "../components/call/CallOverlay";
import useCallNotifications from "../hooks/useCallNotifications";

// Protected Route using REAL Firebase auth
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public route: redirect logged-in users away from login/signup
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Inner component that uses hooks
const AppContent = () => {
  const [notification, setNotification] = useState(null);
  
  // 🔥 Setup FCM token when user logs in
  useCallNotifications();

  // 🔥 Listen for foreground messages
  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onForegroundMessage((payload) => {
        console.log("📬 Foreground message received:", payload);
        setNotification(payload);

        // Show browser notification
        if (Notification.permission === "granted") {
          const notificationTitle = payload.notification?.title || "New Notification";
          const notificationBody = payload.notification?.body || "You have a new message";
          
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: payload.notification?.icon || "/logo.png",
            badge: "/badge.png",
            tag: payload.data?.tag || "default",
            requireInteraction: false,
            data: payload.data
          });
        }
      });
    } catch (error) {
      console.error("❌ Error setting up foreground message listener:", error);
    }

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // 🔥 Optional: Show notification toast/alert
  useEffect(() => {
    if (notification) {
      console.log("🔔 New notification received:", notification);
      // You can add toast notification here
      // Example: toast.success(notification.notification?.body);
    }
  }, [notification]);

  return (
    <>
      <CallOverlay />
      <Routes>
        {/* Default redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
          
        />
        <Route path="/userlist" element={<UsersListPage />} />
        <Route 
          path="/userlist/:userId" 
          element={
            <ProtectedRoute>
              <UsersListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/myprofile" 
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reels" 
          element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setting" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/privacysafety" 
          element={
            <ProtectedRoute>
              <PrivacySafety />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/helpcenter" 
          element={
            <ProtectedRoute>
              <HelpCenter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gopremium" 
          element={
            <ProtectedRoute>
              <GoPremium />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/premium" 
          element={
            <ProtectedRoute>
              <GoPremium />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

// Main component
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default AppRoutes;