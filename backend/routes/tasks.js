/**
 * Task Routes
 * Task CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/rbac');
const { validateTaskData } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/tasks
 * Get all tasks (with optional filters)
 */
router.get('/', taskController.getAllTasks);

/**
 * GET /api/tasks/dashboard
 * Get dashboard tasks
 */
router.get('/dashboard', taskController.getDashboardTasks);

/**
 * GET /api/tasks/stats
 * Get task statistics
 */
router.get('/stats', authorize('admin', 'department_manager'), taskController.getTaskStats);

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id', taskController.getTaskById);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', validateTaskData, taskController.createTask);

/**
 * PUT /api/tasks/:id
 * Update task
 */
router.put('/:id', validateTaskData, taskController.updateTask);

/**
 * PATCH /api/tasks/:id/status
 * Update task status (for drag and drop)
 */
router.patch('/:id/status', taskController.updateTaskStatus);

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
router.delete('/:id', taskController.deleteTask);

module.exports = router;
