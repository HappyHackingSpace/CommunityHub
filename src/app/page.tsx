// src/app/page.tsx - FIXED: No More Redirect Loops!
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, initialized, error } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect when auth is fully initialized and we're not already redirecting
    if (!initialized || isLoading || redirecting) return;
    
    setRedirecting(true);
    
    // Simple, one-time redirect logic
    if (isAuthenticated) {
      console.log('✅ HomePage: User authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    } else {
      console.log('✅ HomePage: User not authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, initialized, isLoading, router, redirecting]);

  // Show error if authentication failed
  if (error && initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Community Platform</h1>
          <p className="text-red-600 mb-4">Giriş sistemi hatası: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Community Platform</h1>
        <p className="text-gray-600">
          {!initialized ? 'Başlatılıyor...' : 
           isLoading ? 'Kullanıcı bilgileri kontrol ediliyor...' : 
           'Yönlendiriliyor...'}
        </p>
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400">
            Debug: initialized={String(initialized)}, loading={String(isLoading)}, auth={String(isAuthenticated)}
          </div>
        )}
      </div>
    </div>
  );
}