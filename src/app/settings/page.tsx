// src/app/settings/page.tsx
import {MainLayout} from '@/components/layout/MainLayout';
import PermissionGuard from '@/components/admin/PermissionGuard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  // 🔒 Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <PermissionGuard allowedRoles={['admin', 'club_leader']}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-gray-600">Sistem ayarlarını buradan yapabilirsiniz</p>
          </div>
          {/* Settings content */}
        </div>
      </PermissionGuard>
    </MainLayout>
  );
}