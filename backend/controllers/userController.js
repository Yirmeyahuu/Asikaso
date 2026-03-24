/**
 * User Controller
 * Handles user CRUD operations
 */

const userService = require('../services/userService');
const { logActivity, ACTIVITY_ACTIONS } = require('../services/activityService');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Create a new user
 * POST /api/users
 */
const createUser = async (req, res) => {
  try {
    const { email, displayName, role, departmentId } = req.body;
    
    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user in Firebase Auth (requires Firebase Admin)
    const { admin } = req.app.get('admin');
    
    // For demo purposes, we'll create a placeholder user
    // In production, you'd use admin.auth().createUser()
    const userRecord = await admin.auth().createUser({
      email,
      displayName: displayName || email.split('@')[0],
    });
    
    const user = await userService.createUser({
      email,
      displayName,
      role,
      departmentId,
    }, userRecord.uid);
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.USER_CREATED,
      resourceType: 'user',
      resourceId: user.id,
      details: { email, role },
    });
    
    res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, role, departmentId, photoURL, isActive } = req.body;
    
    // Check if user is admin or updating themselves
    if (req.user.role !== 'admin' && req.user.uid !== id) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }
    
    // Non-admins cannot change roles
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }
    
    const user = await userService.updateUser(id, {
      displayName,
      role,
      departmentId,
      photoURL,
      isActive,
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.USER_UPDATED,
      resourceType: 'user',
      resourceId: id,
      details: { displayName, role, departmentId },
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete from Firebase Auth
    const { admin } = req.app.get('admin');
    await admin.auth().deleteUser(id);
    
    // Delete from Firestore
    await userService.deleteUser(id);
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.USER_DELETED,
      resourceType: 'user',
      resourceId: id,
      details: { email: user.email },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get users by department
 * GET /api/users/department/:departmentId
 */
const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const users = await userService.getUsersByDepartment(departmentId);
    res.json({ users });
  } catch (error) {
    console.error('Error getting users by department:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByDepartment,
};
