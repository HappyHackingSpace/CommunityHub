import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { TaskResponse } from '../types/task.types';
import { TaskStatus, TaskPriority } from '../types/task.types';

interface TaskCardProps {
  task: TaskResponse;
  onClick?: () => void;
  currentUserId?: string;
}

export function TaskCard({ task, onClick, currentUserId }: TaskCardProps) {
  const statusConfig = {
    [TaskStatus.TODO]: { label: 'Yapılacak', className: 'bg-gray-100 text-gray-800' },
    [TaskStatus.IN_PROGRESS]: { label: 'Devam Ediyor', className: 'bg-blue-100 text-blue-800' },
    [TaskStatus.DONE]: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
  };

  const priorityConfig = {
    [TaskPriority.LOW]: { label: 'Düşük', className: 'bg-gray-100 text-gray-600' },
    [TaskPriority.MEDIUM]: { label: 'Orta', className: 'bg-blue-100 text-blue-700' },
    [TaskPriority.HIGH]: { label: 'Yüksek', className: 'bg-orange-100 text-orange-700' },
    [TaskPriority.URGENT]: { label: 'Acil', className: 'bg-red-100 text-red-700' },
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const isAssignedToMe = currentUserId === task.assigneeId;
  const isAssignedByMe = currentUserId === task.assignerId;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

  return (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Badge className={priority.className}>{priority.label}</Badge>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {isOverdue && <AlertCircle className="h-4 w-4" />}
              <Calendar className="h-4 w-4" />
              {format(new Date(task.dueDate), 'dd MMM', { locale: tr })}
            </span>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-xs">
              {task.subtasks.filter(st => st.status === TaskStatus.DONE).length}/{task.subtasks.length} alt görev
            </span>
          )}
          {task.comments && task.comments.length > 0 && (
            <span className="text-xs">{task.comments.length} yorum</span>
          )}
        </div>

        <div className="text-xs">
          {isAssignedToMe && <span className="text-blue-600">Bana atandı</span>}
          {isAssignedByMe && <span className="text-purple-600">Benim atadığım</span>}
        </div>
      </div>
    </Card>
  );
}
