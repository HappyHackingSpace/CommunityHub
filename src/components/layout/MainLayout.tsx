// src/components/layout/MainLayout.tsx - FIXED: Using Simple Stores!
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useClubsApi } from '@/hooks/useSimpleApi';
import { useEffect, useRef, memo, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

// 🚀 Memoized layout components
const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, initialized } = useAuth();
  
  console.log('🏠 MainLayout render:', { isAuthenticated, initialized, user: user?.email });

  // Don't render layout if not authenticated or not initialized
  if (!initialized) {
    console.log('⏳ MainLayout: Waiting for auth initialization...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sistem başlatılıyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 MainLayout: User not authenticated, should redirect to login');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Giriş sayfasına yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  console.log('✅ MainLayout: Rendering layout for authenticated user:', user?.email);

  return (
    <div className="flex h-screen bg-gray-50">
      <MemoizedSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MemoizedHeader />
        <main className="flex-1 overflow-auto">
          <div className="h-full px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
         

 















