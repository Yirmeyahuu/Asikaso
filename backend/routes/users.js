/**
 * User Routes
 * User CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/rbac');
const { validateUserData } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authorize('admin'), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', userController.getUserById);

/**
 * POST /api/users
 * Create a new user (Admin only)
 */
router.post('/', authorize('admin'), validateUserData, userController.createUser);

/**
 * PUT /api/users/:id
 * Update user
 */
router.put('/:id', validateUserData, userController.updateUser);

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
router.delete('/:id', authorize('admin'), userController.deleteUser);

/**
 * GET /api/users/department/:departmentId
 * Get users by department
 */
router.get('/department/:departmentId', userController.getUsersByDepartment);

module.exports = router;
