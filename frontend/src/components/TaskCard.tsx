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

  const formatDueDate = (dueDate: unknown): string => {
    const parsed = parseDate(dueDate);
    if (!parsed || isNaN(parsed.getTime())) return 'No date';
    return parsed.toLocaleDateString();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging || isSortableDragging ? 'dragging' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-text-muted hover:text-text-primary"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-text-muted hover:text-error"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <h4 className="font-medium text-text-primary mb-1">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-text-muted line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-text-muted">
        {task.dueDate && (
          <span>Due: {formatDueDate(task.dueDate)}</span>
        )}
        <span className="capitalize">{task.priority}</span>
      </div>
    </div>
  );
}
