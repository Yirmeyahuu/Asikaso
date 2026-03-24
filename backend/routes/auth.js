/**
 * Auth Routes
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authController.getMe);

/**
 * POST /api/auth/refresh
 * Refresh user session
 */
router.post('/refresh', authController.refreshSession);

/**
 * GET /api/auth/verify
 * Verify token validity
 */
router.get('/verify', authController.verifyToken);

module.exports = router;
