const admin = require('firebase-admin');
const path = require('path');

// Check if running in development mode (local)
const isLocal = process.env.NODE_ENV === 'development';

let serviceAccount;

if (isLocal) {
  // In development: Load from environment variables
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    // These are optional but can be added to .env if needed
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
    client_id: process.env.FIREBASE_CLIENT_ID || undefined,
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || undefined,
    universe_domain: 'googleapis.com'
  };
} else {
  // In production: Load from JSON file in secure location
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (error) {
    console.error('Failed to load Firebase service account from JSON file:', error.message);
    console.error('Please ensure firebase-service-account.json exists in the backend directory for production.');
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export Firestore database instance
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Export admin for use in other modules
module.exports = { admin, db };
