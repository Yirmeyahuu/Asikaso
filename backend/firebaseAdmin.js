const admin = require('firebase-admin');
const path = require('path');

// Load service account from JSON file
const serviceAccount = require('./asikaso-1b474-firebase-adminsdk-fbsvc-63ef04153b.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export Firestore database instance
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// Export admin for use in other modules
module.exports = { admin, db };
