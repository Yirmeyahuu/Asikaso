/**
 * Organization Controller
 * Handles organization and organization member operations
 */

const organizationService = require('../services/organizationService');
const organizationMemberService = require('../services/organizationMemberService');
const { logActivity, ACTIVITY_ACTIONS } = require('../services/activityService');

/**
 * Get current organization
 * GET /api/organization
 */
const getOrganization = async (req, res) => {
  try {
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.status(404).json({ 
        error: 'No organization found',
        exists: false 
      });
    }
    
    res.json({ organization, exists: true });
  } catch (error) {
    console.error('Error getting organization:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
};

/**
 * Create a new organization
 * POST /api/organization
 */
const createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    
    const result = await organizationService.createOrganization(name, description, req.user.uid);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.message,
        code: result.error 
      });
    }
    
    // Log activity
    await logActivity({
      userId: req.user.uid,
      action: 'ORGANIZATION_CREATED',
      resourceType: 'organization',
      resourceId: result.organization.id,
      details: { name },
    });
    
    // Add creator as admin member
    const memberResult = await organizationMemberService.addOrganizationMember(
      req.user.email,
      req.user.uid,
      true // isAdmin
    );
    
    res.status(201).json({ organization: result.organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

/**
 * Update organization
 * PUT /api/organization
 */
const updateOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Get current organization
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is admin
    if (organization.adminUserId !== req.user.uid) {
      return res.status(403).json({ error: 'Only admin can update organization' });
    }
    
    const updated = await organizationService.updateOrganization(organization.id, { name, description });
    
    // Log activity
    await logActivity({
      userId: req.user.uid,
      action: 'ORGANIZATION_UPDATED',
      resourceType: 'organization',
      resourceId: organization.id,
      details: { name, description },
    });
    
    res.json({ organization: updated });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

/**
 * Get all organization members
 * GET /api/organization/members
 */
const getAllMembers = async (req, res) => {
  try {
    const members = await organizationMemberService.getAllOrganizationMembers();
    res.json({ members });
  } catch (error) {
    console.error('Error getting organization members:', error);
    res.status(500).json({ error: 'Failed to get organization members' });
  }
};

/**
 * Add a new organization member
 * POST /api/organization/members
 */
const addMember = async (req, res) => {
  try {
    // Get current organization
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is admin
    if (organization.adminUserId !== req.user.uid) {
      return res.status(403).json({ error: 'Only admin can add members' });
    }
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if email is a Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed' });
    }
    
    const result = await organizationMemberService.addOrganizationMember(email, req.user.uid);
    
    if (!result.success) {
      if (result.error === 'USER_NOT_REGISTERED') {
        return res.status(400).json({ 
          error: result.message,
          code: result.error 
        });
      }
      if (result.error === 'ALREADY_MEMBER') {
        return res.status(409).json({ 
          error: result.message,
          code: result.error 
        });
      }
      return res.status(500).json({ error: result.message });
    }
    
    // Log activity
    await logActivity({
      userId: req.user.uid,
      action: 'ORGANIZATION_MEMBER_ADDED',
      resourceType: 'organization_member',
      resourceId: result.member.id,
      details: { email: result.member.email, addedMember: result.member.displayName },
    });
    
    res.status(201).json({ member: result.member });
  } catch (error) {
    console.error('Error adding organization member:', error);
    res.status(500).json({ error: 'Failed to add organization member' });
  }
};

/**
 * Remove an organization member
 * DELETE /api/organization/members/:id
 */
const removeMember = async (req, res) => {
  try {
    // Get current organization
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is admin
    if (organization.adminUserId !== req.user.uid) {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }
    
    const { id } = req.params;
    
    const result = await organizationMemberService.removeOrganizationMember(id);
    
    if (!result.success) {
      return res.status(404).json({ error: 'Organization member not found' });
    }
    
    // Log activity
    await logActivity({
      userId: req.user.uid,
      action: 'ORGANIZATION_MEMBER_REMOVED',
      resourceType: 'organization_member',
      resourceId: id,
      details: { removedMemberId: id },
    });
    
    res.json({ message: 'Organization member removed successfully' });
  } catch (error) {
    console.error('Error removing organization member:', error);
    res.status(500).json({ error: 'Failed to remove organization member' });
  }
};

/**
 * Update organization member role
 * PUT /api/organization/members/:id
 */
const updateMemberRole = async (req, res) => {
  try {
    // Get current organization
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Check if user is admin
    if (organization.adminUserId !== req.user.uid) {
      return res.status(403).json({ error: 'Only admin can update member roles' });
    }
    
    const { id } = req.params;
    const { role } = req.body;
    
    const validRoles = ['organization_member', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const member = await organizationMemberService.updateOrganizationMemberRole(id, role);
    
    if (!member) {
      return res.status(404).json({ error: 'Organization member not found' });
    }
    
    // Log activity
    await logActivity({
      userId: req.user.uid,
      action: 'ORGANIZATION_MEMBER_ROLE_UPDATED',
      resourceType: 'organization_member',
      resourceId: id,
      details: { newRole: role },
    });
    
    res.json({ member });
  } catch (error) {
    console.error('Error updating organization member:', error);
    res.status(500).json({ error: 'Failed to update organization member' });
  }
};

/**
 * Get organization member count
 * GET /api/organization/members/count
 */
const getMemberCount = async (req, res) => {
  try {
    const count = await organizationMemberService.getOrganizationMemberCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting organization member count:', error);
    res.status(500).json({ error: 'Failed to get organization member count' });
  }
};

/**
 * Check if user is admin
 * GET /api/organization/check-admin
 */
const checkIsAdmin = async (req, res) => {
  try {
    const organization = await organizationService.getAnyOrganization();
    
    if (!organization) {
      return res.json({ isAdmin: false, hasOrganization: false });
    }
    
    const isAdmin = organization.adminUserId === req.user.uid;
    res.json({ isAdmin, hasOrganization: true });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
};

/**
 * Check if email exists in Firebase Auth
 * GET /api/organization/check-user?email=user@gmail.com
 */
const checkUserExists = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await organizationMemberService.checkUserExistsInAuth(email);
    
    res.json({ 
      exists: result.exists,
      user: result.exists ? {
        uid: result.uid,
        email: result.email,
        displayName: result.displayName,
        photoURL: result.photoURL,
      } : null
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ error: 'Failed to check user existence' });
  }
};

module.exports = {
  getOrganization,
  createOrganization,
  updateOrganization,
  getAllMembers,
  addMember,
  removeMember,
  updateMemberRole,
  getMemberCount,
  checkIsAdmin,
  checkUserExists,
};
