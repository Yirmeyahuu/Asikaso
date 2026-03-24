/**
 * Auth Controller
 * Handles authentication-related endpoints
 */

const userService = require('../services/userService');
const { logUserLogin } = require('../services/activityService');

/**
 * Verify and get current user info
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = req.user;
    
    // Get full user profile from Firestore
    const userProfile = await userService.getUserById(user.uid);
    
    if (!userProfile) {
      // Create new user profile if doesn't exist
      const newUser = await userService.createUser({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }, user.uid);
      
      return res.json({ user: newUser });
    }
    
    // Log login activity
    await logUserLogin(user.uid);
    
    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

/**
 * Refresh user session
 * POST /api/auth/refresh
 */
const refreshSession = async (req, res) => {
  try {
    const user = req.user;
    const userProfile = await userService.getUserById(user.uid);
    
    if (!userProfile) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error in refreshSession:', error);
    res.status(500).json({ error: 'Failed to refresh session' });
  }
};

/**
 * Verify token validity
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    const userProfile = await userService.getUserById(user.uid);
    
    res.json({ 
      valid: true, 
      user: userProfile,
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};

module.exports = {
  getMe,
  refreshSession,
  verifyToken,
};
