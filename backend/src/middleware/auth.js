// src/middleware/auth.js

const { admin } = require('../config/firebase.config');
const logger = require('../utils/logger');

/**
 * Verify Firebase ID Token from Authorization header
 * Sets req.user with decoded token on success
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token format',
      });
    }

    // Verify with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach user to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      email_verified: decodedToken.email_verified || false,
      ...decodedToken, // Include all claims
    };

    logger.info('User authenticated', { uid: req.user.uid });

    next();
  } catch (error) {
    // Common Firebase auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Log real error internally, hide details from client
    logger.warn('Authentication failed', {
      error: error.message,
      code: error.code,
      ip: req.ip,
    });

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or revoked token',
    });
  }
};

/**
 * Optional: Check if user has admin privileges
 * Requires verifyToken to be used first
 */
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: 'User not found',
      });
    }

    const userData = userDoc.data();

    if (!userData.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    // Optionally attach full user data
    req.user.profile = userData;

    logger.info('Admin access granted', { uid: req.user.uid });

    next();
  } catch (error) {
    logger.error('Admin verification failed', {
      error: error.message,
      uid: req.user?.uid,
    });

    return res.status(500).json({
      success: false,
      error: 'Server error during admin check',
    });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
};