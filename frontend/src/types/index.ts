// User types
export type UserRole = 'admin' | 'department_manager' | 'employee' | 'organization_member';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  departmentId?: string;
  photoURL?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  adminUserId: string;
  createdAt: string;
  updatedAt: string;
}

// Organization Member types
export interface OrganizationMember {
  id: string;
  email: string;
  userId: string;
  displayName: string;
  role: 'organization_member' | 'admin';
  addedBy?: string;
  createdAt: string;
  isActive?: boolean;
}

// Department types
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  departmentId?: string;
  dueDate?: string;
  startDate?: string;
  parentTaskId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
}

// Subtask types
export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Calendar Event types
export type EventType = 'task' | 'meeting' | 'event';
export type EventStatus = 'pending' | 'completed' | 'archived';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  departmentId?: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Activity Log types
export interface Activity {
  id: string;
  userId: string;
  action: string;
  resourceType: 'task' | 'department' | 'user' | 'event';
  resourceId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Dashboard data types
export interface DashboardData {
  todayEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  dueSoonTasks: Task[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Calendar view types
export type CalendarView = 'month' | 'week' | 'day';

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Theme types
export type Theme = 'light' | 'dark';

// Firebase config type
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
