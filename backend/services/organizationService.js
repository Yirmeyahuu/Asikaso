/**
 * Organization Service
 * Handles all organization-related Firestore operations
 */

const { db } = require('../firebaseAdmin');
const { admin } = require('../firebaseAdmin');

const ORGANIZATIONS_COLLECTION = 'organizations';

/**
 * Get organization by ID
 */
const getOrganizationById = async (organizationId) => {
  const doc = await db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * Get organization by admin user ID
 */
const getOrganizationByAdmin = async (adminUserId) => {
  const snapshot = await db.collection(ORGANIZATIONS_COLLECTION)
    .where('adminUserId', '==', adminUserId)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Check if any organization exists
 */
const getAnyOrganization = async () => {
  const snapshot = await db.collection(ORGANIZATIONS_COLLECTION)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

/**
 * Create a new organization
 * The creator becomes the admin
 */
const createOrganization = async (name, description, createdBy) => {
  // Check if organization already exists
  const existing = await getAnyOrganization();
  if (existing) {
    return {
      success: false,
      error: 'ORGANIZATION_EXISTS',
      message: 'An organization already exists.',
    };
  }
  
  const docRef = await db.collection(ORGANIZATIONS_COLLECTION).add({
    name,
    description: description || '',
    adminUserId: createdBy,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return {
    success: true,
    organization: {
      id: docRef.id,
      name,
      description,
      adminUserId: createdBy,
    },
  };
};

/**
 * Update organization
 */
const updateOrganization = async (organizationId, data) => {
  const orgRef = db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId);
  
  await orgRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  
  return getOrganizationById(organizationId);
};

/**
 * Delete organization
 */
const deleteOrganization = async (organizationId) => {
  await db.collection(ORGANIZATIONS_COLLECTION).doc(organizationId).delete();
};

module.exports = {
  getOrganizationById,
  getOrganizationByAdmin,
  getAnyOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
