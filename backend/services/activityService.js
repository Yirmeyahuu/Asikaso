/**
 * Activity Service
 * Handles activity logging for audit trails
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const ACTIVITY_COLLECTION = 'activity_logs';

/**
 * Log an activity
 */
const logActivity = async (activityData) => {
  const docRef = await db.collection(ACTIVITY_COLLECTION).add({
    userId: activityData.userId,
    action: activityData.action,
    resourceType: activityData.resourceType,
    resourceId: activityData.resourceId,
    details: activityData.details || {},
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: docRef.id, ...activityData };
};

/**
 * Get recent activities
 */
const getRecentActivities = async (limit = 50) => {
  const snapshot = await db.collection(ACTIVITY_COLLECTION)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
  }));
};

/**
 * Get activities by user
 */
const getActivitiesByUser = async (userId, limit = 50) => {
  const snapshot = await db.collection(ACTIVITY_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
  }));
};

/**
 * Get activities by resource
 */
const getActivitiesByResource = async (resourceType, resourceId, limit = 50) => {
  const snapshot = await db.collection(ACTIVITY_COLLECTION)
    .where('resourceType', '==', resourceType)
    .where('resourceId', '==', resourceId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
  }));
};

/**
 * Activity action types
 */
const ACTIVITY_ACTIONS = {
  // User actions
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  
  // Department actions
  DEPARTMENT_CREATED: 'department.created',
  DEPARTMENT_UPDATED: 'department.updated',
  DEPARTMENT_DELETED: 'department.deleted',
  
  // Task actions
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_STATUS_CHANGED: 'task.status_changed',
  TASK_ASSIGNED: 'task.assigned',
  
  // Subtask actions
  SUBTASK_CREATED: 'subtask.created',
  SUBTASK_UPDATED: 'subtask.updated',
  SUBTASK_DELETED: 'subtask.deleted',
  SUBTASK_COMPLETED: 'subtask.completed',
};

/**
 * Helper to log common actions
 */
const logTaskCreated = (userId, taskId, taskTitle) => 
  logActivity({
    userId,
    action: ACTIVITY_ACTIONS.TASK_CREATED,
    resourceType: 'task',
    resourceId: taskId,
    details: { title: taskTitle },
  });

const logTaskStatusChanged = (userId, taskId, oldStatus, newStatus) =>
  logActivity({
    userId,
    action: ACTIVITY_ACTIONS.TASK_STATUS_CHANGED,
    resourceType: 'task',
    resourceId: taskId,
    details: { oldStatus, newStatus },
  });

const logUserLogin = (userId) =>
  logActivity({
    userId,
    action: ACTIVITY_ACTIONS.USER_LOGIN,
    resourceType: 'user',
    resourceId: userId,
  });

module.exports = {
  logActivity,
  getRecentActivities,
  getActivitiesByUser,
  getActivitiesByResource,
  ACTIVITY_ACTIONS,
  logTaskCreated,
  logTaskStatusChanged,
  logUserLogin,
};
