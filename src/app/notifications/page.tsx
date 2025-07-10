import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import NotificationPage from '@/components/notification/NotificationPage';


export default function NotificationsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <NotificationPage />
      </MainLayout>
    </AuthGuard>
  );
}