/**
 * Activity Routes
 * Activity log endpoints
 */

const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/rbac');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/activity
 * Get recent activities (Admin and Manager)
 */
router.get('/', authorize('admin', 'department_manager'), activityController.getRecentActivities);

/**
 * GET /api/activity/user/:userId
 * Get activities by user
 */
router.get('/user/:userId', activityController.getActivitiesByUser);

/**
 * GET /api/activity/resource/:resourceType/:resourceId
 * Get activities by resource
 */
router.get('/resource/:resourceType/:resourceId', activityController.getActivitiesByResource);

module.exports = router;
