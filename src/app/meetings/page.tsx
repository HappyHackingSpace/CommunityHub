import AuthGuard from '@/components/auth/AuthGuard';
import MainLayout from '@/components/layout/MainLayout';
import MeetingsPageContent from '@/components/meeting/MeetingsPageContent';


export default function MeetingsPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <MeetingsPageContent />
      </MainLayout>
    </AuthGuard>
  );
}