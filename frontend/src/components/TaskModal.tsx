import { useState, type FormEvent } from 'react';
import type { Task } from '../types';

interface TaskModalProps {
  task: Task | null;
  onSave: (taskData: Partial<Task>) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  // Helper to convert Firestore timestamp or string to Date string (YYYY-MM-DD)
  const parseDueDate = (dateValue: unknown): string => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      const d = new Date(dateValue);
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    }
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      const d = (dateValue as { toDate: () => Date }).toDate();
      return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    }
    return '';
  };

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? parseDueDate(task.dueDate) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[TaskModal] Submitting task...', { title, description, status, priority, dueDate });
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('[TaskModal] Calling onSave with:', {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status: status as Task['status'],
        priority: priority as Task['priority'],
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      
      console.log('[TaskModal] onSave completed successfully');
    } catch (err) {
      console.error('[TaskModal] Error during save:', err);
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="card w-full max-w-sm sm:max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full h-24"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="input w-full"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
