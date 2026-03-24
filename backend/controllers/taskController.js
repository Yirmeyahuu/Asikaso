/**
 * Task Controller
 * Handles task CRUD operations
 */

const taskService = require('../services/taskService');
const subtaskService = require('../services/subtaskService');
const { logActivity, ACTIVITY_ACTIONS, logTaskCreated, logTaskStatusChanged } = require('../services/activityService');

/**
 * Get all tasks
 * GET /api/tasks
 */
const getAllTasks = async (req, res) => {
  try {
    const { departmentId, status, assigneeId } = req.query;
    
    let tasks;
    if (departmentId) {
      tasks = await taskService.getTasksByDepartment(departmentId);
    } else if (status) {
      tasks = await taskService.getTasksByStatus(status);
    } else if (assigneeId) {
      tasks = await taskService.getTasksByAssignee(assigneeId);
    } else {
      tasks = await taskService.getAllTasks();
    }
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
};

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get subtasks for this task
    const subtasks = await subtaskService.getSubtasksByTask(id);
    
    res.json({ task, subtasks });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, departmentId, assigneeId, dueDate } = req.body;
    
    const task = await taskService.createTask({
      title,
      description,
      status,
      priority,
      departmentId,
      assigneeId,
      dueDate,
    }, req.user.uid);
    
    await logTaskCreated(req.user.uid, task.id, title);
    
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Update task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, departmentId, assigneeId, dueDate } = req.body;
    
    // Get old task for activity logging
    const oldTask = await taskService.getTaskById(id);
    if (!oldTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = await taskService.updateTask(id, {
      title,
      description,
      status,
      priority,
      departmentId,
      assigneeId,
      dueDate,
    });
    
    // Log status change
    if (status && status !== oldTask.status) {
      await logTaskStatusChanged(req.user.uid, id, oldTask.status, status);
    }
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.TASK_UPDATED,
      resourceType: 'task',
      resourceId: id,
      details: { title, status, priority },
    });
    
    res.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Update task status (for drag and drop)
 * PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const oldTask = await taskService.getTaskById(id);
    if (!oldTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = await taskService.updateTaskStatus(id, status);
    
    await logTaskStatusChanged(req.user.uid, id, oldTask.status, status);
    
    res.json({ task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await taskService.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Delete associated subtasks first
    await subtaskService.deleteSubtasksByTask(id);
    
    await taskService.deleteTask(id);
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.TASK_DELETED,
      resourceType: 'task',
      resourceId: id,
      details: { title: task.title },
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Get dashboard tasks
 * GET /api/tasks/dashboard
 */
const getDashboardTasks = async (req, res) => {
  try {
    const user = req.user;
    const userProfile = await req.app.get('db').collection('users').doc(user.uid).get();
    const userData = userProfile.data();
    
    const tasks = await taskService.getDashboardTasks(
      user.uid,
      userData?.role || 'employee',
      userData?.departmentId
    );
    
    res.json({ tasks });
  } catch (error) {
    console.error('Error getting dashboard tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
};

/**
 * Get task statistics
 * GET /api/tasks/stats
 */
const getTaskStats = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const stats = await taskService.getTaskStats(departmentId);
    res.json({ stats });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ error: 'Failed to get task stats' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardTasks,
  getTaskStats,
};
