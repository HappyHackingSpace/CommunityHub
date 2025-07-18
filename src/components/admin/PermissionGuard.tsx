// src/components/admin/PermissionGuard.tsx - YENİ COMPONENT OLUŞTUR
'use client';

import { useAuth } from '@/hooks/useAuth';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'club_leader' | 'member';
  allowedRoles?: ('admin' | 'club_leader' | 'member')[];
}

export default function PermissionGuard({ 
  children, 
  requiredRole,
  allowedRoles 
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600">Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.</p>
        </div>
      </div>
    );
  }

  // ✅ Flexible role checking
  let hasAccess = false;

  if (allowedRoles) {
    // Multiple roles allowed
    hasAccess = allowedRoles.includes(user.role);
  } else if (requiredRole) {
    // Single role + admin always has access
    hasAccess = user.role === requiredRole || user.role === 'admin';
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
          <p className="text-sm text-gray-500 mt-2">
            Mevcut rol: {user.role === 'admin' ? 'Yönetici' : user.role === 'club_leader' ? 'Kulüp Lideri' : 'Üye'}
          </p>
          <p className="text-sm text-gray-500">
            Gerekli rol: {requiredRole ? (requiredRole === 'admin' ? 'Yönetici' : 'Kulüp Lideri+') : allowedRoles?.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}