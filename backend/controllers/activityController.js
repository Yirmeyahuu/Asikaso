/**
 * Activity Controller
 * Handles activity log operations
 */

const activityService = require('../services/activityService');

/**
 * Get recent activities
 * GET /api/activity
 */
const getRecentActivities = async (req, res) => {
  try {
    const { limit } = req.query;
    const activities = await activityService.getRecentActivities(parseInt(limit) || 50);
    res.json({ activities });
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
};

/**
 * Get activities by user
 * GET /api/activity/user/:userId
 */
const getActivitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const activities = await activityService.getActivitiesByUser(userId, parseInt(limit) || 50);
    res.json({ activities });
  } catch (error) {
    console.error('Error getting user activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
};

/**
 * Get activities by resource
 * GET /api/activity/resource/:resourceType/:resourceId
 */
const getActivitiesByResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const { limit } = req.query;
    const activities = await activityService.getActivitiesByResource(
      resourceType, 
      resourceId, 
      parseInt(limit) || 50
    );
    res.json({ activities });
  } catch (error) {
    console.error('Error getting resource activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
};

module.exports = {
  getRecentActivities,
  getActivitiesByUser,
  getActivitiesByResource,
};
