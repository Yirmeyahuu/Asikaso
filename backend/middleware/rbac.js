/**
 * Role-Based Access Control (RBAC) Middleware
 * Defines roles: admin, department_manager, employee
 */

// Define role hierarchy and permissions
const ROLES = {
  admin: ['admin', 'department_manager', 'employee'],
  department_manager: ['department_manager', 'employee'],
  employee: ['employee'],
};

// Valid roles
const VALID_ROLES = ['admin', 'department_manager', 'employee'];

/**
 * Check if user has required role
 * @param {string[]} requiredRoles - Array of roles that can access the route
 */
const authorize = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Please log in to access this resource' 
      });
    }

    const userRole = req.user.role || 'employee';

    // Check if user's role is in the required roles
    const hasPermission = requiredRoles.some(role => {
      const allowedRoles = ROLES[role] || [];
      return allowedRoles.includes(userRole);
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of these roles: ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {string} ownerField - The field name in the resource that contains the owner's ID
 */
const authorizeOwner = (ownerField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Not authenticated',
        message: 'Please log in to access this resource' 
      });
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource (handled in controllers)
    next();
  };
};

/**
 * Validate role input
 */
const validateRole = (role) => {
  return VALID_ROLES.includes(role);
};

module.exports = { 
  authorize, 
  authorizeOwner, 
  validateRole,
  ROLES,
  VALID_ROLES 
};
