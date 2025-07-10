'use client';

import { useAuth } from '@/hooks/useAuth';
import { useClubStore } from '@/store';
import { useNotificationStore } from '@/store/notificationStore';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();
  const { fetchClubs } = useClubStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (user) {
      fetchClubs();
      fetchNotifications(user.id);
    }
  }, [user, fetchClubs, fetchNotifications]);

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