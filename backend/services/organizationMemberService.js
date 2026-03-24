/**
 * Organization Member Service
 * Handles all organization member-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const ORGANIZATION_MEMBERS_COLLECTION = 'organization_members';

/**
 * Get all organization members
 */
const getAllOrganizationMembers = async () => {
  const snapshot = await db.collection(ORGANIZATION_MEMBERS_COLLECTION)
    .orderBy('createdAt', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
  }));
};

/**
 * Get organization member by ID
 */
const getOrganizationMemberById = async (memberId) => {
  const doc = await db.collection(ORGANIZATION_MEMBERS_COLLECTION).doc(memberId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Get organization member by email
 */
const getOrganizationMemberByEmail = async (email) => {
  const snapshot = await db.collection(ORGANIZATION_MEMBERS_COLLECTION)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Check if user exists in Firebase Auth by email
 * Returns user record if exists, null otherwise
 */
const checkUserExistsInAuth = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return {
      exists: true,
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { exists: false };
    }
    throw error;
  }
};

/**
 * Add a new organization member
 * Checks if user exists in Firebase Auth first
 * @param {string} email - User's email address
 * @param {string} addedBy - User ID of person adding the member
 * @param {boolean} isAdmin - If true, add as admin role
 */
const addOrganizationMember = async (email, addedBy, isAdmin = false) => {
  // Check if user exists in Firebase Auth
  const authCheck = await checkUserExistsInAuth(email);
  
  if (!authCheck.exists) {
    return {
      success: false,
      error: 'USER_NOT_REGISTERED',
      message: 'This Gmail account is not registered. The user must sign in to ASIK first before being added to the organization.',
    };
  }
  
  // Check if already a member
  const existingMember = await getOrganizationMemberByEmail(email);
  if (existingMember) {
    return {
      success: false,
      error: 'ALREADY_MEMBER',
      message: 'This user is already an organization member.',
    };
  }
  
  const role = isAdmin ? 'admin' : 'organization_member';
  
  // Add to organization members collection
  const docRef = await db.collection(ORGANIZATION_MEMBERS_COLLECTION).add({
    email: email.toLowerCase(),
    userId: authCheck.uid,
    displayName: authCheck.displayName || email.split('@')[0],
    role: role,
    addedBy: addedBy,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    isActive: true,
  });
  
  return {
    success: true,
    member: {
      id: docRef.id,
      email: email.toLowerCase(),
      userId: authCheck.uid,
      displayName: authCheck.displayName || email.split('@')[0],
      role: role,
    },
  };
};

/**
 * Remove organization member
 */
const removeOrganizationMember = async (memberId) => {
  const member = await getOrganizationMemberById(memberId);
  if (!member) {
    return { success: false, error: 'MEMBER_NOT_FOUND' };
  }
  
  await db.collection(ORGANIZATION_MEMBERS_COLLECTION).doc(memberId).delete();
  
  return { success: true };
};

/**
 * Update organization member role
 */
const updateOrganizationMemberRole = async (memberId, role) => {
  const memberRef = db.collection(ORGANIZATION_MEMBERS_COLLECTION).doc(memberId);
  
  await memberRef.update({
    role,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return getOrganizationMemberById(memberId);
};

/**
 * Get organization member count
 */
const getOrganizationMemberCount = async () => {
  const snapshot = await db.collection(ORGANIZATION_MEMBERS_COLLECTION)
    .where('isActive', '==', true)
    .get();
  
  return snapshot.size;
};

module.exports = {
  getAllOrganizationMembers,
  getOrganizationMemberById,
  getOrganizationMemberByEmail,
  checkUserExistsInAuth,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
  getOrganizationMemberCount,
};
