// src/app/settings/page.tsx
import MainLayout from '@/components/layout/MainLayout';
import PermissionGuard from '@/components/admin/PermissionGuard';

export default function SettingsPage() {
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