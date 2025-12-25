// src/config/firebase.config.js

const admin = require('firebase-admin');
require('dotenv').config();

// Helper to safely get and validate env vars
const getRequiredEnv = (key, name) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Firebase config error: ${name} is missing in environment variables`);
  }
  return value;
};

// Load and validate required Firebase credentials
const projectId = getRequiredEnv('FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID');
const privateKey = getRequiredEnv('FIREBASE_PRIVATE_KEY', 'FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL', 'FIREBASE_CLIENT_EMAIL');

// Prevent double initialization (safe in production, helpful in tests/hot reloads)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

// Export initialized instances
const db = admin.firestore();

// Optional: Improve Firestore settings for production
db.settings({
  ignoreUndefinedProperties: true, // Prevents errors with undefined fields
});

module.exports = {
  admin,
  db,
};