import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, isDragging = false, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  // Helper to convert date
  const formatDueDate = (dueDate: unknown) => {
    if (!dueDate) return null;
    let date: Date | null = null;
    if (typeof dueDate === 'string') {
      date = new Date(dueDate);
    } else if (dueDate instanceof Date) {
      date = dueDate;
    } else if (dueDate && typeof dueDate === 'object' && 'toDate' in dueDate) {
      date = (dueDate as { toDate: () => Date }).toDate();
    }
    if (!date || isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card press-effect ${isDragging || isSortableDragging ? 'dragging' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)}`}></div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <h4 className="font-semibold text-text-primary mb-2 text-[15px]">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-text-muted line-clamp-2 mb-3">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDueDate(task.dueDate)}
          </span>
        )}
        <span className="capitalize font-medium">{task.priority}</span>
      </div>
    </div>
  );
}
