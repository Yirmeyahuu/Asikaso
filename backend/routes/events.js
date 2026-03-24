const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/rbac');

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', eventsController.createEvent);
router.get('/', eventsController.getAllEvents);
router.get('/today', eventsController.getTodayEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/range', eventsController.getEventsByDateRange);
router.get('/department/:departmentId', eventsController.getEventsByDepartment);
router.get('/:eventId', eventsController.getEventById);
router.put('/:eventId', authorize('admin', 'manager', 'employee'), eventsController.updateEvent);
router.patch('/:eventId/complete', eventsController.markEventCompleted);
router.patch('/:eventId/archive', authorize('admin', 'manager'), eventsController.archiveEvent);
router.delete('/:eventId', authorize('admin', 'manager'), eventsController.deleteEvent);

module.exports = router;
