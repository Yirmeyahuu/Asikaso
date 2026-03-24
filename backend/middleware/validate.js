/**
 * Data Validation Middleware
 * Sanitizes and validates incoming data
 */

const validateUserData = (req, res, next) => {
  const { email, displayName, role, departmentId } = req.body;

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate role
  if (role && !['admin', 'department_manager', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be admin, department_manager, or employee' });
  }

  // Sanitize string inputs
  if (displayName && typeof displayName === 'string') {
    req.body.displayName = displayName.trim().substring(0, 100);
  }

  next();
};

const validateTaskData = (req, res, next) => {
  const { title, description, status, priority, departmentId, assigneeId, dueDate } = req.body;

  // Title is required
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  // Limit title length
  req.body.title = title.trim().substring(0, 200);

  // Validate status
  if (status && !['todo', 'in_progress', 'review', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Validate priority
  if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  // Sanitize description
  if (description && typeof description === 'string') {
    req.body.description = description.trim().substring(0, 5000);
  }

  next();
};

const validateDepartmentData = (req, res, next) => {
  const { name, description, managerId } = req.body;

  // Name is required
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Department name is required' });
  }

  // Limit name length
  req.body.name = name.trim().substring(0, 100);

  // Sanitize description
  if (description && typeof description === 'string') {
    req.body.description = description.trim().substring(0, 1000);
  }

  next();
};

const validateSubtaskData = (req, res, next) => {
  const { title, taskId, completed } = req.body;

  // Title is required
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Subtask title is required' });
  }

  // Limit title length
  req.body.title = title.trim().substring(0, 200);

  // Validate completed is boolean
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
};

module.exports = {
  validateUserData,
  validateTaskData,
  validateDepartmentData,
  validateSubtaskData,
};
