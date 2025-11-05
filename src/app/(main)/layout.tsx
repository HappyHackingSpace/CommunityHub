'use client';

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { MainLayout } from '@/shared/components/layout/MainLayout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}
