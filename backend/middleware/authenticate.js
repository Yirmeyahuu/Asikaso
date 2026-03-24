/**
 * Authentication Middleware
 * Verifies Firebase Auth tokens from the Authorization header
 */

const { admin } = require('../firebaseAdmin');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No token provided',
      message: 'Authorization header with Bearer token required' 
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name || decodedToken.displayName,
      photoURL: decodedToken.picture || decodedToken.photoURL,
      role: decodedToken.role || 'employee', // Default role
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please log in again' 
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        error: 'Token revoked',
        message: 'Please log in again' 
      });
    }

    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed' 
    });
  }
};

module.exports = { authenticate };
