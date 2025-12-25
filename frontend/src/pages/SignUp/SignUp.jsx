// src/pages/Signup/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { Button, Input, Divider } from '../../components/common';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase.js';

const SignupPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUserInFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || '',
      online: false, // Will be set to true on login
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });
  };

  const handleEmailSignup = async () => {
    setGeneralError('');
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await createUserInFirestore(user);

      // Redirect to Login page after signup
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setGeneralError('This email is already registered. Try logging in.');
          break;
        case 'auth/weak-password':
          setGeneralError('Password is too weak.');
          break;
        case 'auth/invalid-email':
          setGeneralError('Invalid email address.');
          break;
        default:
          setGeneralError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGeneralError('');
    setIsLoading(true);

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createUserInFirestore(user);

      console.log('Google Signup successful:', user);

      // For Google users, go directly to dashboard (they're already authenticated)
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Signup error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setGeneralError('Google Sign-Up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
  };
  const handleLogin = () => {
    navigate('/login');
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
          Create Your Account ❤️
        </h1>

        {/* General Error */}
        {generalError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">
            {generalError}
          </div>
        )}

        {/* Signup Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 w-full shadow-xl mb-6">
          <div className="space-y-4 sm:space-y-5">
            <Input
              type="email"
              placeholder="Email"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
                setGeneralError('');
              }}
              error={errors.email}
              disabled={isLoading}
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              error={errors.password}
              disabled={isLoading}
            />

            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            <Button 
              onClick={handleEmailSignup} 
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </div>

        <Divider text="OR" />

        <div className="w-full space-y-4">
          <Button
            variant="outline"
            icon={UserCircle}
            onClick={handleGuestContinue}
            disabled={isLoading}
          >
            Continue as Guest
          </Button>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300 py-3 sm:py-4 px-6 rounded-full font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-md"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing up...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign up with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6 sm:mt-8">
          <span className="text-white text-base sm:text-lg">Already have an account? </span>
          <button
            onClick={handleLogin}
            className="text-white font-semibold text-base sm:text-lg underline hover:text-pink-100 transition-colors ml-2"
            disabled={isLoading}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
