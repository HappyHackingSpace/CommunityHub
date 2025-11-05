// Tasks List Page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  useAssignedToMeTasks,
  useAssignedByMeTasks,
  usePublicTasks,
} from '@/features/tasks/hooks/useTasks';
import { TaskList } from '@/features/tasks/components/TaskList';
import { PageHeader } from '@/shared/components/common/PageHeader';
import type { TaskResponse, TaskSearchParams } from '@/features/tasks/types/task.types';
import { TaskStatus, TaskPriority } from '@/features/tasks/types/task.types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('assigned-to-me');
  const [searchParams, setSearchParams] = useState<TaskSearchParams>({});

  // Fetch tasks based on active tab
  const assignedToMe = useAssignedToMeTasks(activeTab === 'assigned-to-me' ? searchParams : {});
  const assignedByMe = useAssignedByMeTasks(activeTab === 'assigned-by-me' ? searchParams : {});
  const publicTasks = usePublicTasks(activeTab === 'public' ? searchParams : {});

  const handleTaskClick = (task: TaskResponse) => {
    router.push(`/tasks/${task.id}`);
  };

  const handleSearch = (search: string) => {
    setSearchParams((prev) => ({ ...prev, search }));
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as TaskStatus),
    }));
  };

  const handlePriorityFilter = (priority: string) => {
    setSearchParams((prev) => ({
      ...prev,
      priority: priority === 'all' ? undefined : (priority as TaskPriority),
    }));
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'assigned-to-me':
        return assignedToMe;
      case 'assigned-by-me':
        return assignedByMe;
      case 'public':
        return publicTasks;
      default:
        return assignedToMe;
    }
  };

  const currentData = getCurrentData();
  const tasks = currentData.data?.data || [];
  const isLoading = currentData.isLoading;

  return (
    <div>
      <PageHeader
        title="Görevler"
        description="Görevlerini görüntüle ve yönet"
        actions={
          <Button onClick={() => router.push('/tasks/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Görev
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Görev ara..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={handleStatusFilter} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value={TaskStatus.TODO}>Yapılacak</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>Devam Ediyor</SelectItem>
            <SelectItem value={TaskStatus.DONE}>Tamamlandı</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handlePriorityFilter} defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Öncelik" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Öncelikler</SelectItem>
            <SelectItem value={TaskPriority.LOW}>Düşük</SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>Orta</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>Yüksek</SelectItem>
            <SelectItem value={TaskPriority.URGENT}>Acil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="assigned-to-me">
            Bana Atanan ({assignedToMe.data?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="assigned-by-me">
            Benim Atadığım ({assignedByMe.data?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="public">
            Herkese Açık ({publicTasks.data?.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned-to-me">
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={handleTaskClick}
            emptyTitle="Sana atanan görev yok"
            emptyMessage="Henüz sana atanmış bir görev bulunmuyor."
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="assigned-by-me">
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={handleTaskClick}
            emptyTitle="Atadığın görev yok"
            emptyMessage="Henüz kimseye görev atamadın."
            emptyActionLabel="Görev Oluştur"
            onEmptyAction={() => router.push('/tasks/new')}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="public">
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={handleTaskClick}
            emptyTitle="Herkese açık görev yok"
            emptyMessage="Henüz herkese açık görev bulunmuyor."
            currentUserId={user?.id}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {currentData.data && currentData.data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={currentData.data.page === 1}
            onClick={() =>
              setSearchParams((prev) => ({ ...prev, page: currentData.data!.page - 1 }))
            }
          >
            Önceki
          </Button>
          <span className="flex items-center px-4">
            Sayfa {currentData.data.page} / {currentData.data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentData.data.page === currentData.data.totalPages}
            onClick={() =>
              setSearchParams((prev) => ({ ...prev, page: currentData.data!.page + 1 }))
            }
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
