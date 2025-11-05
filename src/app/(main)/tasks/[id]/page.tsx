// Task Detail Page

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  useTask,
  useDeleteTask,
  useUpdateTaskStatus,
  useAddComment,
  useAddSubtask,
  useUpdateSubtaskStatus,
} from '@/features/tasks/hooks/useTasks';
import { TaskStatus, TaskPriority } from '@/features/tasks/types/task.types';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { user } = useAuthStore();
  const { data: task, isLoading, error } = useTask(taskId);
  const deleteMutation = useDeleteTask();
  const updateStatusMutation = useUpdateTaskStatus(taskId);
  const addCommentMutation = useAddComment(taskId);
  const addSubtaskMutation = useAddSubtask(taskId);

  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  const handleDelete = () => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        router.push('/tasks');
      },
    });
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateStatusMutation.mutate({ status });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addCommentMutation.mutate(
      { content: newComment },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    addSubtaskMutation.mutate(
      { title: newSubtask },
      {
        onSuccess: () => {
          setNewSubtask('');
        },
      }
    );
  };

  const handleSubtaskStatusToggle = (subtaskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    const updateSubtaskMutation = useUpdateSubtaskStatus(subtaskId, taskId);
    updateSubtaskMutation.mutate({ status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Görev detayları yükleniyor..." />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div>
        <Button variant="ghost" onClick={() => router.push('/tasks')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Görevlere Dön
        </Button>
        <ErrorMessage message={error?.message || 'Görev bulunamadı'} />
      </div>
    );
  }

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

  const isAssigner = user?.id === task.assignerId;
  const status = statusConfig[task.status as TaskStatus];
  const priority = priorityConfig[task.priority as TaskPriority];

  return (
    <div>
      <Button variant="ghost" onClick={() => router.push('/tasks')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Görevlere Dön
      </Button>

      <PageHeader
        title={task.title}
        actions={
          <div className="flex gap-2">
            {isAssigner && (
              <>
                <Button variant="outline" onClick={() => router.push(`/tasks/${taskId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge className={priority.className}>{priority.label}</Badge>
                  <Badge className={status.className}>{status.label}</Badge>
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Change */}
              <Select value={task.status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.TODO}>Yapılacak</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>Devam Ediyor</SelectItem>
                  <SelectItem value={TaskStatus.DONE}>Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {task.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Açıklama</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Son Tarih: {format(new Date(task.dueDate), 'PPP', { locale: tr })}</span>
              </div>
            )}
          </Card>

          {/* Subtasks */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Alt Görevler ({task.subtasks?.filter((st: any) => st.status === TaskStatus.DONE).length || 0}/
              {task.subtasks?.length || 0})
            </h3>

            <div className="space-y-3 mb-4">
              {task.subtasks?.map((subtask: any) => (
                <div key={subtask.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={subtask.status === TaskStatus.DONE}
                    onCheckedChange={() => handleSubtaskStatusToggle(subtask.id, subtask.status)}
                  />
                  <span className={subtask.status === TaskStatus.DONE ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <Input
                placeholder="Yeni alt görev ekle..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
              />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Yorumlar ({task.comments?.length || 0})
            </h3>

            <div className="space-y-4 mb-4">
              {task.comments?.map((comment: any) => (
                <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.userId}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.createdAt), 'PPp', { locale: tr })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                placeholder="Yorum ekle..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button type="submit" size="sm">
                Yorum Ekle
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Görev Detayları</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Atayan</p>
                <p className="font-medium">{task.assignerId}</p>
              </div>

              {task.assigneeId && (
                <div>
                  <p className="text-gray-500">Atanan</p>
                  <p className="font-medium">{task.assigneeId}</p>
                </div>
              )}

              {task.clubId && (
                <div>
                  <p className="text-gray-500">Kulüp</p>
                  <p className="font-medium">{task.clubId}</p>
                </div>
              )}

              <div>
                <p className="text-gray-500">Oluşturulma</p>
                <p className="font-medium">{format(new Date(task.createdAt), 'PPP', { locale: tr })}</p>
              </div>

              <div>
                <p className="text-gray-500">Son Güncelleme</p>
                <p className="font-medium">{format(new Date(task.updatedAt), 'PPP', { locale: tr })}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
