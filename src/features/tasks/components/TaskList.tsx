import { TaskCard } from './TaskCard';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { CheckSquare } from 'lucide-react';
import type { TaskResponse } from '../types/task.types';

interface TaskListProps {
  tasks: TaskResponse[];
  isLoading: boolean;
  onTaskClick: (task: TaskResponse) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  currentUserId?: string;
}

export function TaskList({
  tasks,
  isLoading,
  onTaskClick,
  emptyTitle = 'Henüz görev yok',
  emptyMessage = 'İlk görevini oluştur veya sana atanan görevleri gör.',
  emptyActionLabel,
  onEmptyAction,
  currentUserId,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Görevler yükleniyor..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
