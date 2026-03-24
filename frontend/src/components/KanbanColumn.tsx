import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { TaskStatus } from '../types';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  children: ReactNode;
}

export default function KanbanColumn({ id, title, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      todo: 'status-todo',
      in_progress: 'status-in-progress',
      review: 'status-review',
      done: 'status-done',
    };
    return colors[status];
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column p-4 ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${getStatusColor(id)}`}>{title}</h3>
        <span className="text-text-muted text-sm">
          {/* Children count would go here */}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
