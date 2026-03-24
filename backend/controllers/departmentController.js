/**
 * Department Controller
 * Handles department CRUD operations
 */

const departmentService = require('../services/departmentService');
const { logActivity, ACTIVITY_ACTIONS } = require('../services/activityService');

/**
 * Get all departments
 * GET /api/departments
 */
const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json({ departments });
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
};

/**
 * Get department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentService.getDepartmentById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ department });
  } catch (error) {
    console.error('Error getting department:', error);
    res.status(500).json({ error: 'Failed to get department' });
  }
};

/**
 * Create a new department
 * POST /api/departments
 */
const createDepartment = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;
    
    const department = await departmentService.createDepartment({
      name,
      description,
      managerId,
    });
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.DEPARTMENT_CREATED,
      resourceType: 'department',
      resourceId: department.id,
      details: { name },
    });
    
    res.status(201).json({ department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

/**
 * Update department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;
    
    const department = await departmentService.updateDepartment(id, {
      name,
      description,
      managerId,
    });
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.DEPARTMENT_UPDATED,
      resourceType: 'department',
      resourceId: id,
      details: { name, managerId },
    });
    
    res.json({ department });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

/**
 * Delete department
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if department exists
    const department = await departmentService.getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    await departmentService.deleteDepartment(id);
    
    await logActivity({
      userId: req.user.uid,
      action: ACTIVITY_ACTIONS.DEPARTMENT_DELETED,
      resourceType: 'department',
      resourceId: id,
      details: { name: department.name },
    });
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

/**
 * Get department by manager
 * GET /api/departments/manager/:managerId
 */
const getDepartmentByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const department = await departmentService.getDepartmentByManager(managerId);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found for this manager' });
    }
    
    res.json({ department });
  } catch (error) {
    console.error('Error getting department by manager:', error);
    res.status(500).json({ error: 'Failed to get department' });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentByManager,
};
