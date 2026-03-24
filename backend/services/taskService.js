/**
 * Task Service
 * Handles all task-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const TASKS_COLLECTION = 'tasks';

// Helper to convert Firestore Timestamp fields to ISO strings
const convertTimestamps = (data) => {
  if (!data) return data;
  const result = { ...data };
  if (result.dueDate && typeof result.dueDate.toDate === 'function') {
    result.dueDate = result.dueDate.toDate().toISOString();
  }
  if (result.createdAt && typeof result.createdAt.toDate === 'function') {
    result.createdAt = result.createdAt.toDate().toISOString();
  }
  if (result.updatedAt && typeof result.updatedAt.toDate === 'function') {
    result.updatedAt = result.updatedAt.toDate().toISOString();
  }
  return result;
};

/**
 * Get all tasks
 */
const getAllTasks = async () => {
  const snapshot = await db.collection(TASKS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

/**
 * Get task by ID
 */
const getTaskById = async (taskId) => {
  const doc = await db.collection(TASKS_COLLECTION).doc(taskId).get();
  if (!doc.exists) {
    return null;
  }
  return convertTimestamps({ id: doc.id, ...doc.data() });
};

/**
 * Get tasks by department
 */
const getTasksByDepartment = async (departmentId) => {
  const snapshot = await db.collection(TASKS_COLLECTION)
    .where('departmentId', '==', departmentId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

/**
 * Get tasks by assignee
 */
const getTasksByAssignee = async (assigneeId) => {
  const snapshot = await db.collection(TASKS_COLLECTION)
    .where('assigneeId', '==', assigneeId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

/**
 * Get tasks by status
 */
const getTasksByStatus = async (status) => {
  const snapshot = await db.collection(TASKS_COLLECTION)
    .where('status', '==', status)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

/**
 * Create a new task
 */
const createTask = async (taskData, creatorId) => {
  const docRef = await db.collection(TASKS_COLLECTION).add({
    title: taskData.title,
    description: taskData.description || '',
    status: taskData.status || 'todo',
    priority: taskData.priority || 'medium',
    departmentId: taskData.departmentId || null,
    assigneeId: taskData.assigneeId || null,
    creatorId,
    dueDate: taskData.dueDate ? admin.firestore.Timestamp.fromDate(new Date(taskData.dueDate)) : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  });

  return getTaskById(docRef.id);
};

/**
 * Update task
 */
const updateTask = async (taskId, taskData) => {
  const taskRef = db.collection(TASKS_COLLECTION).doc(taskId);
  
  const updateData = {
    ...taskData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Convert dueDate if provided
  if (taskData.dueDate) {
    updateData.dueDate = admin.firestore.Timestamp.fromDate(new Date(taskData.dueDate));
  }

  await taskRef.update(updateData);
  return getTaskById(taskId);
};

/**
 * Delete task
 */
const deleteTask = async (taskId) => {
  await db.collection(TASKS_COLLECTION).doc(taskId).delete();
};

/**
 * Update task status (for drag and drop)
 */
const updateTaskStatus = async (taskId, status) => {
  const taskRef = db.collection(TASKS_COLLECTION).doc(taskId);
  
  await taskRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return getTaskById(taskId);
};

/**
 * Get tasks for dashboard (recent + by priority)
 */
const getDashboardTasks = async (userId, role, departmentId) => {
  let query = db.collection(TASKS_COLLECTION);
  
  if (role === 'employee') {
    // Employees see tasks assigned to them OR tasks with no assignee (available tasks)
    // Query without filter to get all active tasks for employees
    query = query.where('isActive', '==', true);
  } else if (role === 'department_manager' && departmentId) {
    // Managers see tasks in their department
    query = query.where('departmentId', '==', departmentId);
  }
  // Admin gets all tasks (no filter applied)
  
  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

/**
 * Get task statistics
 */
const getTaskStats = async (departmentId = null) => {
  let query = db.collection(TASKS_COLLECTION);
  
  if (departmentId) {
    const deptSnapshot = await query.where('departmentId', '==', departmentId).get();
    const tasks = deptSnapshot.docs.map(doc => doc.data());
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate.toDate() < new Date() && t.status !== 'done').length,
    };
  }
  
  const snapshot = await query.get();
  const tasks = snapshot.docs.map(doc => doc.data());
  
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate.toDate() < new Date() && t.status !== 'done').length,
  };
};

module.exports = {
  getAllTasks,
  getTaskById,
  getTasksByDepartment,
  getTasksByAssignee,
  getTasksByStatus,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getDashboardTasks,
  getTaskStats,
};
