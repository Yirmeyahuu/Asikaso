/**
 * Subtask Controller
 * Handles subtask CRUD operations
 */

const subtaskService = require('../services/subtaskService');
const { logActivity, ACTIVITY_ACTIONS } = require('../services/activityService');

/**
 * Get subtasks by task ID
 * GET /api/subtasks/task/:taskId
 */
const getSubtasksByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtasks = await subtaskService.getSubtasksByTask(taskId);
    res.json({ subtasks });
  } catch (error) {
    console.error('Error getting subtasks:', error);
    res.status(500).json({ error: 'Failed to get subtasks' });
  }
};

/**
 * Get subtask by ID
 * GET /api/subtasks/:id
 */
const getSubtaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const subtask = await subtaskService.getSubtaskById(id);
    
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    res.json({ subtask });
  } catch (error) {
    console.error('Error getting subtask:', error);
    res.status(500).json({ error: 'Failed to get subtask' });
  }
};

/**
 * Create a new subtask
 * POST /api/subtasks
 */
const createSubtask = async (req, res) => {
  try {
    const { title, taskId } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }
    
    const subtask = await subtaskService.createSubtask({
      title,
      taskId,
    });
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.SUBTASK_CREATED,
      resourceType: 'subtask',
      resourceId: subtask.id,
      details: { title, taskId },
    });
    
    res.status(201).json({ subtask });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: 'Failed to create subtask' });
  }
};

/**
 * Update subtask
 * PUT /api/subtasks/:id
 */
const updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    const subtask = await subtaskService.updateSubtask(id, {
      title,
      completed,
    });
    
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.SUBTASK_UPDATED,
      resourceType: 'subtask',
      resourceId: id,
      details: { title, completed },
    });
    
    res.json({ subtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: 'Failed to update subtask' });
  }
};

/**
 * Toggle subtask completion
 * PATCH /api/subtasks/:id/toggle
 */
const toggleSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subtask = await subtaskService.toggleSubtaskCompletion(id);
    
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    if (subtask.completed) {
      await logActivity({
        userId: req.user.uid,
        action: ACTIVITY_ACTIONS.SUBTASK_COMPLETED,
        resourceType: 'subtask',
        resourceId: id,
        details: { title: subtask.title },
      });
    }
    
    res.json({ subtask });
  } catch (error) {
    console.error('Error toggling subtask:', error);
    res.status(500).json({ error: 'Failed to toggle subtask' });
  }
};

/**
 * Delete subtask
 * DELETE /api/subtasks/:id
 */
const deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subtask = await subtaskService.getSubtaskById(id);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }
    
    await subtaskService.deleteSubtask(id);
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.SUBTASK_DELETED,
      resourceType: 'subtask',
      resourceId: id,
      details: { title: subtask.title },
    });
    
    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Failed to delete subtask' });
  }
};

/**
 * Get subtask stats for a task
 * GET /api/subtasks/task/:taskId/stats
 */
const getSubtaskStats = async (req, res) => {
  try {
    const { taskId } = req.params;
    const stats = await subtaskService.getSubtaskStats(taskId);
    res.json({ stats });
  } catch (error) {
    console.error('Error getting subtask stats:', error);
    res.status(500).json({ error: 'Failed to get subtask stats' });
  }
};

module.exports = {
  getSubtasksByTask,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  toggleSubtask,
  deleteSubtask,
  getSubtaskStats,
};
