import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { api } from '../services/api';
import type { Task, TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import { TasksPageSkeleton } from '../components/Skeleton';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

export default function Tasks() {
  console.log('[Tasks] Component rendering');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    console.log('[Tasks] Loading tasks...');
    try {
      const { tasks: loadedTasks } = await api.getTasks();
      setTasks(loadedTasks || []);
    } catch (error) {
      console.error('[Tasks] Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskItem = tasks.find(t => t.id === active.id);
    if (!activeTaskItem) return;

    const overColumn = COLUMNS.find(col => col.id === over.id);
    if (overColumn) {
      if (activeTaskItem.status !== overColumn.id) {
        await updateTaskStatus(activeTaskItem.id, overColumn.id);
      }
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && activeTaskItem.status !== overTask.status) {
        await updateTaskStatus(activeTaskItem.id, overTask.status);
      }
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.updateTaskStatus(taskId, status);
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: status as TaskStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const { task } = await api.createTask(taskData);
      setTasks(prev => [task, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return;
    
    try {
      const { task } = await api.updateTask(editingTask.id, taskData);
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? task : t))
      );
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (isLoading) {
    return <TasksPageSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">Tasks</h1>
          <p className="text-sm text-text-secondary hidden sm:block">Manage your tasks in a Kanban board</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary text-sm"
        >
          + New Task
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
            >
              <SortableContext
                items={getTasksByStatus(column.id).map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {getTasksByStatus(column.id).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </SortableContext>
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      {(showModal || editingTask) && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
