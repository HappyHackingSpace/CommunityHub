import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import TaskList from '@/components/task/TaskList';

export default function TasksPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Görevlerim</h1>
            <p className="text-gray-600">Size atanan ve oluşturduğunuz görevleri görüntüleyin</p>
          </div>
          <TaskList />
        </div>
      </MainLayout>
    </AuthGuard>
  );
}