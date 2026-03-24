/**
 * Subtask Service
 * Handles all subtask-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const SUBTASKS_COLLECTION = 'subtasks';

/**
 * Get all subtasks for a task
 */
const getSubtasksByTask = async (taskId) => {
  const snapshot = await db.collection(SUBTASKS_COLLECTION)
    .where('taskId', '==', taskId)
    .orderBy('createdAt', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get subtask by ID
 */
const getSubtaskById = async (subtaskId) => {
  const doc = await db.collection(SUBTASKS_COLLECTION).doc(subtaskId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a new subtask
 */
const createSubtask = async (subtaskData) => {
  const docRef = await db.collection(SUBTASKS_COLLECTION).add({
    title: subtaskData.title,
    taskId: subtaskData.taskId,
    completed: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return getSubtaskById(docRef.id);
};

/**
 * Update subtask
 */
const updateSubtask = async (subtaskId, subtaskData) => {
  const subtaskRef = db.collection(SUBTASKS_COLLECTION).doc(subtaskId);
  
  const updateData = {
    ...subtaskData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await subtaskRef.update(updateData);
  return getSubtaskById(subtaskId);
};

/**
 * Toggle subtask completion
 */
const toggleSubtaskCompletion = async (subtaskId) => {
  const subtask = await getSubtaskById(subtaskId);
  if (!subtask) {
    return null;
  }

  const subtaskRef = db.collection(SUBTASKS_COLLECTION).doc(subtaskId);
  await subtaskRef.update({
    completed: !subtask.completed,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return getSubtaskById(subtaskId);
};

/**
 * Delete subtask
 */
const deleteSubtask = async (subtaskId) => {
  await db.collection(SUBTASKS_COLLECTION).doc(subtaskId).delete();
};

/**
 * Delete all subtasks for a task
 */
const deleteSubtasksByTask = async (taskId) => {
  const snapshot = await db.collection(SUBTASKS_COLLECTION)
    .where('taskId', '==', taskId)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
};

/**
 * Get subtask completion stats for a task
 */
const getSubtaskStats = async (taskId) => {
  const snapshot = await db.collection(SUBTASKS_COLLECTION)
    .where('taskId', '==', taskId)
    .get();
  
  const subtasks = snapshot.docs.map(doc => doc.data());
  
  return {
    total: subtasks.length,
    completed: subtasks.filter(s => s.completed).length,
    pending: subtasks.filter(s => !s.completed).length,
  };
};

module.exports = {
  getSubtasksByTask,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
  deleteSubtasksByTask,
  getSubtaskStats,
};
