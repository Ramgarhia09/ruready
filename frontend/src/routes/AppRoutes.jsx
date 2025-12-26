import React from 'react'; // ← REQUIRED FIX: Import React for cloneElement
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { onForegroundMessage } from '../config/firebase';

import Login from '../pages/Login/Login';
import SignUp from "../pages/SignUp/SignUp";
import Dashboard from '../pages/Dashboard/Dashboard'; // This is your HomeDashboard component
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

// GuestAllowedRoute: Allows both guests and authenticated users
// Passes isGuest={true} when user is not logged in
const GuestAllowedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  // Pass isGuest prop: true if no user, false if logged in
  return React.cloneElement(children, { isGuest: !user });
};

// Protected Route: Only logged-in users
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route: Only guests (redirect logged-in users away)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Main App Content with Routes
const AppContent = () => {
  const [notification, setNotification] = useState(null);

  // Setup call notifications (FCM token, etc.)
  useCallNotifications();

  // Listen for foreground FCM messages
  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onForegroundMessage((payload) => {
        console.log("📬 Foreground message received:", payload);
        setNotification(payload);

        // Browser notification
        if (Notification.permission === "granted") {
          const title = payload.notification?.title || "New Notification";
          const body = payload.notification?.body || "You have a new message";

          new Notification(title, {
            body,
            icon: payload.notification?.icon || "/logo.png",
            badge: "/badge.png",
            tag: payload.data?.tag || "default",
            requireInteraction: false,
            data: payload.data,
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

  // Optional: Handle notification (e.g., show toast)
  useEffect(() => {
    if (notification) {
      console.log("🔔 Notification:", notification);
      // Add toast here if desired
    }
  }, [notification]);

  return (
    <>
      <CallOverlay />
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes - Only for guests */}
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

        {/* Guest + Logged-in: Dashboard with restrictions for guests */}
        <Route
          path="/dashboard"
          element={
            <GuestAllowedRoute>
              <Dashboard />
            </GuestAllowedRoute>
          }
        />

        {/* Protected Routes - Require login */}
        <Route path="/userlist" element={<UsersListPage />} /> {/* Base list - will redirect guests inside component if needed */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

// Main App Entry
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default AppRoutes;
