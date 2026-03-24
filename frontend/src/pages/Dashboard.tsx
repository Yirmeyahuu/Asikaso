import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Task, TaskStats } from '../types';
import { DashboardStatsSkeleton, DashboardTasksSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  console.log('[Dashboard] Component rendering');
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('[Dashboard] Loading dashboard data...');
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.getDashboardTasks(),
        api.getTaskStats(),
      ]);
      console.log('[Dashboard] Tasks response:', tasksRes);
      console.log('[Dashboard] Stats response:', statsRes);
      setTasks(tasksRes?.tasks || []);
      setStats(statsRes?.stats || null);
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
      setTasks([]);
      setStats(null);
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

      {/* Stats cards */}
      {stats && (
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
      )}

      {/* Recent tasks */}
      <div>
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary mb-3 sm:mb-4">Recent Tasks</h2>
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
                        {new Date(task.dueDate).toLocaleDateString()}
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
