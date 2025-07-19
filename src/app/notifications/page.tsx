
import {MainLayout} from '@/components/layout/MainLayout';
import NotificationPage from '@/components/notification/NotificationPage';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function NotificationsPage() {
  // 🔒 Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user || error) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <NotificationPage />
    </MainLayout>
  );
}