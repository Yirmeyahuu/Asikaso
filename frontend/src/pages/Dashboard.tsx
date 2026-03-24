import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Task, TaskStats, CalendarEvent } from '../types';
import { DashboardStatsSkeleton, DashboardTasksSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  console.log('[Dashboard] Component rendering');
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('[Dashboard] Loading dashboard data...');
    try {
      const [tasksRes, statsRes, todayEventsRes, upcomingRes] = await Promise.all([
        api.getDashboardTasks(),
        api.getTaskStats(),
        api.getTodayEvents(),
        api.getUpcomingEvents(1), // Get tomorrow's events
      ]);
      console.log('[Dashboard] Tasks response:', tasksRes);
      console.log('[Dashboard] Stats response:', statsRes);
      console.log('[Dashboard] Today events:', todayEventsRes);
      console.log('[Dashboard] Upcoming events:', upcomingRes);
      
      setTasks(tasksRes?.tasks || []);
      setStats(statsRes?.stats || null);
      setTodayEvents(todayEventsRes?.events || []);
      setUpcomingEvents(upcomingRes?.events || []);
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
      setTasks([]);
      setStats(null);
      setTodayEvents([]);
      setUpcomingEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">
            Welcome back, {user?.displayName || 'User'}!
          </h1>
          <p className="text-sm text-text-secondary hidden sm:block">
            Here's what's happening with your tasks today.
          </p>
        </div>
        <DashboardStatsSkeleton />
        <DashboardTasksSkeleton />
      </div>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-priority-low',
      medium: 'bg-priority-medium',
      high: 'bg-priority-high',
      urgent: 'bg-priority-urgent',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      todo: 'To Do',
      in_progress: 'In Progress',
      review: 'Review',
      done: 'Done',
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Helper to convert Firestore timestamp or string to Date
  const parseDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    // Handle Firestore Timestamp (has toDate method)
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      return (dateValue as { toDate: () => Date }).toDate();
    }
    return null;
  };

  // Get today's tasks (tasks with dueDate = today)
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = parseDate(task.dueDate);
    if (!dueDate) return false;
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  // Get tomorrow's tasks
  const tomorrowTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = parseDate(task.dueDate);
    if (!dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dueDate.toDateString() === tomorrow.toDateString();
  });

  // Separate today's events and meetings
  const todayMeetings = todayEvents.filter(e => e.type === 'meeting');
  const todayOtherEvents = todayEvents.filter(e => e.type !== 'meeting');

  // Separate tomorrow's events and meetings
  const tomorrowMeetings = upcomingEvents.filter(e => e.type === 'meeting');
  const tomorrowOtherEvents = upcomingEvents.filter(e => e.type !== 'meeting');

  const formatTime = (dateValue: string) => {
    const date = new Date(dateValue);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">
          Welcome back, {user?.displayName || 'User'}!
        </h1>
        <p className="text-sm text-text-secondary hidden sm:block">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Today's Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Tasks Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-muted">Today's Tasks</p>
              <p className="text-2xl font-bold text-text-primary">{todayTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Today's Meetings Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-muted">Today's Meetings</p>
              <p className="text-2xl font-bold text-text-primary">{todayMeetings.length}</p>
            </div>
          </div>
        </div>

        {/* Today's Events Card */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-muted">Today's Events</p>
              <p className="text-2xl font-bold text-text-primary">{todayOtherEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Agenda Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Tasks */}
        <div className="card p-4">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning"></span>
            Today's Tasks
          </h3>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-text-muted">No tasks for today</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}></div>
                    <span className="text-sm text-text-primary truncate">{task.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === 'done' ? 'bg-success/20 text-success' :
                    task.status === 'in_progress' ? 'bg-info/20 text-info' :
                    task.status === 'review' ? 'bg-warning/20 text-warning' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              ))}
              {todayTasks.length > 5 && (
                <p className="text-xs text-text-muted">+{todayTasks.length - 5} more tasks</p>
              )}
            </div>
          )}
        </div>

        {/* Today's Events & Meetings */}
        <div className="card p-4">
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-info"></span>
            Today's Schedule
          </h3>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-text-muted">No events for today</p>
          ) : (
            <div className="space-y-2">
              {todayEvents.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center justify-between p-2 bg-bg-tertiary rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      event.type === 'meeting' ? 'bg-info/20 text-info' : 'bg-success/20 text-success'
                    }`}>
                      {event.type === 'meeting' ? 'Meeting' : 'Event'}
                    </span>
                    <span className="text-sm text-text-primary truncate">{event.title}</span>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {event.allDay ? 'All Day' : formatTime(event.startDate)}
                  </span>
                </div>
              ))}
              {todayEvents.length > 5 && (
                <p className="text-xs text-text-muted">+{todayEvents.length - 5} more events</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Section - Tomorrow */}
      <div className="card p-4">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tomorrow's Agenda
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tomorrow's Tasks */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Tasks Due Tomorrow</p>
            {tomorrowTasks.length === 0 ? (
              <p className="text-sm text-text-muted">No tasks due tomorrow</p>
            ) : (
              <div className="space-y-1">
                {tomorrowTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-bg-tertiary rounded">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <span className="text-sm text-text-primary truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tomorrow's Events */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Events & Meetings</p>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-text-muted">No events tomorrow</p>
            ) : (
              <div className="space-y-1">
                {upcomingEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 bg-bg-tertiary rounded">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      event.type === 'meeting' ? 'bg-info/20 text-info' : 'bg-success/20 text-success'
                    }`}>
                      {event.type === 'meeting' ? 'Meeting' : 'Event'}
                    </span>
                    <span className="text-sm text-text-primary truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards - keeping original for overview */}
      {stats && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3">Task Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">Total</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">To Do</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold status-todo">{stats.todo}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">In Progress</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold status-in-progress">{stats.inProgress}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">Review</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold status-review">{stats.review}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">Done</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold status-done">{stats.done}</p>
            </div>
            <div className="card p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-text-muted">Overdue</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-error">{stats.overdue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent tasks - keeping original */}
      <div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary mb-3 sm:mb-4">Recent Tasks</h3>
        <div className="card overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-text-muted text-sm sm:text-base">
              No tasks found. Create your first task!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.slice(0, 10).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 sm:p-4 hover:bg-bg-tertiary"
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary text-sm sm:text-base truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-text-muted line-clamp-1 hidden sm:block">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full bg-bg-tertiary ${
                      task.status === 'done' ? 'status-done' :
                      task.status === 'in_progress' ? 'status-in-progress' :
                      task.status === 'review' ? 'status-review' : 'status-todo'
                    }`}>
                      {getStatusLabel(task.status)}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs sm:text-sm text-text-muted whitespace-nowrap hidden sm:inline">
                        {parseDate(task.dueDate)?.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
