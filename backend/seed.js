/**
 * Seed Script
 * Populates Firestore with sample data for testing
 * Updated to use correct field names matching the service
 */

require('dotenv').config();
const { admin, db } = require('./firebaseAdmin');

const seedData = async () => {
  console.log('Starting seed process...');
  
  try {
    // Create departments
    const departments = [
      {
        name: 'Engineering',
        description: 'Software development and technical infrastructure',
        managerId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        name: 'Marketing',
        description: 'Marketing and brand promotion',
        managerId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        name: 'Human Resources',
        description: 'HR and people operations',
        managerId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
    ];

    const departmentRefs = [];
    for (const dept of departments) {
      const docRef = await db.collection('departments').add(dept);
      departmentRefs.push(docRef.id);
      console.log(`Created department: ${dept.name} (${docRef.id})`);
    }

    // Create sample tasks with current dates so they show up in dashboard
    const today = new Date();
    const getDate = (daysOffset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      return d;
    };

    const tasks = [
      {
        title: 'Setup project infrastructure',
        description: 'Initialize the project with proper tooling and CI/CD',
        status: 'done',
        priority: 'high',
        departmentId: departmentRefs[0],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(-5)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and mockups for login/signup',
        status: 'review',
        priority: 'high',
        departmentId: departmentRefs[0],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(2)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        title: 'Implement API endpoints',
        description: 'Build REST API for tasks and departments',
        status: 'in_progress',
        priority: 'medium',
        departmentId: departmentRefs[0],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(5)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        title: 'Create marketing campaign',
        description: 'Plan and execute Q1 marketing campaign',
        status: 'todo',
        priority: 'medium',
        departmentId: departmentRefs[1],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(10)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        title: 'Review employee benefits',
        description: 'Update employee benefits package for 2024',
        status: 'todo',
        priority: 'low',
        departmentId: departmentRefs[2],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(15)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
      {
        title: 'Fix authentication bug',
        description: 'Users cannot reset password via email',
        status: 'todo',
        priority: 'urgent',
        departmentId: departmentRefs[0],
        assigneeId: null,
        creatorId: null,
        dueDate: admin.firestore.Timestamp.fromDate(getDate(1)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      },
    ];

    for (const task of tasks) {
      const docRef = await db.collection('tasks').add(task);
      console.log(`Created task: ${task.title} (${docRef.id})`);
    }

    // Create sample events using correct field names (startDate, endDate)
    const createEventDate = (hour, daysOffset = 0) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    const createEndDate = (hour, daysOffset = 0) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      d.setHours(hour, 30, 0, 0);
      return d;
    };

    const events = [
      {
        title: 'Team Standup',
        description: 'Daily team sync meeting',
        eventType: 'meeting',
        startDate: admin.firestore.Timestamp.fromDate(createEventDate(9, 0)),
        endDate: admin.firestore.Timestamp.fromDate(createEndDate(9, 0)),
        departmentId: departmentRefs[0],
        assignedTo: [],
        creatorId: null,
        isCompleted: false,
        isArchived: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Sprint Planning',
        description: 'Plan tasks for the upcoming sprint',
        eventType: 'meeting',
        startDate: admin.firestore.Timestamp.fromDate(createEventDate(14, 1)),
        endDate: admin.firestore.Timestamp.fromDate(createEventDate(16, 1)),
        departmentId: departmentRefs[0],
        assignedTo: [],
        creatorId: null,
        isCompleted: false,
        isArchived: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Marketing Review',
        description: 'Review marketing campaign performance',
        eventType: 'meeting',
        startDate: admin.firestore.Timestamp.fromDate(createEventDate(11, 2)),
        endDate: admin.firestore.Timestamp.fromDate(createEventDate(12, 2)),
        departmentId: departmentRefs[1],
        assignedTo: [],
        creatorId: null,
        isCompleted: false,
        isArchived: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        title: 'Code Review Session',
        description: 'Review pull requests from the team',
        eventType: 'meeting',
        startDate: admin.firestore.Timestamp.fromDate(createEventDate(15, 0)),
        endDate: admin.firestore.Timestamp.fromDate(createEndDate(16, 0)),
        departmentId: departmentRefs[0],
        assignedTo: [],
        creatorId: null,
        isCompleted: false,
        isArchived: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    ];

    for (const event of events) {
      const docRef = await db.collection('events').add(event);
      console.log(`Created event: ${event.title} (${docRef.id})`);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
