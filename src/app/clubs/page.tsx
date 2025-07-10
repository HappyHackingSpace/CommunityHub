import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import ClubList from '@/components/club/ClubList';

export default function ClubsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ClubList />
      </MainLayout>
    </AuthGuard>
  );
}