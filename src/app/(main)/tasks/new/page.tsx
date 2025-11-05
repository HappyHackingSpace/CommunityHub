// New Task Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTask } from '@/features/tasks/hooks/useTasks';
import { TaskPriority } from '@/features/tasks/types/task.types';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function NewTaskPage() {
  const router = useRouter();
  const createMutation = useCreateTask();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    assigneeId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      assigneeId: formData.assigneeId || undefined,
    };

    createMutation.mutate(taskData, {
      onSuccess: (task) => {
        router.push(`/tasks/${task.id}`);
      },
    });
  };

  return (
    <div>
      <Button variant="ghost" onClick={() => router.push('/tasks')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Görevlere Dön
      </Button>

      <PageHeader title="Yeni Görev Oluştur" description="Yeni bir görev oluştur ve atama yap" />

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Görev başlığı"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <Textarea
              placeholder="Görev açıklaması..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öncelik <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskPriority.LOW}>Düşük</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Orta</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>Yüksek</SelectItem>
                <SelectItem value={TaskPriority.URGENT}>Acil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Son Tarih</label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Atanacak Kişi (ID)</label>
            <Input
              placeholder="Kullanıcı ID'si (opsiyonel)"
              value={formData.assigneeId}
              onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Şu an için kullanıcı ID'si girmeniz gerekiyor. İleride kullanıcı seçici eklenecek.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Oluşturuluyor...' : 'Görev Oluştur'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/tasks')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
