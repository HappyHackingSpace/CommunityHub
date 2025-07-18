// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Auth sistem hazır olana kadar bekle
    if (!initialized || isLoading) return;
    
    // Authenticated ise dashboard'a yönlendir
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      // Değilse login'e yönlendir
      router.replace('/login');
    }
  }, [isAuthenticated, initialized, isLoading, router]);

  // Loading göster
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Community Platform</h1>
        <p className="text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}