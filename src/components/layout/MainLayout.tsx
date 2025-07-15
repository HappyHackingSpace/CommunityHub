// src/components/layout/MainLayout.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isAuthenticated, initialized } = useAuth();
  const { fetchClubs, clubs } = useClubStore();
  const { fetchNotifications, notifications } = useNotificationStore();
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    // Only fetch data when user is fully authenticated and app is initialized
    if (isAuthenticated && initialized && user && !hasLoadedDataRef.current) {
      hasLoadedDataRef.current = true;
      
      // Fetch clubs (with built-in caching)
      fetchClubs();
      
      // Fetch notifications if needed
      if (notifications.length === 0) {
        fetchNotifications(user.id);
      }
    }
    
    // Reset flag when user logs out
    if (!isAuthenticated) {
      hasLoadedDataRef.current = false;
    }
  }, [isAuthenticated, initialized, user, fetchClubs, fetchNotifications, notifications.length]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}