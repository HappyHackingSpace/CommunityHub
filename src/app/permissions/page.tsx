
import PermissionManager from '@/components/admin/PermissionManager';
import MainLayout from '@/components/layout/MainLayout';


export default function PermissionsPage() {
  return (

      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yetki Yönetimi</h1>
            <p className="text-gray-600">Kullanıcı yetkilerini düzenleyin</p>
          </div>
          <PermissionManager />
        </div>
      </MainLayout>

  );
}