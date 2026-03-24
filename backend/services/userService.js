/**
 * User Service
 * Handles all user-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const USERS_COLLECTION = 'users';

/**
 * Get all users (for admin)
 */
const getAllUsers = async () => {
  const snapshot = await db.collection(USERS_COLLECTION).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a new user
 */
const createUser = async (userData, uid) => {
  const userRef = db.collection(USERS_COLLECTION).doc(uid);
  
  const userDoc = {
    uid,
    email: userData.email,
    displayName: userData.displayName || '',
    role: userData.role || 'employee',
    departmentId: userData.departmentId || null,
    photoURL: userData.photoURL || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  };

  await userRef.set(userDoc);
  return { id: uid, ...userDoc };
};

/**
 * Update user
 */
const updateUser = async (userId, userData) => {
  const userRef = db.collection(USERS_COLLECTION).doc(userId);
  
  const updateData = {
    ...userData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Remove fields that shouldn't be updated
  delete updateData.uid;
  delete updateData.email;
  delete updateData.createdAt;

  await userRef.update(updateData);
  return getUserById(userId);
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  await db.collection(USERS_COLLECTION).doc(userId).delete();
};

/**
 * Get users by department
 */
const getUsersByDepartment = async (departmentId) => {
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('departmentId', '==', departmentId)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get department managers
 */
const getDepartmentManagers = async () => {
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('role', '==', 'department_manager')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Sync user from Firebase Auth to Firestore
 */
const syncUserFromAuth = async (firebaseUser) => {
  const existingUser = await getUserById(firebaseUser.uid);
  
  if (existingUser) {
    return existingUser;
  }

  // Create new user record
  return createUser({
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
    photoURL: firebaseUser.photoURL || '',
    role: 'employee', // Default role
  }, firebaseUser.uid);
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUsersByDepartment,
  getDepartmentManagers,
  syncUserFromAuth,
};
