/**
 * Subtask Routes
 * Subtask CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const subtaskController = require('../controllers/subtaskController');
const { authenticate } = require('../middleware/authenticate');
const { validateSubtaskData } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/subtasks/task/:taskId
 * Get subtasks by task ID
 */
router.get('/task/:taskId', subtaskController.getSubtasksByTask);

/**
 * GET /api/subtasks/task/:taskId/stats
 * Get subtask stats for a task
 */
router.get('/task/:taskId/stats', subtaskController.getSubtaskStats);

/**
 * GET /api/subtasks/:id
 * Get subtask by ID
 */
router.get('/:id', subtaskController.getSubtaskById);

/**
 * POST /api/subtasks
 * Create a new subtask
 */
router.post('/', validateSubtaskData, subtaskController.createSubtask);

/**
 * PUT /api/subtasks/:id
 * Update subtask
 */
router.put('/:id', subtaskController.updateSubtask);

/**
 * PATCH /api/subtasks/:id/toggle
 * Toggle subtask completion
 */
router.patch('/:id/toggle', subtaskController.toggleSubtask);

/**
 * DELETE /api/subtasks/:id
 * Delete subtask
 */
router.delete('/:id', subtaskController.deleteSubtask);

module.exports = router;
