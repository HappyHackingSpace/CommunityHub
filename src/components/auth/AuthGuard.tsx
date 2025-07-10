'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'club_leader' | 'member';
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, initialized } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

useEffect(() => {
  console.log('AuthGuard: isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  
  // Loading bitene kadar bekle
 if (isLoading || !initialized) return;
  
  // Redirect yapıldıysa tekrar yapme
  if (hasRedirected.current) return;
  
  // Authentication kontrolü
  if (!isAuthenticated) {
    console.log('AuthGuard: Not authenticated, redirecting to login');
    hasRedirected.current = true;
    setTimeout(() => {
      router.replace('/login');
    }, 100);
    return;
  }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  const checkRole = (userRole: string, required: string): boolean => {
    const roleHierarchy = {
      admin: 3,
      club_leader: 2,
      member: 1
    };

    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
           roleHierarchy[required as keyof typeof roleHierarchy];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !checkRole(user.role, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}