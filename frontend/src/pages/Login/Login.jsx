// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { Button, Input, Divider } from '../../components/common';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "../../config/firebase.js"; // Make sure this exports auth & db

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Helper to save/update user in Firestore
  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        online: true,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });
    } else {
      // Update existing user (set online)
      await setDoc(userRef, {
        online: true,
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
  };

  const handleEmailLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await saveUserToFirestore(user);

      console.log('Email login successful:', user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Email login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setGeneralError('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setGeneralError('Too many attempts. Try again later.');
          break;
        default:
          setGeneralError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserToFirestore(user);

      console.log('Google Sign-In successful:', user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        // User closed popup — silent
      } else {
        setGeneralError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    // Optional: You can create anonymous user or just use localStorage
   
    navigate('/dashboard');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleEmailLogin();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-300 to-pink-400 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="bg-white rounded-full w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600">R</div>
            <div className="text-xs font-semibold text-gray-600">Ruready</div>
          </div>
        </div>

        <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center">
          Welcome to R U Ready ❤️
        </h1>

        {/* General Error */}
        {generalError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">
            {generalError}
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full shadow-xl mb-6">
          <div className="space-y-4 sm:space-y-5" onKeyPress={handleKeyPress}>
            <Input
              type="email"
              placeholder="Email"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                setGeneralError('');
              }}
              error={emailError}
              disabled={isLoading}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
                setGeneralError('');
              }}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={passwordError}
              disabled={isLoading}
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-pink-500 font-medium hover:text-pink-600 transition-colors text-sm sm:text-base"
                disabled={isLoading}
              >
                Forget password???
              </button>
            </div>

            <Button 
              onClick={handleEmailLogin} 
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login with Email'}
            </Button>
          </div>
        </div>

        <Divider text="OR" />

        <div className="w-full space-y-4">
          <Button 
            variant="secondary" 
            icon={UserCircle} 
            onClick={handleGuestContinue}
            disabled={isLoading}
          >
            Continue as Guest
          </Button>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 py-3 sm:py-4 px-6 rounded-full font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-white text-sm sm:text-base">
            New here?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-bold text-white underline hover:text-pink-100 transition-colors"
              disabled={isLoading}
            >
              Sign UP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;