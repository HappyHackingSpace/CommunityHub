
import {MainLayout} from '@/components/layout/MainLayout';
import TaskList from '@/components/task/TaskList';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  // 🔒 Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Görevlerim</h1>
          <p className="text-gray-600">Size atanan ve oluşturduğunuz görevleri görüntüleyin</p>
        </div>
        <TaskList />
      </div>
    </MainLayout>
  );
}