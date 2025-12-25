// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc,setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';   
import { requestFCMToken } from "../config/firebase";

const googleProvider = new GoogleAuthProvider();
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const signInWithGoogle = async () => {
  try {
    console.log("Starting Google login...");

    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;


    // FORCE SAVE TO FIRESTORE + LOUD CONFIRMATION
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Anonymous',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || '',
      online: true,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    // LOUD SUCCESS MESSAGES — YOU CANNOT MISS THESE
    console.log("USER SAVED TO FIRESTORE SUCCESSFULLY");
    console.log("Go to Firebase Console → Firestore → users →", firebaseUser.uid);
    alert(`SUCCESS! User saved in Firestore!\nUID: ${firebaseUser.uid}\nCheck Firebase Console now!`);

    

    return { success: true, user: firebaseUser };

  } catch (error) {
    console.error("LOGIN OR FIRESTORE WRITE FAILED:", error);
    alert("ERROR: " + error.message);
    return { success: false, error: error.message };
  }
};

  const logout = async () => {
    if (user) {
      // Mark user as offline before signing out
      await setDoc(doc(db, 'users', user.uid), {
        online: false,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }

    await signOut(auth);
    localStorage.clear();
  };

  // Keep online status updated in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Update online status every time auth state changes
        await setDoc(doc(db, 'users', currentUser.uid), {
          online: true,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Optional: Update online status when tab closes/refreshes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        navigator.sendBeacon && navigator.sendBeacon('/api/update-status', JSON.stringify({
          uid: user.uid,
          online: false,
          lastSeen: new Date()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};