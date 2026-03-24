/**
 * Organization Routes
 * Organization and member management endpoints
 */

const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/organization
 * Get current organization
 */
router.get('/', organizationController.getOrganization);

/**
 * POST /api/organization
 * Create a new organization
 */
router.post('/', organizationController.createOrganization);

/**
 * PUT /api/organization
 * Update organization (admin only)
 */
router.put('/', organizationController.updateOrganization);

/**
 * GET /api/organization/members
 * Get all organization members
 */
router.get('/members', organizationController.getAllMembers);

/**
 * POST /api/organization/members
 * Add a new organization member (admin only)
 */
router.post('/members', organizationController.addMember);

/**
 * DELETE /api/organization/members/:id
 * Remove an organization member (admin only)
 */
router.delete('/members/:id', organizationController.removeMember);

/**
 * PUT /api/organization/members/:id
 * Update organization member role (admin only)
 */
router.put('/members/:id', organizationController.updateMemberRole);

/**
 * GET /api/organization/members/count
 * Get organization member count
 */
router.get('/members/count', organizationController.getMemberCount);

/**
 * GET /api/organization/check-admin
 * Check if current user is admin
 */
router.get('/check-admin', organizationController.checkIsAdmin);

/**
 * GET /api/organization/check-user
 * Check if user exists in Firebase Auth
 */
router.get('/check-user', organizationController.checkUserExists);

module.exports = router;
