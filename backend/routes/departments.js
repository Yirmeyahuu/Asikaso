/**
 * Department Routes
 * Department CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/rbac');
const { validateDepartmentData } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/departments
 * Get all departments (Admin and Manager)
 */
router.get('/', authorize('admin', 'department_manager'), departmentController.getAllDepartments);

/**
 * GET /api/departments/:id
 * Get department by ID
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * POST /api/departments
 * Create a new department (Admin only)
 */
router.post('/', authorize('admin'), validateDepartmentData, departmentController.createDepartment);

/**
 * PUT /api/departments/:id
 * Update department (Admin and Manager)
 */
router.put('/:id', authorize('admin', 'department_manager'), validateDepartmentData, departmentController.updateDepartment);

/**
 * DELETE /api/departments/:id
 * Delete department (Admin only)
 */
router.delete('/:id', authorize('admin'), departmentController.deleteDepartment);

/**
 * GET /api/departments/manager/:managerId
 * Get department by manager
 */
router.get('/manager/:managerId', departmentController.getDepartmentByManager);

module.exports = router;
