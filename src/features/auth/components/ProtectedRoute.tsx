// Protected Route Component - Giriş yapılmamışsa login'e yönlendirir

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import { Loader2 } from 'lucide-react';
import type { RoleType } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleType[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, token } = useAuthStore();

  useEffect(() => {
    // Token yoksa login'e yönlendir
    if (!isLoading && !token) {
      router.replace('/login');
      return;
    }

    // Rol kontrolü
    if (requiredRoles && requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.some((role) =>
        user.roles.includes(role)
      );

      if (!hasRequiredRole) {
        router.replace('/dashboard'); // Yetkisiz kullanıcıyı dashboard'a yönlendir
      }
    }
  }, [isAuthenticated, isLoading, user, token, requiredRoles, router]);

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Rol kontrolü - yetkisiz kullanıcı
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Yetkisiz Erişim
            </h2>
            <p className="text-gray-600 mb-4">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:underline"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
