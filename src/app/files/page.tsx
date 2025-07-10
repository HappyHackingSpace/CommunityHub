import AuthGuard from '@/components/auth/AuthGuard';
import FilesPageContent from '@/components/file/FilesPageContent';
import MainLayout from '@/components/layout/MainLayout';


export default function FilesPage() {
  return (
    <AuthGuard>
      <MainLayout>
        <FilesPageContent />
      </MainLayout>
    </AuthGuard>
  );
}