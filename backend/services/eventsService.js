const { db } = require('../firebaseAdmin');

const EVENTS_COLLECTION = 'events';

// Create a new event
async function createEvent(eventData) {
  const docRef = db.collection(EVENTS_COLLECTION).doc();
  const now = new Date();
  
  const event = {
    ...eventData,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  await docRef.set(event);
  return { id: docRef.id, ...event };
}

// Get event by ID
async function getEventById(eventId) {
  const doc = await db.collection(EVENTS_COLLECTION).doc(eventId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
}

// Get all events (with optional filters)
async function getAllEvents(filters = {}) {
  let query = db.collection(EVENTS_COLLECTION);
  
  // Filter by type
  if (filters.type) {
    query = query.where('type', '==', filters.type);
  }
  
  // Filter by status
  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }
  
  // Filter by department
  if (filters.departmentId) {
    query = query.where('departmentId', '==', filters.departmentId);
  }
  
  // Filter by assigned user
  if (filters.assignedTo) {
    query = query.where('assignedTo', 'array-contains', filters.assignedTo);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get events for a specific date range
async function getEventsByDateRange(startDate, endDate) {
  const snapshot = await db.collection(EVENTS_COLLECTION)
    .where('startDate', '>=', startDate)
    .where('startDate', '<=', endDate)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get today's events
async function getTodayEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getEventsByDateRange(today.toISOString(), tomorrow.toISOString());
}

// Get events due soon (within next 3 days)
async function getUpcomingEvents(days = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  
  const snapshot = await db.collection(EVENTS_COLLECTION)
    .where('startDate', '>=', today.toISOString())
    .where('startDate', '<=', futureDate.toISOString())
    .where('status', '!=', 'archived')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Get events by department
async function getEventsByDepartment(departmentId) {
  const snapshot = await db.collection(EVENTS_COLLECTION)
    .where('departmentId', '==', departmentId)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Update event
async function updateEvent(eventId, updates) {
  const docRef = db.collection(EVENTS_COLLECTION).doc(eventId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return null;
  }
  
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await docRef.update(updatedData);
  return { id: eventId, ...doc.data(), ...updatedData };
}

// Mark event as completed
async function markEventCompleted(eventId) {
  return updateEvent(eventId, { status: 'completed' });
}

// Archive event
async function archiveEvent(eventId) {
  return updateEvent(eventId, { status: 'archived' });
}

// Delete event
async function deleteEvent(eventId) {
  const docRef = db.collection(EVENTS_COLLECTION).doc(eventId);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return false;
  }
  
  await docRef.delete();
  return true;
}

// Get events for dashboard (today's tasks and meetings)
async function getDashboardData(userId, departmentId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get today's events
  const todayEventsSnapshot = await db.collection(EVENTS_COLLECTION)
    .where('startDate', '>=', today.toISOString())
    .where('startDate', '<', tomorrow.toISOString())
    .where('status', '!=', 'archived')
    .get();
  
  const todayEvents = todayEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Get upcoming events (next 7 days)
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 7);
  
  const upcomingSnapshot = await db.collection(EVENTS_COLLECTION)
    .where('startDate', '>=', today.toISOString())
    .where('startDate', '<=', futureDate.toISOString())
    .where('status', '!=', 'archived')
    .get();
  
  const upcomingEvents = upcomingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Get tasks due soon
  const tasksSnapshot = await db.collection('tasks')
    .where('dueDate', '>=', today.toISOString())
    .where('dueDate', '<=', futureDate.toISOString())
    .where('status', '!=', 'completed')
    .get();
  
  const dueSoonTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    todayEvents,
    upcomingEvents,
    dueSoonTasks,
  };
}

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  getEventsByDateRange,
  getTodayEvents,
  getUpcomingEvents,
  getEventsByDepartment,
  updateEvent,
  markEventCompleted,
  archiveEvent,
  deleteEvent,
  getDashboardData,
};
