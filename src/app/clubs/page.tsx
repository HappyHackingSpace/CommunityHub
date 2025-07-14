import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import ClubList from '@/components/club/ClubList';
import MemberList from '@/components/club/members/MemberList';

export default function ClubsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <ClubList />
        <MemberList />
      </MainLayout>
    </AuthGuard>
  );
}