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

  const getStatusDotColor = (status: TaskStatus) => {
    const colors = {
      todo: 'bg-todo',
      in_progress: 'bg-in-progress',
      review: 'bg-review',
      done: 'bg-done',
    };
    return colors[status];
  };

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column p-4 ${isOver ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusDotColor(id)}`}></span>
          <h3 className={`font-semibold text-[15px] ${getStatusColor(id)}`}>{title}</h3>
        </div>
        <span className="text-text-muted text-sm bg-bg-secondary px-2 py-1 rounded-lg">
          {/* Children count would go here */}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
