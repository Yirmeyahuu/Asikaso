const eventsService = require('../services/eventsService');

// Create a new event
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.title || !eventData.startDate) {
      return res.status(400).json({ error: 'Title and start date are required' });
    }
    
    const event = await eventsService.createEvent(eventData);
    
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventsService.getEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Get all events with filters
exports.getAllEvents = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      departmentId: req.query.departmentId,
      assignedTo: req.query.assignedTo,
    };
    
    const events = await eventsService.getAllEvents(filters);
    res.json({ events });  // Return as object with events key
  } catch (error) {
    next(error);
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const events = await eventsService.getEventsByDateRange(startDate, endDate);
    res.json({ events });  // Return as object with events key
  } catch (error) {
    next(error);
  }
};

// Get today's events
exports.getTodayEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getTodayEvents();
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 3;
    const events = await eventsService.getUpcomingEvents(days);
    res.json({ events });
  } catch (error) {
    next(error);
  }
};

// Get events by department
exports.getEventsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const events = await eventsService.getEventsByDepartment(departmentId);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    
    const event = await eventsService.updateEvent(eventId, updates);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Mark event as completed
exports.markEventCompleted = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventsService.markEventCompleted(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Archive event
exports.archiveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventsService.archiveEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const deleted = await eventsService.deleteEvent(eventId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
