/**
 * Department Service
 * Handles all department-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const DEPARTMENTS_COLLECTION = 'departments';

/**
 * Get all departments
 */
const getAllDepartments = async () => {
  const snapshot = await db.collection(DEPARTMENTS_COLLECTION)
    .orderBy('name', 'asc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get department by ID
 */
const getDepartmentById = async (departmentId) => {
  const doc = await db.collection(DEPARTMENTS_COLLECTION).doc(departmentId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a new department
 */
const createDepartment = async (departmentData) => {
  const docRef = await db.collection(DEPARTMENTS_COLLECTION).add({
    name: departmentData.name,
    description: departmentData.description || '',
    managerId: departmentData.managerId || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  });

  return getDepartmentById(docRef.id);
};

/**
 * Update department
 */
const updateDepartment = async (departmentId, departmentData) => {
  const deptRef = db.collection(DEPARTMENTS_COLLECTION).doc(departmentId);
  
  const updateData = {
    ...departmentData,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await deptRef.update(updateData);
  return getDepartmentById(departmentId);
};

/**
 * Delete department
 */
const deleteDepartment = async (departmentId) => {
  await db.collection(DEPARTMENTS_COLLECTION).doc(departmentId).delete();
};

/**
 * Get department by manager ID
 */
const getDepartmentByManager = async (managerId) => {
  const snapshot = await db.collection(DEPARTMENTS_COLLECTION)
    .where('managerId', '==', managerId)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Get departments where user is a member
 */
const getDepartmentsByUser = async (userId) => {
  const user = await db.collection('users').doc(userId).get();
  if (!user.exists || !user.data().departmentId) {
    return [];
  }
  
  const dept = await getDepartmentById(user.data().departmentId);
  return dept ? [dept] : [];
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentByManager,
  getDepartmentsByUser,
};
